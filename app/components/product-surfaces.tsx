import Link from "next/link";

import type {
  SetupCheck,
  SetupCheckStatus,
  SetupDiagnostics,
} from "@/lib/setup-diagnostics";

import { Readme } from "./readme";

const productHighlights = [
  {
    description:
      "Mention OpenReview on a pull request and let the agent inspect the diff, run tooling, and post targeted findings.",
    title: "On-demand PR reviews",
  },
  {
    description:
      "Run inside an isolated Vercel Sandbox with repo access, so fixes, tests, and formatting stay scoped to the PR branch.",
    title: "Sandboxed execution",
  },
  {
    description:
      "Apply repo-specific skills and instructions without bloating the default prompt, so reviews stay focused and repeatable.",
    title: "Skill-driven automation",
  },
];

const quickStartSteps = [
  "Deploy OpenReview to Vercel.",
  "Create and install a GitHub App with PR, issues, and contents access.",
  "Add the required environment variables.",
  "Point your GitHub App webhook to /api/webhooks.",
  "Mention @openreview on a pull request comment.",
];

const workflowStages = [
  "Receive the GitHub webhook event.",
  "Validate GitHub installation and branch access.",
  "Create a sandbox on the PR branch.",
  "Install dependencies and discover repo skills.",
  "Stream a Claude-powered review agent over the diff.",
  "Post findings and optionally commit safe fixes.",
];

const exampleCommands = [
  "@openreview check for security vulnerabilities",
  "@openreview run the linter and fix any issues",
  "@openreview explain how the authentication flow works",
];

const statusCopy: Record<
  SetupCheckStatus,
  {
    badge: string;
    card: string;
    dot: string;
    label: string;
  }
> = {
  error: {
    badge:
      "border-red-500/20 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200",
    card: "border-red-500/20 bg-red-500/5 dark:border-red-500/30 dark:bg-red-500/10",
    dot: "bg-red-500",
    label: "Action required",
  },
  healthy: {
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
    card: "border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    dot: "bg-emerald-500",
    label: "Ready",
  },
  warning: {
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
    card: "border-amber-500/20 bg-amber-500/5 dark:border-amber-500/30 dark:bg-amber-500/10",
    dot: "bg-amber-500",
    label: "Needs attention",
  },
};

const cardClass =
  "rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur";

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const StatusBadge = ({ status }: { status: SetupCheckStatus }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusCopy[status].badge}`}
  >
    <span className={`size-2 rounded-full ${statusCopy[status].dot}`} />
    {statusCopy[status].label}
  </span>
);

const SectionHeader = ({
  eyebrow,
  subtitle,
  title,
}: {
  eyebrow: string;
  subtitle: string;
  title: string;
}) => (
  <div className="space-y-3">
    <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
      {eyebrow}
    </p>
    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
      {title}
    </h2>
    <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
      {subtitle}
    </p>
  </div>
);

const SummaryPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
  </div>
);

const DiagnosticItem = ({ check }: { check: SetupCheck }) => (
  <article
    className={`rounded-2xl border p-5 ${statusCopy[check.status].card}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{check.label}</h3>
          {check.required ? null : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Optional
            </span>
          )}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {check.description}
        </p>
      </div>
      <StatusBadge status={check.status} />
    </div>
    {check.action ? (
      <p className="mt-4 text-sm font-medium text-foreground/85">
        {check.action}
      </p>
    ) : null}
  </article>
);

