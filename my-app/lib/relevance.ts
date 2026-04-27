import type { MergeRiskLevel, MergeRiskReport } from "@/lib/types";

const INVALID_REPORT_ERROR =
  "The review completed, but the AI response was not in the expected JSON format.";

const MERGE_RISK_LEVELS = new Set<MergeRiskLevel>(["low", "medium", "high"]);
const DEFAULT_AGENT_POLL_INTERVAL_MS = 3_000;
const DEFAULT_AGENT_POLL_TIMEOUT_MS = 300_000;

export async function runMergeRiskReview(
  repoUrl: string,
): Promise<MergeRiskReport> {
  const endpoint = process.env.RELEVANCE_REVIEW_ENDPOINT;
  const apiKey = process.env.RELEVANCE_API_KEY;
  const agentId = process.env.RELEVANCE_AGENT_ID;

  // These secrets stay on the server. Client components only call /api/review-repo.
  if (!endpoint) {
    throw new Error("Missing RELEVANCE_REVIEW_ENDPOINT");
  }

  if (!apiKey) {
    throw new Error("Missing RELEVANCE_API_KEY");
  }

  if (isRelevanceAgentTriggerEndpoint(endpoint) && !agentId) {
    throw new Error("Missing RELEVANCE_AGENT_ID");
  }

  // Relevance's agents/trigger endpoint needs message + agent_id. A direct
  // custom endpoint can still receive the simpler { repo_url } payload.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(buildRelevanceRequestBody(repoUrl, agentId)),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Relevance AI request failed with status ${res.status}: ${text}`,
    );
  }

  const raw = await res.json();
  const relevanceError = getRelevanceError(raw);

  if (relevanceError) {
    throw new Error(relevanceError);
  }

  if (isTriggeredAgentTask(raw)) {
    return pollTriggeredAgentTask({
      endpoint,
      apiKey,
      agentId: raw.agent_id,
      conversationId: raw.conversation_id,
    });
  }

  const report = normaliseRelevanceResponse(raw);

  assertMergeRiskReport(report);

  return report;
}

type TriggeredAgentTask = {
  agent_id: string;
  conversation_id: string;
  job_info?: unknown;
  state?: string;
};

type PollTriggeredAgentTaskInput = {
  endpoint: string;
  apiKey: string;
  agentId: string;
  conversationId: string;
};

function isRelevanceAgentTriggerEndpoint(endpoint: string): boolean {
  return endpoint.includes("/agents/trigger");
}

function buildRelevanceRequestBody(repoUrl: string, agentId?: string) {
  if (!agentId) {
    return {
      repo_url: repoUrl,
    };
  }

  return {
    message: {
      role: "user",
      content: JSON.stringify({
        repo_url: repoUrl,
      }),
    },
    agent_id: agentId,
  };
}

function isTriggeredAgentTask(raw: unknown): raw is TriggeredAgentTask {
  if (!isRecord(raw)) return false;

  return (
    typeof raw.agent_id === "string" &&
    typeof raw.conversation_id === "string" &&
    ("job_info" in raw || typeof raw.state === "string")
  );
}

