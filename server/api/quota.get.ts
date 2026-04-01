import { checkQuota } from "../services/quota";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = session?.user
    ? (session.user as { id: string }).id
    : null;

  const quota = await checkQuota(event, userId);

  return {
    wordsUsed: quota.wordsUsed,
    wordsLimit: quota.wordsLimit,
    isLoggedIn: quota.isLoggedIn,
    allowed: quota.allowed,
  };
});