const DiagnosticsPanel = ({
  deploymentUrl,
  diagnostics,
}: {
  deploymentUrl: string;
  diagnostics: SetupDiagnostics;
}) => (
  <section className="space-y-6">
    <SectionHeader
      eyebrow="Live setup status"
      subtitle="This view is generated from the running deployment. Use it to confirm your GitHub app, Claude key, and optional Redis persistence are ready before you trigger a review."
      title="Operator diagnostics built into the app"
    />
    <div className={`${cardClass} space-y-6`}>
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <StatusBadge status={diagnostics.overallStatus} />
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {diagnostics.summary.readyRequiredChecks}/
              {diagnostics.summary.totalRequiredChecks} required checks ready
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Last checked {formatTimestamp(diagnostics.generatedAt)}. Query the
              same data programmatically at{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {deploymentUrl}/api/health
              </code>
              .
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryPill
            label="Healthy"
            value={String(diagnostics.summary.healthyCount)}
          />
          <SummaryPill
            label="Warnings"
            value={String(diagnostics.summary.warningCount)}
          />
          <SummaryPill
            label="Errors"
            value={String(diagnostics.summary.errorCount)}
          />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {diagnostics.checks.map((check) => (
          <DiagnosticItem key={check.id} check={check} />
        ))}
      </div>
    </div>
  </section>
);

const CommandPreview = ({ command }: { command: string }) => (
  <div className="rounded-2xl border border-border/70 bg-zinc-950 p-4 font-mono text-sm text-zinc-50">
    <span className="text-zinc-500">$</span> {command}
  </div>
);

export const LandingPage = ({
  deploymentUrl,
  diagnostics,
  readmeContent,
}: {
  deploymentUrl: string;
  diagnostics: SetupDiagnostics;
  readmeContent: string;
}) => (
  <div className="min-h-screen bg-background">
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-8 sm:px-10 sm:py-12">
      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={diagnostics.overallStatus} />
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Self-hosted GitHub review automation
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                OpenReview now ships with a real operator surface.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Inspect setup readiness, copy the right webhook endpoint, and
                understand the review flow before the first pull request ever
                mentions the bot.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
                href="/setup"
              >
                Open setup guide
              </Link>
              <Link
                className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-muted"
                href="/api/health"
              >
                View health JSON
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-xl gap-3 sm:grid-cols-3">
            <SummaryPill
              label="Required ready"
              value={`${diagnostics.summary.readyRequiredChecks}/${diagnostics.summary.totalRequiredChecks}`}
            />
            <SummaryPill label="Webhook" value="/api/webhooks" />
            <SummaryPill label="Health" value="/api/health" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {productHighlights.map((item) => (
          <article key={item.title} className={cardClass}>
            <h2 className="text-xl font-semibold tracking-tight">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className={`${cardClass} space-y-6`}>
          <SectionHeader
            eyebrow="Quick start"
            subtitle="The new landing page keeps the first-run path visible instead of hiding it inside the README."
            title="From deploy to first review"
          />
          <ol className="grid gap-4">
            {quickStartSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-foreground/90">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </article>

        <article className={`${cardClass} space-y-6`}>
          <SectionHeader
            eyebrow="Request lifecycle"
            subtitle="A compact explanation of what happens after a reviewer mentions the bot."
            title="What the system does for each run"
          />
          <ul className="grid gap-4">
            {workflowStages.map((stage) => (
              <li
                key={stage}
                className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-foreground/90"
              >
                {stage}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <DiagnosticsPanel
        deploymentUrl={deploymentUrl}
        diagnostics={diagnostics}
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className={`${cardClass} space-y-6`}>
          <SectionHeader
            eyebrow="Configuration shortcuts"
            subtitle="These snippets map directly to the existing runtime behavior."
            title="Useful values to copy during setup"
          />
          <div className="grid gap-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Webhook URL
              </p>
              <code className="mt-3 block overflow-x-auto font-mono text-sm">
                {deploymentUrl}/api/webhooks
              </code>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Health endpoint
              </p>
              <code className="mt-3 block overflow-x-auto font-mono text-sm">
                {deploymentUrl}/api/health
              </code>
            </div>
          </div>
        </article>

        <article className={`${cardClass} space-y-6`}>
          <SectionHeader
            eyebrow="Example prompts"
            subtitle="Prebuilt commands make the bot easier to adopt for reviewers who have never used it before."
            title="Copy a review request into your next pull request"
          />
          <div className="grid gap-3">
            {exampleCommands.map((command) => (
              <CommandPreview key={command} command={command} />
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Reference docs"
          subtitle="The README remains available in-app so operators still have the full setup and usage guide at hand."
          title="Full project documentation"
        />
        <div className={cardClass}>
          <Readme content={readmeContent} />
        </div>
      </section>
    </main>
  </div>
);

export const SetupPage = ({
  deploymentUrl,
  diagnostics,
}: {
  deploymentUrl: string;
  diagnostics: SetupDiagnostics;
}) => (
  <div className="min-h-screen bg-background">
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 sm:px-10 sm:py-12">
      <section className={`${cardClass} space-y-8`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Link
              className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted"
              href="/"
            >
              Back to overview
            </Link>
            <StatusBadge status={diagnostics.overallStatus} />
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Setup guide and deployment checklist
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                This page turns the README steps into an operator workflow with
                live diagnostics, webhook values, and the exact GitHub
                permissions the app expects.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryPill
              label="Ready now"
              value={`${diagnostics.summary.readyRequiredChecks}/${diagnostics.summary.totalRequiredChecks}`}
            />
            <SummaryPill
              label="Last checked"
              value={formatTimestamp(diagnostics.generatedAt)}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border/70 bg-background/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Webhook URL
            </p>
            <code className="mt-3 block overflow-x-auto font-mono text-sm">
              {deploymentUrl}/api/webhooks
            </code>
          </article>
          <article className="rounded-2xl border border-border/70 bg-background/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Health URL
            </p>
            <code className="mt-3 block overflow-x-auto font-mono text-sm">
              {deploymentUrl}/api/health
            </code>
          </article>
          <article className="rounded-2xl border border-border/70 bg-background/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Bot trigger
            </p>
            <code className="mt-3 block overflow-x-auto font-mono text-sm">
              @openreview ...
            </code>
          </article>
        </div>
      </section>

      <DiagnosticsPanel
        deploymentUrl={deploymentUrl}
        diagnostics={diagnostics}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <article className={`${cardClass} space-y-6`}>
          <SectionHeader
            eyebrow="GitHub App checklist"
            subtitle="Create the GitHub App with the same capabilities the workflow needs in production."
            title="Permissions and events"
          />
          <div className="grid gap-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm font-semibold">Repository permissions</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li>Contents: Read &amp; write</li>
                <li>Issues: Read &amp; write</li>
                <li>Pull requests: Read &amp; write</li>
                <li>Metadata: Read-only</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm font-semibold">Subscribe to events</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li>Issue comment</li>
                <li>Pull request review comment</li>
              </ul>
            </div>
          </div>
        </article>

        <article className={`${cardClass} space-y-6`}>
          <SectionHeader
            eyebrow="Operator workflow"
            subtitle="Use the running app itself as the fastest way to confirm your deployment is ready."
            title="Recommended validation sequence"
          />
          <ol className="grid gap-4">
            {[
              "Deploy the app and open this setup page.",
              "Confirm all required checks are green in the diagnostics panel.",
              "Install the GitHub App on at least one repository.",
              "Verify the webhook URL matches your deployment hostname.",
              "Open /api/health to integrate readiness checks into your own monitoring.",
              "Mention @openreview on a pull request to run the end-to-end flow.",
            ].map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-foreground/90">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  </div>
);
