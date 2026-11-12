/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  SkipForward,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type MediaItem = {
  id: number;
  scheduledDate: string;
  source: string;
  fileName: string;
  localFile: string;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  description: string | null;
  topicHint: string | null;
  status: string;
  postId: number | null;
  error: string | null;
  updatedAt: number;
};

type ImportJob = {
  id: string;
  status: "listing" | "downloading" | "done" | "failed";
  total: number;
  processed: number;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  message: string;
};

type AgentStatus = {
  configured: boolean;
  reachable?: boolean;
  error?: string;
  timezone?: string;
  media?: {
    counts?: Record<string, number>;
    schedulerEnabled?: boolean;
    schedule?: string;
    autoPublish?: boolean;
    visionProvider?: string;
    aspect?: string;
  };
  drive?: { configured?: boolean };
  telegram?: boolean;
  accounts?: Array<{ platform: string; accountName?: string | null; accountId: string; expiresAt: number }>;
};

type PostRow = {
  id: number;
  topic: string;
  caption: string;
  targets: string;
  status: string;
  created_at: number;
  published_at: number | null;
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  drafted: "Draft ready",
  published: "Published",
  skipped: "Skipped",
  missed: "Missed",
  failed: "Failed",
};

const STATUS_TONES: Record<string, string> = {
  planned: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  drafted: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  published: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  skipped: "border-border bg-muted text-muted-foreground",
  missed: "border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  failed: "border-destructive/25 bg-destructive/10 text-destructive",
};

