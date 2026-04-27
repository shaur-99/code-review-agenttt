export type MergeRiskLevel = "low" | "medium" | "high";

// Shared contract between Relevance AI, the API route, and the report page.
export type MergeRiskReport = {
  repo: string;
  summary: string;
  risk_level: MergeRiskLevel;
  stats: {
    open_prs: number;
    overlapping_pr_groups: number;
    high_risks: number;
    safe_prs: number;
  };
  pull_requests: {
    number: number;
    title: string;
    author: string;
    base: string;
    head: string;
    changed_files: number;
  }[];
  merge_risks: {
    title: string;
    severity: MergeRiskLevel;
    pull_requests: number[];
    files: string[];
    why_it_matters: string;
    recommended_action: string;
  }[];
  dependency_risks: {
    title: string;
    severity: MergeRiskLevel;
    pull_requests: number[];
    files: string[];
    why_it_matters: string;
    recommended_action: string;
  }[];
  safe_to_merge: {
    pull_request: number;
    reason: string;
  }[];
  suggested_merge_order: {
    step: number;
    pull_request: number;
    reason: string;
  }[];
  final_recommendation: string;
};

// Input sent from the Next.js server route to Relevance AI.
export type RelevanceRepoReviewInput = {
  repo_url: string;
};
