import { Sandbox } from "@vercel/sandbox";

import { createAgent } from "@/lib/agent";
import { parseError } from "@/lib/error";

export interface AgentResult {
  errorMessage?: string;
  success: boolean;
}

export const runAgent = async (
  sandboxId: string,
  diff: string,
  comment: string,
  threadId: string
): Promise<AgentResult> => {
  "use step";

  const sandbox = await Sandbox.get({ sandboxId }).catch((error: unknown) => {
    throw new Error(`[runAgent] Failed to get sandbox: ${parseError(error)}`, {
      cause: error,
    });
  });

  try {
    const agent = await createAgent(sandbox, threadId);

    await agent.generate({
      prompt: `User request: ${comment}\n\nHere is the PR diff:\n\n\`\`\`diff\n${diff}\n\`\`\`\n\nHandle the user's request. Use the tools to explore files, run commands, or make changes as needed. Use the reply tool to post your response.`,
    });

    return { success: true };
  } catch (error) {
    return {
      errorMessage: parseError(error),
      success: false,
    };
  }
};
