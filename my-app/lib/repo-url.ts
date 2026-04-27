export function validateGitHubRepoUrl(repoUrl: string): string {
  // Keep validation local, but do not parse owner/repo for GitHub API usage.
  const trimmed = repoUrl.trim();

  if (!trimmed) {
    throw new Error("Repo URL is required");
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Please enter a valid GitHub repository URL");
  }

  if (url.hostname !== "github.com") {
    throw new Error("Please enter a valid GitHub repository URL");
  }

  // Accept .git for validation while returning the user's original trimmed URL.
  const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
  const repo = rawRepo?.replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new Error("GitHub URL must include an owner and repository name");
  }

  return trimmed;
}
