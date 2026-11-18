"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminRequest, jsonBody } from "@/lib/fellowship-admin";
import type { ProgrammeApplicationOption } from "@/lib/programme-admin";

export default function StipendGenerator({
  applications,
  onGenerated,
}: {
  applications: ProgrammeApplicationOption[];
  onGenerated: () => void;
}) {
  const [applicationId, setApplicationId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [baseAmount, setBaseAmount] = useState("10000");
  const [increasedAmount, setIncreasedAmount] = useState("15000");
  const [startMonth, setStartMonth] = useState("6");
  const [endMonth, setEndMonth] = useState("12");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const generate = async () => {
    if (!applicationId) {
      setError("Choose a fellow first.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await adminRequest<{ created: number; skipped: number }>(
        "/api/fellowship-programme/stipends/generate",
        jsonBody({
          applicationId,
          startDate,
          baseAmount: Number(baseAmount),
          increasedAmount: Number(increasedAmount),
          startMonth: Number(startMonth),
          endMonth: Number(endMonth),
        }),
      );
      setNotice(
        `Created ${result.created} stipend rows${result.skipped ? `, skipped ${result.skipped} existing` : ""}.`,
      );
      onGenerated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wand2 className="h-4 w-4 text-primary" />
          Generate intern stipend schedule
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Creates month rows from month 6. Month 12 onward uses the increased amount.
          Existing months are skipped.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {(error || notice) && (
          <div
            className={`rounded-lg border p-2.5 text-xs ${
              error
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            }`}
          >
            {error || notice}
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Fellow
            </span>
            <select
              value={applicationId}
              onChange={(event) => setApplicationId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choose a fellow</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name} · {application.reference}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Month 1 starts
            </span>
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Months 6–11 (₹)
            </span>
            <Input type="number" min={1} value={baseAmount} onChange={(event) => setBaseAmount(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Month 12+ (₹)
            </span>
            <Input type="number" min={1} value={increasedAmount} onChange={(event) => setIncreasedAmount(event.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                From
              </span>
              <Input type="number" min={1} max={24} value={startMonth} onChange={(event) => setStartMonth(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                To
              </span>
              <Input type="number" min={1} max={24} value={endMonth} onChange={(event) => setEndMonth(event.target.value)} />
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => void generate()} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
