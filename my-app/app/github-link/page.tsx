import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function GithubLinkPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-6">
      <Field className="w-full max-w-md">
        <FieldLabel htmlFor="github-repo-link">
          Insert Github Repo Link
        </FieldLabel>
        <div className="flex w-full gap-3">
          <Input
            id="github-repo-link"
            type="search"
            placeholder="https://github.com/user/repo.git..."
          />
          <Button>Get Code Review</Button>
        </div>
      </Field>
    </div>
  );
}
