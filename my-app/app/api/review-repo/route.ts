import { NextResponse } from "next/server";

import { validateGitHubRepoUrl } from "@/lib/repo-url";
import { runMergeRiskReview } from "@/lib/relevance";

export async function POST(req: Request) {
  try {
    // The browser sends repoUrl; the server validates it before any Relevance call.
    const body = await req.json().catch(() => null);

    if (!body || typeof body.repoUrl !== "string") {
      return NextResponse.json(
        { error: "Repo URL is required" },
        { status: 400 },
      );
    }

    const repoUrl = validateGitHubRepoUrl(body.repoUrl);

    // Relevance AI handles GitHub fetching and analysis. Next.js only bridges.
    const report = await runMergeRiskReview(repoUrl);

    return NextResponse.json(report);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to review pull requests";

    // Input problems are client errors; configuration/Relevance failures stay 500.
    const status =
      message.includes("Repo URL") ||
      message.includes("valid GitHub") ||
      message.includes("owner and repository")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
