import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

import { env } from "@/config/env";
import type {
  DraftMediaDto,
  ImportDriveMediaDto,
  UpdateMediaDto,
  UploadMediaDto,
} from "@/modules/social/dto/social.dto";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export type SocialStatus = {
  configured: boolean;
  reachable?: boolean;
  error?: string;
  [key: string]: unknown;
};

/* Thin authenticated proxy to the social-agent sidecar. The browser never sees
   SOCIAL_AGENT_ADMIN_TOKEN or the sidecar's URL — it only talks to this API. */
@Injectable()
export class SocialService {
  private readonly base = (env.SOCIAL_AGENT_URL ?? "").replace(/\/+$/, "");
  private readonly token = env.SOCIAL_AGENT_ADMIN_TOKEN ?? "";

  get configured(): boolean {
    return Boolean(this.base && this.token);
  }

  async status(): Promise<SocialStatus> {
    if (!this.configured) return { configured: false };

    try {
      const data = await this.request<Record<string, unknown>>("/admin/status", {}, 5_000);
      return { configured: true, reachable: true, ...data };
    } catch (error) {
      return {
        configured: true,
        reachable: false,
        error: errorMessage(error),
      };
    }
  }

  async listMedia(params: { from?: string; to?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.status) query.set("status", params.status);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request(`/admin/media${suffix}`);
  }

  async importDrive(body: ImportDriveMediaDto) {
    return this.request("/admin/media/import/drive", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async importJob(jobId: string) {
    return this.request(`/admin/media/import/${encodeURIComponent(jobId)}`);
  }

  async upload(body: UploadMediaDto) {
    /* Decode once here so an oversized payload is rejected before it reaches
       the sidecar, and so the sidecar never has to trust the browser. */
    const buffer = Buffer.from(body.dataBase64.replace(/^data:[^;]+;base64,/, ""), "base64");
    if (buffer.byteLength === 0) throw new HttpException("Empty image", 400);
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new HttpException("Image larger than 15MB", 413);
    }

    return this.request(
      "/admin/media/upload",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: body.fileName,
          date: body.date,
          topicHint: body.topicHint,
          dataBase64: buffer.toString("base64"),
        }),
      },
      60_000,
    );
  }

  async updateMedia(id: number, body: UpdateMediaDto) {
    return this.request(`/admin/media/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async removeMedia(id: number) {
    return this.request(`/admin/media/${id}`, { method: "DELETE" });
  }

  async draftMedia(id: number, body: DraftMediaDto) {
    return this.request(
      `/admin/media/${id}/draft`,
      { method: "POST", body: JSON.stringify(body) },
      180_000,
    );
  }

  async runDue() {
    return this.request("/admin/media/run-due", { method: "POST", body: "{}" }, 180_000);
  }

  async posts() {
    return this.request("/admin/posts");
  }

  async accounts() {
    return this.request("/admin/accounts");
  }

  async publish(postId: number) {
    return this.request(
      `/admin/publish/${postId}`,
      { method: "POST", body: "{}" },
      180_000,
    );
  }

  async image(id: number): Promise<{ body: Buffer; contentType: string }> {
    const response = await this.raw(`/admin/media/${id}/image`, {}, 30_000);
    return {
      body: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") ?? "image/jpeg",
    };
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = 30_000,
  ): Promise<T> {
    const response = await this.raw(path, init, timeoutMs);
    return (await response.json()) as T;
  }

  private async raw(
    path: string,
    init: RequestInit = {},
    timeoutMs = 30_000,
  ): Promise<Response> {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        "Social agent is not configured. Set SOCIAL_AGENT_URL and SOCIAL_AGENT_ADMIN_TOKEN.",
      );
    }

    let response: Response;
    try {
      response = await fetch(`${this.base}${path}`, {
        ...init,
        headers: {
          "x-admin-token": this.token,
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...init.headers,
        },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch (error) {
      throw new HttpException(
        `Social agent unreachable: ${errorMessage(error)}`,
        502,
      );
    }

    if (!response.ok) {
      const text = await response.text();
      let message = text;
      try {
        const parsed = JSON.parse(text) as { error?: string; message?: string | string[] };
        message =
          parsed.error ??
          (Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message) ??
          text;
      } catch {
        // keep the raw body
      }
      throw new HttpException(message.slice(0, 500) || response.statusText, response.status);
    }

    return response;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError" ? "request timed out" : error.message;
  }
  return String(error);
}
