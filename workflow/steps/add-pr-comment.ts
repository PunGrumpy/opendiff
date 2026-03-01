import { bot } from "@/lib/bot";

export const addPRComment = async (
  threadId: string,
  body: string
): Promise<void> => {
  "use step";

  const adapter = bot.getAdapter("github");
  await adapter.postMessage(threadId, { markdown: body });
};