const today = () => new Date().toISOString().slice(0, 10);

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const monthRange = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year ?? 2000, monthNumber ?? 1, 0)).getUTCDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string; message?: string | string[] })
    | null;

  if (!res.ok) {
    const message = data?.error ?? data?.message;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : message ?? `Request failed (${res.status})`,
    );
  }
  return data as T;
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function SocialPanel() {
  const [agent, setAgent] = useState<AgentStatus | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [month, setMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [driveUrl, setDriveUrl] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [topicHint, setTopicHint] = useState("");
  const [job, setJob] = useState<ImportJob | null>(null);
  const [startingImport, setStartingImport] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const range = useMemo(() => monthRange(month), [month]);

  const load = useCallback(async () => {
    try {
      const query = new URLSearchParams({ from: range.from, to: range.to });
      if (statusFilter !== "all") query.set("status", statusFilter);

      const [statusData, mediaData, postsData] = await Promise.all([
        api<AgentStatus>("/api/admin/social/status"),
        api<{ items: MediaItem[] }>(`/api/admin/social/media?${query.toString()}`),
        api<{ posts: PostRow[] }>("/api/admin/social/posts").catch(() => ({ posts: [] })),
      ]);

      setAgent(statusData);
      setMedia(mediaData.items ?? []);
      setPosts(postsData.posts ?? []);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after awaits
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  /* Poll an import job until it finishes, then refresh the month. */
  useEffect(() => {
    if (!job || job.status === "done" || job.status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const data = await api<{ job: ImportJob }>(
          `/api/admin/social/media/import/${job.id}`,
        );
        setJob(data.job);
        if (data.job.status === "done" || data.job.status === "failed") {
          await load();
          setNotice(data.job.message);
        }
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : String(pollError));
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [job, load]);

  const run = async (id: number, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    setError("");
    try {
      await action();
      await load();
      setNotice(success);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : String(actionError));
    } finally {
      setBusyId(null);
    }
  };

  const startImport = async () => {
    if (!driveUrl.trim()) return;
    setStartingImport(true);
    setError("");
    setJob(null);
    try {
      const data = await api<{ job: ImportJob }>("/api/admin/social/media/import/drive", {
        method: "POST",
        body: JSON.stringify({
          folderUrl: driveUrl.trim(),
          startDate,
          topicHint: topicHint.trim() || undefined,
        }),
      });
      setJob(data.job);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : String(importError));
    } finally {
      setStartingImport(false);
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    let uploaded = 0;

    for (const file of Array.from(files)) {
      try {
        await api("/api/admin/social/media/upload", {
          method: "POST",
          body: JSON.stringify({
            fileName: file.name,
            date: startDate,
            topicHint: topicHint.trim() || undefined,
            dataBase64: await readBase64(file),
          }),
        });
        uploaded += 1;
      } catch (uploadError) {
        setError(
          `${file.name}: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
        );
      }
    }

    setUploading(false);
    if (uploaded > 0) {
      await load();
      setNotice(`${uploaded} image${uploaded === 1 ? "" : "s"} added`);
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const counts = agent?.media?.counts ?? {};
  const plannedCount = counts.planned ?? 0;
  const configured = agent?.configured === true;
  const reachable = agent?.reachable === true;

  if (!configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Connect the social agent</CardTitle>
          <CardDescription>
            The sidecar is not configured on this API instance. Add these to the backend
            environment, then restart:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs">
{`SOCIAL_AGENT_URL=http://127.0.0.1:3300
SOCIAL_AGENT_ADMIN_TOKEN=<same value as ADMIN_TOKEN in social-agent/.env>`}
          </pre>
          <p className="text-muted-foreground">
            Then set up Google Drive access and the image scheduler in
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-[11px]">social-agent/.env</code>.
            See <code className="rounded bg-muted px-1 py-0.5 text-[11px]">docs/social-agent.md</code>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Status strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sidecar</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold">
              <span className={`h-2 w-2 rounded-full ${reachable ? "bg-emerald-500" : "bg-destructive"}`} />
              {reachable ? "Reachable" : "Unreachable"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {agent?.media?.schedulerEnabled
                ? `Daily at ${agent.media.schedule} (${agent.timezone})`
                : "Scheduler disabled"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Planned</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{plannedCount}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">images waiting for their date</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Vision</p>
            <p className="mt-1 text-sm font-bold capitalize">{agent?.media?.visionProvider ?? "none"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {agent?.drive?.configured ? "Drive configured" : "Drive not configured"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Publishing</p>
            <p className="mt-1 text-sm font-bold">
              {agent?.media?.autoPublish ? "Auto-publish" : "Telegram approval"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {agent?.telegram ? "Telegram connected" : "Telegram not configured"}
            </p>
          </CardContent>
        </Card>
      </div>

      {!reachable && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          The API cannot reach the sidecar at its configured URL. Check the PM2 process and
          <code className="mx-1 rounded bg-black/10 px-1 py-0.5 text-[11px]">SOCIAL_AGENT_URL</code>.
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Link2 className="h-4 w-4 text-primary" /> Connected accounts
          </CardTitle>
          <CardDescription>
            OAuth links go through the sidecar. Re-authorize LinkedIn before its 60-day token
            expires.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {(agent?.accounts ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No platform connected yet.</p>
          ) : (
            (agent?.accounts ?? []).map((account) => (
              <Badge key={account.platform} variant="outline" className="capitalize">
                {account.platform}: {account.accountName ?? account.accountId} · expires{" "}
                {new Date(account.expiresAt).toISOString().slice(0, 10)}
              </Badge>
            ))
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <a
              href="/auth/linkedin"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Connect LinkedIn
            </a>
            <a
              href="/auth/meta"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Connect Facebook / Instagram
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Drive import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Link2 className="h-4 w-4 text-primary" /> Import from Google Drive
            </CardTitle>
            <CardDescription>
              Paste the folder link. Images are downloaded once and stored by date; the folder is
              not read again at post time. Filenames like <code>2026-01-15.jpg</code> set the date —
              otherwise dates run one per day from the start date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveUrl}
              onChange={(event) => setDriveUrl(event.target.value)}
              disabled={startingImport || (job?.status !== undefined && job.status !== "done" && job.status !== "failed")}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-foreground">
                Start date
                <Input
                  type="date"
                  className="mt-1"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="text-xs font-semibold text-foreground">
                Topic hint (optional)
                <Input
                  className="mt-1"
                  placeholder="e.g. Diwali at the studio"
                  value={topicHint}
                  onChange={(event) => setTopicHint(event.target.value)}
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={startImport} disabled={startingImport || !driveUrl.trim()} className="font-semibold">
                {startingImport ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {startingImport ? "Starting..." : "Import folder"}
              </Button>
              <Button variant="outline" onClick={() => void load()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <ImageIcon className="h-4 w-4 text-primary" /> Add images manually
            </CardTitle>
            <CardDescription>
              Upload one or more images. They take the next free dates starting from the start date
              above, so an upload never overwrites an existing day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="block w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
              onChange={(event) => void uploadFiles(event.target.files)}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              {uploading ? "Uploading..." : "JPEG, PNG, WebP or TIFF. Max 15MB each."}
            </p>
          </CardContent>
        </Card>
      </div>

      {job && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              {job.status === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : job.status === "failed" ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              Import job
            </CardTitle>
            <CardDescription>{job.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Total {job.total || "?"}</Badge>
              <Badge variant="outline">Processed {job.processed}</Badge>
              <Badge variant="outline" className="border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Imported {job.imported}
              </Badge>
              <Badge variant="outline">Updated {job.updated}</Badge>
              {job.failed > 0 && (
                <Badge variant="outline" className="border-destructive/25 bg-destructive/10 text-destructive">
                  Failed {job.failed}
                </Badge>
              )}
            </div>
            {job.errors.length > 0 && (
              <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
                {job.errors.slice(0, 12).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Month list */}
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <CalendarDays className="h-4 w-4 text-primary" /> Calendar
            </CardTitle>
            <CardDescription>
              One image per day. “Draft now” writes the caption from the photo and sends it to
              Telegram for approval.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value || currentMonth())}
              className="h-9 w-[150px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="drafted">Draft ready</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="font-semibold"
              onClick={() =>
                void run(0, () => api("/api/admin/social/media/run-due", { method: "POST", body: "{}" }), "Due images processed")
              }
              disabled={busyId === 0}
            >
              {busyId === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run due
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar...
            </div>
          ) : media.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No images planned for {month}. Import a Drive folder or upload a few images.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {media.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={`/api/admin/social/media/${item.id}/image?v=${item.updatedAt}`}
                      alt={item.fileName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={STATUS_TONES[item.status] ?? ""}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground" title={item.fileName}>
                        {item.fileName}
                      </span>
                      {item.width && item.height && (
                        <span className="text-[11px] text-muted-foreground">
                          {item.width}×{item.height} · {formatBytes(item.size)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="date"
                        className="h-8 w-[145px] text-xs"
                        defaultValue={item.scheduledDate}
                        key={`${item.id}-${item.scheduledDate}`}
                        disabled={busyId === item.id}
                        onBlur={(event) => {
                          const value = event.target.value;
                          if (!value || value === item.scheduledDate) return;
                          void run(
                            item.id,
                            () =>
                              api(`/api/admin/social/media/${item.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ scheduledDate: value }),
                              }),
                            "Date updated",
                          );
                        }}
                      />
                      <Input
                        className="h-8 min-w-[180px] flex-1 text-xs"
                        defaultValue={item.topicHint ?? ""}
                        key={`${item.id}-hint-${item.topicHint ?? ""}`}
                        placeholder="Optional angle for the caption"
                        disabled={busyId === item.id}
                        onBlur={(event) => {
                          const value = event.target.value.trim();
                          if (value === (item.topicHint ?? "")) return;
                          void run(
                            item.id,
                            () =>
                              api(`/api/admin/social/media/${item.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ topicHint: value }),
                              }),
                            "Note saved",
                          );
                        }}
                      />
                    </div>

                    {item.description && (
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">{item.description}</p>
                    )}
                    {item.error && <p className="text-[11px] text-destructive">{item.error}</p>}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {item.postId && (
                      <Badge variant="outline" className="text-[10px]">Post #{item.postId}</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-semibold"
                      disabled={busyId === item.id || item.status === "skipped" || item.status === "published"}
                      onClick={() =>
                        void run(
                          item.id,
                          () =>
                            api(`/api/admin/social/media/${item.id}/draft`, {
                              method: "POST",
                              body: JSON.stringify({ force: false }),
                            }),
                          `Draft created for ${item.scheduledDate}`,
                        )
                      }
                    >
                      {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Draft now
                    </Button>
                    {item.status === "skipped" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === item.id}
                        onClick={() =>
                          void run(
                            item.id,
                            () =>
                              api(`/api/admin/social/media/${item.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: "planned" }),
                              }),
                            "Restored to planned",
                          )
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === item.id}
                        onClick={() =>
                          void run(
                            item.id,
                            () =>
                              api(`/api/admin/social/media/${item.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: "skipped" }),
                              }),
                            "Skipped",
                          )
                        }
                      >
                        <SkipForward className="h-3.5 w-3.5" /> Skip
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      disabled={busyId === item.id}
                      onClick={() => {
                        if (!window.confirm(`Delete the image planned for ${item.scheduledDate}?`)) return;
                        void run(
                          item.id,
                          () => api(`/api/admin/social/media/${item.id}`, { method: "DELETE" }),
                          "Image deleted",
                        );
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Send className="h-4 w-4 text-primary" /> Recent drafts
          </CardTitle>
          <CardDescription>
            The last 50 drafts created by the scheduler, Telegram or this panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No posts drafted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead className="w-[150px]">Targets</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.slice(0, 15).map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-mono text-xs">#{post.id}</TableCell>
                    <TableCell>
                      <p className="line-clamp-2 max-w-xl text-xs text-muted-foreground" title={post.caption}>
                        {post.caption}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{post.targets}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_TONES[post.status] ?? ""}>
                        {STATUS_LABELS[post.status] ?? post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-semibold"
                        disabled={busyId === -post.id || post.status === "published"}
                        onClick={() =>
                          void run(
                            -post.id,
                            () => api(`/api/admin/social/publish/${post.id}`, { method: "POST", body: "{}" }),
                            `Post #${post.id} published`,
                          )
                        }
                      >
                        Publish
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
