"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const REPORT_STORAGE_KEY = "merge-risk-report";

export default function GithubLinkPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // The client calls only our internal API route, never Relevance directly.
      const res = await fetch("/api/review-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // This is only a temporary handoff to /report, not saved report history.
      sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(data));
      router.push("/report");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-6">
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <Field>
          <FieldLabel htmlFor="github-repo-link">
            Insert Github Repo Link
          </FieldLabel>
          <div className="flex w-full gap-3">
            <Input
              id="github-repo-link"
              type="search"
              placeholder="https://github.com/user/repo.git..."
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
            />
            <Button disabled={isLoading} type="submit">
              {isLoading ? "Reviewing..." : "Get Code Review"}
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </Field>
      </form>
    </div>
  );
}
