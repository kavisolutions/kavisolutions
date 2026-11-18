import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { rm } from "node:fs/promises";
import * as QRCode from "qrcode";

import { env } from "@/config/env";

type ConnectionUpdate = {
  connection?: "connecting" | "open" | "close";
  qr?: string;
  lastDisconnect?: {
    error?: {
      message?: string;
      output?: { statusCode?: number };
    };
  };
};

type WhatsAppSocket = {
  ev: {
    on: (event: string, handler: (payload: unknown) => void) => void;
  };
  sendMessage: (jid: string, content: { text: string }) => Promise<unknown>;
  logout: () => Promise<void>;
  end: (error?: Error) => void;
  user?: { id?: string; name?: string };
};

type BaileysModule = {
  default: (config: Record<string, unknown>) => WhatsAppSocket;
  useMultiFileAuthState: (directory: string) => Promise<{
    state: unknown;
    saveCreds: () => Promise<void>;
  }>;
  DisconnectReason: { loggedOut: number };
  Browsers: { ubuntu: (name: string) => unknown };
  fetchLatestBaileysVersion: () => Promise<{ version: number[] }>;
};

type WhatsAppStatus =
  | "disabled"
  | "disconnected"
  | "connecting"
  | "qr"
  | "open"
  | "logged_out"
  | "error";

const loadBaileys = new Function(
  "specifier",
  "return import(specifier)",
) as (specifier: string) => Promise<BaileysModule>;

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private socket: WhatsAppSocket | null = null;
  private statusValue: WhatsAppStatus = env.whatsappEnabled
    ? "disconnected"
    : "disabled";
  private qrDataUrl: string | null = null;
  private lastError = "";
  private connectedUser = "";
  private starting = false;
  private manuallyStopped = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectedAt: string | null = null;

  async onModuleInit(): Promise<void> {
    if (!env.whatsappEnabled) return;
    try {
      await this.connect();
    } catch (error) {
      this.statusValue = "error";
      this.lastError = this.message(error);
      this.logger.warn(`WhatsApp auto-connect failed: ${this.lastError}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.clearReconnect();
    if (this.socket) {
      try {
        this.socket.end(undefined);
      } catch {
        // socket may already be closed
      }
      this.socket = null;
    }
  }

  status() {
    return {
      enabled: env.whatsappEnabled,
      status: this.statusValue,
      qrDataUrl: this.statusValue === "qr" ? this.qrDataUrl : null,
      user: this.connectedUser,
      lastError: this.lastError,
      connectedAt: this.connectedAt,
      authDir: env.BAILEYS_AUTH_DIR,
      countryCode: env.WHATSAPP_COUNTRY_CODE,
    };
  }

  async connect(): Promise<ReturnType<WhatsAppService["status"]>> {
    if (this.starting || this.statusValue === "open") return this.status();
    this.starting = true;
    this.manuallyStopped = false;
    this.statusValue = "connecting";
    this.lastError = "";
    this.qrDataUrl = null;

    try {
      const baileys = await loadBaileys("@whiskeysockets/baileys");
      const { state, saveCreds } = await baileys.useMultiFileAuthState(
        env.BAILEYS_AUTH_DIR,
      );
      const { version } = await baileys.fetchLatestBaileysVersion();

      const socket = baileys.default({
        auth: state,
        version,
        browser: baileys.Browsers.ubuntu("Kavi Fellowship"),
        syncFullHistory: false,
        markOnlineOnConnect: false,
        connectTimeoutMs: 60_000,
        keepAliveIntervalMs: 25_000,
      });
      this.socket = socket;

      socket.ev.on("creds.update", () => {
        void saveCreds().catch((error: unknown) => {
          this.logger.error(`WhatsApp credential save failed: ${this.message(error)}`);
        });
      });

      socket.ev.on("connection.update", (payload) => {
        void this.handleConnectionUpdate(baileys, payload as ConnectionUpdate);
      });

      return this.status();
    } catch (error) {
      this.statusValue = "error";
      this.lastError = this.message(error);
      this.socket = null;
      throw error;
    } finally {
      this.starting = false;
    }
  }

  async logout(): Promise<{ ok: true }> {
    this.manuallyStopped = true;
    this.clearReconnect();
    const socket = this.socket;
    this.socket = null;

    if (socket) {
      try {
        await socket.logout();
      } catch {
        // The session may already be invalid; still clear local state.
      }
      try {
        socket.end(undefined);
      } catch {
        // ignore
      }
    }

    try {
      await rm(env.BAILEYS_AUTH_DIR, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Could not remove WhatsApp auth directory: ${this.message(error)}`);
    }

    this.statusValue = "logged_out";
    this.qrDataUrl = null;
    this.connectedUser = "";
    this.connectedAt = null;
    this.lastError = "";
    return { ok: true };
  }

  async sendText(to: string, message: string): Promise<{ ok: true; to: string }> {
    if (this.statusValue !== "open" || !this.socket) {
      throw new Error(
        "WhatsApp is not connected. Open the dashboard, connect the device and scan the QR.",
      );
    }

    const jid = this.normalizeNumber(to);
    if (!jid) {
      throw new Error("Enter a valid phone number with country code");
    }

    await this.socket.sendMessage(jid, { text: message });
    return { ok: true, to: jid };
  }

  private async handleConnectionUpdate(
    baileys: BaileysModule,
    update: ConnectionUpdate,
  ): Promise<void> {
    if (update.qr) {
      this.statusValue = "qr";
      try {
        this.qrDataUrl = await QRCode.toDataURL(update.qr, {
          width: 320,
          margin: 1,
          color: { dark: "#0B1220", light: "#FFFFFF" },
        });
      } catch (error) {
        this.qrDataUrl = null;
        this.lastError = `QR generation failed: ${this.message(error)}`;
      }
      return;
    }

    if (update.connection === "open") {
      this.statusValue = "open";
      this.qrDataUrl = null;
      this.lastError = "";
      this.connectedAt = new Date().toISOString();
      this.connectedUser = this.socket?.user?.id ?? "";
      this.reconnectAttempts = 0;
      this.logger.log("WhatsApp connected");
      return;
    }

    if (update.connection === "close") {
      const statusCode = update.lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === baileys.DisconnectReason.loggedOut;
      this.statusValue = loggedOut ? "logged_out" : "disconnected";
      this.connectedUser = "";
      this.connectedAt = null;
      this.lastError =
        update.lastDisconnect?.error?.message ??
        (loggedOut ? "Device was logged out" : "Connection closed");
      this.socket = null;

      if (!this.manuallyStopped && !loggedOut) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    this.reconnectAttempts += 1;
    const delay = Math.min(60_000, 5_000 * this.reconnectAttempts);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect().catch((error: unknown) => {
        this.logger.warn(`WhatsApp reconnect failed: ${this.message(error)}`);
      });
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private normalizeNumber(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;

    let number = digits;
    if (number.startsWith("0")) number = number.slice(1);
    if (number.length === 10) number = `${env.WHATSAPP_COUNTRY_CODE}${number}`;
    if (number.length < 10 || number.length > 15) return null;
    return `${number}@s.whatsapp.net`;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
