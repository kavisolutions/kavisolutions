"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, MessageCircle, RefreshCw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminRequest, jsonBody } from "@/lib/fellowship-admin";

type WhatsAppStatus = {
  enabled: boolean;
  status: string;
  qrDataUrl: string | null;
  user: string;
  lastError: string;
  connectedAt: string | null;
  authDir: string;
  countryCode: string;
};

const tone = (status: string): string => {
  if (status === "open") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
  }
  if (status === "qr" || status === "connecting") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-600";
  }
  if (status === "error") {
    return "border-red-500/30 bg-red-500/10 text-red-600";
  }
  return "border-border bg-muted/40 text-muted-foreground";
};

export default function WhatsAppPanel() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await adminRequest<WhatsAppStatus>("/api/whatsapp/status");
      setStatus(data);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load WhatsApp status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const poll = window.setInterval(() => void load(), 4000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(poll);
    };
  }, [load]);

  const connect = async () => {
    setWorking("connect");
    setError("");
    setNotice("");
    try {
      const data = await adminRequest<WhatsAppStatus>("/api/whatsapp/connect", {
        method: "POST",
      });
      setStatus(data);
      setNotice("Session starting. Scan the QR code with WhatsApp.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start WhatsApp.");
    } finally {
      setWorking("");
    }
  };

  const logout = async () => {
    if (!window.confirm("Log out this WhatsApp device and delete the local session?")) {
      return;
    }
    setWorking("logout");
    setError("");
    setNotice("");
    try {
      await adminRequest("/api/whatsapp/logout", { method: "POST" });
      setNotice("WhatsApp device logged out and session cleared.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not log out.");
    } finally {
      setWorking("");
    }
  };

  const send = async () => {
    if (!to.trim() || !message.trim()) {
      setError("Enter a phone number and message.");
      return;
    }
    setWorking("send");
    setError("");
    setNotice("");
    try {
      const data = await adminRequest<{ ok: boolean; to: string }>(
        "/api/whatsapp/send",
        jsonBody({ to, message }),
      );
      setNotice(`Message sent to ${data.to.replace("@s.whatsapp.net", "")}.`);
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the message.");
    } finally {
      setWorking("");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            WhatsApp (Baileys)
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Unofficial WhatsApp Web session. Use a dedicated number, keep the session
            private and do not use it for legal/POSH communication.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => void connect()}
            disabled={Boolean(working) || status?.status === "open"}
          >
            {working === "connect" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            {status?.status === "open" ? "Connected" : "Connect / show QR"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void logout()}
            disabled={Boolean(working)}
          >
            {working === "logout" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Log out
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(error || notice) && (
          <div
            className={`mb-3 rounded-lg border p-3 text-xs ${
              error
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            }`}
          >
            {error || notice}
          </div>
        )}

        {status && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-medium ${tone(
                status.status,
              )}`}
            >
              {status.status}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {status.user
                ? `Linked device: ${status.user}`
                : "No WhatsApp device linked"}
            </span>
            {status.connectedAt && (
              <span className="text-[10px] text-muted-foreground">
                Connected {new Date(status.connectedAt).toLocaleString()}
              </span>
            )}
            {!status.enabled && (
              <span className="text-[10px] text-amber-600">
                Auto-connect is off. Manual Connect still works.
              </span>
            )}
          </div>
        )}

        {status?.lastError && (
          <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] text-amber-700">
            Last error: {status.lastError}
          </p>
        )}

        {status?.qrDataUrl && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={status.qrDataUrl}
              alt="WhatsApp device link QR code"
              className="h-[280px] w-[280px] rounded-lg bg-white p-2"
            />
            <p className="max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
              Open WhatsApp on the dedicated phone → Settings → Linked devices → Link a
              device. The QR expires quickly; press Connect again if needed. Never share
              this screen or the session directory.
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-2 rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Send a WhatsApp message
          </p>
          <div className="grid gap-2 sm:grid-cols-[220px_1fr]">
            <Input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder={`Phone, e.g. 98765 43210 or ${status?.countryCode ?? "91"}9876543210`}
            />
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message text"
            />
          </div>
          <div>
            <Button size="sm" onClick={() => void send()} disabled={Boolean(working)}>
              {working === "send" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send message
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Session files live at <code>{status?.authDir ?? "server auth directory"}</code>.
            Messages are sent from whatever phone is linked here. Interview and offer
            reminder batches also try WhatsApp when this session is connected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