async function pollTriggeredAgentTask({
  endpoint,
  apiKey,
  agentId,
  conversationId,
}: PollTriggeredAgentTaskInput): Promise<MergeRiskReport> {
  const startedAt = Date.now();
  const taskViewEndpoint = buildTaskViewEndpoint(endpoint, agentId, conversationId);
  const pollIntervalMs = getPositiveEnvNumber(
    "RELEVANCE_POLL_INTERVAL_MS",
    DEFAULT_AGENT_POLL_INTERVAL_MS,
  );
  const pollTimeoutMs = getPositiveEnvNumber(
    "RELEVANCE_POLL_TIMEOUT_MS",
    DEFAULT_AGENT_POLL_TIMEOUT_MS,
  );

  // The API trigger starts a task first. Poll the task view until the agent
  // message contains the final JSON report or the generous timeout is reached.
  while (Date.now() - startedAt < pollTimeoutMs) {
    await sleep(pollIntervalMs);

    const res = await fetch(taskViewEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Relevance AI task polling failed with status ${res.status}: ${text}`,
      );
    }

    const taskView = await res.json();
    const relevanceError = getRelevanceError(taskView);

    if (relevanceError) {
      throw new Error(relevanceError);
    }

    const report = extractReportFromTaskView(taskView);

    if (report) {
      return report;
    }
  }

  throw new Error(
    `Relevance AI started the review, but did not return a completed report within ${Math.round(
      pollTimeoutMs / 1000,
    )} seconds.`,
  );
}

function getPositiveEnvNumber(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildTaskViewEndpoint(
  endpoint: string,
  agentId: string,
  conversationId: string,
): string {
  const baseUrl = endpoint.replace(/\/agents\/trigger.*$/, "");
  return `${baseUrl}/agents/${agentId}/tasks/${conversationId}/view`;
}

function extractReportFromTaskView(taskView: unknown): MergeRiskReport | null {
  if (!isRecord(taskView) || !Array.isArray(taskView.results)) {
    return null;
  }

  for (const item of taskView.results.toReversed()) {
    if (!isRecord(item) || !isRecord(item.content)) continue;
    if (typeof item.content.text !== "string") continue;

    const report = tryParseMergeRiskReport(item.content.text);

    if (report) {
      return report;
    }
  }

  return null;
}

function tryParseMergeRiskReport(value: string): MergeRiskReport | null {
  try {
    const report = normaliseRelevanceResponse(value);
    assertMergeRiskReport(report);
    return report;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normaliseRelevanceResponse(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return parseIfJsonString(raw);
  }

  const obj = raw as Record<string, unknown>;

  const candidate =
    obj.review_report ??
    getNested(obj.answer, "review_report") ??
    obj.answer ??
    getNested(obj.output, "review_report") ??
    obj.output ??
    getNested(obj.data, "review_report") ??
    obj.data ??
    obj;

  return parseIfJsonString(candidate);
}

function getRelevanceError(raw: unknown): string | null {
  if (!isRecord(raw)) return null;

  // Some Relevance failures are returned as JSON with 200 status, so surface
  // the clean message instead of treating it as malformed report output.
  if (typeof raw.error === "string") return raw.error;
  if (typeof raw.message === "string" && raw.status === "error") {
    return raw.message;
  }

  const output = raw.output;
  if (isRecord(output) && typeof output.error === "string") {
    return output.error;
  }

  const data = raw.data;
  if (isRecord(data) && typeof data.error === "string") {
    return data.error;
  }

  return null;
}

function getNested(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function parseIfJsonString(value: unknown): unknown {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Relevance AI returned a string that was not valid JSON");
  }
}

function assertMergeRiskReport(value: unknown): asserts value is MergeRiskReport {
  if (!isRecord(value)) {
    throw new Error(INVALID_REPORT_ERROR);
  }

  if (
    typeof value.repo !== "string" ||
    typeof value.summary !== "string" ||
    !isMergeRiskLevel(value.risk_level) ||
    !isRecord(value.stats) ||
    typeof value.stats.open_prs !== "number" ||
    typeof value.stats.overlapping_pr_groups !== "number" ||
    typeof value.stats.high_risks !== "number" ||
    typeof value.stats.safe_prs !== "number" ||
    !Array.isArray(value.pull_requests) ||
    !Array.isArray(value.merge_risks) ||
    !Array.isArray(value.dependency_risks) ||
    !Array.isArray(value.safe_to_merge) ||
    !Array.isArray(value.suggested_merge_order) ||
    typeof value.final_recommendation !== "string"
  ) {
    throw new Error(INVALID_REPORT_ERROR);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMergeRiskLevel(value: unknown): value is MergeRiskLevel {
  return (
    typeof value === "string" &&
    MERGE_RISK_LEVELS.has(value as MergeRiskLevel)
  );
}
