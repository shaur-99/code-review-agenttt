"use client";

import { useMemo, useSyncExternalStore } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { MergeRiskReport } from "@/lib/types";

const REPORT_STORAGE_KEY = "merge-risk-report";

export default function ReportPage() {
  const report = useStoredReport();

  return (
    <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-6">
      <ScrollArea className="h-[calc(100svh-12rem)] w-full max-w-6xl rounded-md border bg-background">
        <div className="space-y-6 p-8">
          {report ? (
            <ReviewReport report={report} />
          ) : (
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Merge Risk Report</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                No report has been generated yet.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function useStoredReport() {
  // sessionStorage is browser-only, so read it through a client-side store hook.
  const savedReport = useSyncExternalStore(
    () => () => undefined,
    readStoredReportString,
    () => null,
  );

  return useMemo(() => parseStoredReport(savedReport), [savedReport]);
}

function readStoredReportString(): string | null {
  return sessionStorage.getItem(REPORT_STORAGE_KEY);
}

function parseStoredReport(savedReport: string | null): MergeRiskReport | null {
  if (!savedReport) {
    return null;
  }

  try {
    // The API route already validates this shape before the browser stores it.
    return JSON.parse(savedReport) as MergeRiskReport;
  } catch {
    return null;
  }
}

function ReviewReport({ report }: { report: MergeRiskReport }) {
  return (
    <>
      {/* The existing ScrollArea now renders the structured Relevance report. */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Merge Risk Report</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {report.repo} - {report.risk_level.toUpperCase()} risk
        </p>
      </div>

      <section className="max-w-4xl space-y-2">
        <h2 className="text-lg font-medium">Summary</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          {report.summary}
        </p>
      </section>

      <section className="grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open PRs" value={report.stats.open_prs} />
        <Stat
          label="Overlap Groups"
          value={report.stats.overlapping_pr_groups}
        />
        <Stat label="High Risks" value={report.stats.high_risks} />
        <Stat label="Safe PRs" value={report.stats.safe_prs} />
      </section>

      <section className="max-w-4xl space-y-3">
        <h2 className="text-lg font-medium">Pull Requests</h2>
        {report.pull_requests.length ? (
          <div className="space-y-3">
            {report.pull_requests.map((pullRequest) => (
              <div
                className="rounded-md border p-4"
                key={pullRequest.number}
              >
                <h3 className="text-sm font-medium">
                  #{pullRequest.number} {pullRequest.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {pullRequest.author} - {pullRequest.base} {"<-"}{" "}
                  {pullRequest.head} - {pullRequest.changed_files} changed files
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptySection>No open pull requests were found.</EmptySection>
        )}
      </section>

      <RiskSection title="Merge Risks" risks={report.merge_risks} />
      <RiskSection title="Dependency Risks" risks={report.dependency_risks} />

      <section className="max-w-4xl space-y-3">
        <h2 className="text-lg font-medium">Safe To Merge</h2>
        {report.safe_to_merge.length ? (
          <div className="space-y-3">
            {report.safe_to_merge.map((item) => (
              <div className="rounded-md border p-4" key={item.pull_request}>
                <h3 className="text-sm font-medium">
                  PR #{item.pull_request}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptySection>No safe-to-merge PRs were identified.</EmptySection>
        )}
      </section>

      <section className="max-w-4xl space-y-3">
        <h2 className="text-lg font-medium">Suggested Merge Order</h2>
        {report.suggested_merge_order.length ? (
          <div className="space-y-3">
            {report.suggested_merge_order.map((item) => (
              <div className="rounded-md border p-4" key={item.step}>
                <h3 className="text-sm font-medium">
                  Step {item.step}: PR #{item.pull_request}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptySection>No merge order was suggested.</EmptySection>
        )}
      </section>

      <section className="max-w-4xl space-y-2">
        <h2 className="text-lg font-medium">Final Recommendation</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          {report.final_recommendation}
        </p>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function RiskSection({
  title,
  risks,
}: {
  title: string;
  risks: MergeRiskReport["merge_risks"];
}) {
  return (
    <section className="max-w-4xl space-y-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {risks.length ? (
        <div className="space-y-3">
          {risks.map((risk) => (
            <div
              className="rounded-md border p-4"
              key={`${risk.title}-${risk.pull_requests.join("-")}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium">{risk.title}</h3>
                <span className="rounded-md border px-2 py-0.5 text-xs uppercase text-muted-foreground">
                  {risk.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                PRs:{" "}
                {risk.pull_requests.map((number) => `#${number}`).join(", ")}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Files: {risk.files.join(", ")}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {risk.why_it_matters}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {risk.recommended_action}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptySection>No {title.toLowerCase()} were identified.</EmptySection>
      )}
    </section>
  );
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-7 text-muted-foreground">{children}</p>;
}
