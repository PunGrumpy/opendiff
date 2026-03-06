import "server-only";
import { env } from "@/lib/env";
import { getInstallationOctokit } from "@/lib/github";

export type SetupCheckStatus = "healthy" | "warning" | "error";

export interface SetupCheck {
  action?: string;
  description: string;
  id: string;
  label: string;
  required: boolean;
  status: SetupCheckStatus;
}

export interface SetupDiagnostics {
  checks: SetupCheck[];
  generatedAt: string;
  overallStatus: SetupCheckStatus;
  summary: {
    errorCount: number;
    healthyCount: number;
    readyRequiredChecks: number;
    totalRequiredChecks: number;
    warningCount: number;
  };
}

const getOverallStatus = (
  checks: SetupCheck[]
): SetupDiagnostics["overallStatus"] => {
  if (checks.some((check) => check.status === "error")) {
    return "error";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "warning";
  }

  return "healthy";
};

const getSummary = (checks: SetupCheck[]): SetupDiagnostics["summary"] => {
  const requiredChecks = checks.filter((check) => check.required);

  return {
    errorCount: checks.filter((check) => check.status === "error").length,
    healthyCount: checks.filter((check) => check.status === "healthy").length,
    readyRequiredChecks: requiredChecks.filter(
      (check) => check.status === "healthy"
    ).length,
    totalRequiredChecks: requiredChecks.length,
    warningCount: checks.filter((check) => check.status === "warning").length,
  };
};

const normalizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Unknown error";
};

const githubConfigCheckIds = new Set([
  "github-app-id",
  "github-installation-id",
  "github-private-key",
  "github-webhook-secret",
]);

const createCheck = (check: SetupCheck): SetupCheck => check;

const getBaseChecks = (): SetupCheck[] => [
  createCheck({
    action: "Add your Claude provider key to the deployment environment.",
    description: env.ANTHROPIC_API_KEY
      ? "Claude access is configured for agent runs."
      : "OpenReview cannot run reviews until a Claude provider key is set.",
    id: "anthropic-api-key",
    label: "Claude provider key",
    required: true,
    status: env.ANTHROPIC_API_KEY ? "healthy" : "error",
  }),
  createCheck({
    action: "Set GITHUB_APP_ID to your GitHub App identifier.",
    description: env.GITHUB_APP_ID
      ? "GitHub App ID is present."
      : "Missing GITHUB_APP_ID.",
    id: "github-app-id",
    label: "GitHub App ID",
    required: true,
    status: env.GITHUB_APP_ID ? "healthy" : "error",
  }),
  createCheck({
    action:
      "Set GITHUB_APP_INSTALLATION_ID to the installation for the target repository.",
    description: env.GITHUB_APP_INSTALLATION_ID
      ? "Installation ID is present."
      : "Missing GITHUB_APP_INSTALLATION_ID.",
    id: "github-installation-id",
    label: "Installation ID",
    required: true,
    status: env.GITHUB_APP_INSTALLATION_ID ? "healthy" : "error",
  }),
  createCheck({
    action: "Paste the GitHub App private key with escaped newlines.",
    description: env.GITHUB_APP_PRIVATE_KEY
      ? "Private key is configured."
      : "Missing GITHUB_APP_PRIVATE_KEY.",
    id: "github-private-key",
    label: "GitHub private key",
    required: true,
    status: env.GITHUB_APP_PRIVATE_KEY ? "healthy" : "error",
  }),
  createCheck({
    action: "Set GITHUB_APP_WEBHOOK_SECRET to match your GitHub App webhook.",
    description: env.GITHUB_APP_WEBHOOK_SECRET
      ? "Webhook secret is present."
      : "Missing GITHUB_APP_WEBHOOK_SECRET.",
    id: "github-webhook-secret",
    label: "Webhook secret",
    required: true,
    status: env.GITHUB_APP_WEBHOOK_SECRET ? "healthy" : "error",
  }),
  createCheck({
    action:
      "Optional: configure REDIS_URL to persist thread state across cold starts.",
    description: env.REDIS_URL
      ? "Redis persistence is configured."
      : "Using in-memory state; rerun history resets on cold starts.",
    id: "redis-url",
    label: "Redis persistence",
    required: false,
    status: env.REDIS_URL ? "healthy" : "warning",
  }),
];

const hasRequiredGitHubConfig = (checks: SetupCheck[]): boolean =>
  checks
    .filter((check) => githubConfigCheckIds.has(check.id))
    .every((check) => check.status === "healthy");

const getSkippedGitHubConnectivityCheck = (): SetupCheck =>
  createCheck({
    action:
      "Add the required GitHub App variables before validating connectivity.",
    description:
      "Connectivity check is skipped until all required GitHub variables are present.",
    id: "github-connection",
    label: "GitHub App connectivity",
    required: true,
    status: "warning",
  });

const getGitHubConnectivityCheck = async (): Promise<SetupCheck> => {
  try {
    const octokit = await getInstallationOctokit();
    const [appInfoResponse, reposResponse] = await Promise.all([
      octokit.request("GET /app"),
      octokit.request("GET /installation/repositories", { per_page: 1 }),
    ]);

    const appSlug = (appInfoResponse.data as { slug?: string }).slug;
    const repoCount = (reposResponse.data as { total_count?: number })
      .total_count;
    const hasInstalledRepositories = Boolean(repoCount && repoCount > 0);

    return createCheck({
      description: hasInstalledRepositories
        ? `Authenticated as ${appSlug ?? "your GitHub App"} with access to ${repoCount} installed repositor${repoCount === 1 ? "y" : "ies"}.`
        : `Authenticated as ${appSlug ?? "your GitHub App"}. Install the app on at least one repository before requesting reviews.`,
      id: "github-connection",
      label: "GitHub App connectivity",
      required: true,
      status: hasInstalledRepositories ? "healthy" : "warning",
    });
  } catch (error) {
    return createCheck({
      action:
        "Verify the installation ID, private key formatting, and GitHub App permissions.",
      description: `GitHub handshake failed: ${normalizeErrorMessage(error)}`,
      id: "github-connection",
      label: "GitHub App connectivity",
      required: true,
      status: "error",
    });
  }
};

export const getSetupDiagnostics = async (): Promise<SetupDiagnostics> => {
  const checks = getBaseChecks();

  checks.push(
    hasRequiredGitHubConfig(checks)
      ? await getGitHubConnectivityCheck()
      : getSkippedGitHubConnectivityCheck()
  );

  return {
    checks,
    generatedAt: new Date().toISOString(),
    overallStatus: getOverallStatus(checks),
    summary: getSummary(checks),
  };
};
