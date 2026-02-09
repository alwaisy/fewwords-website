/**
 * Debug endpoint - Check session data on server
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const user = session?.user as { role?: string; email?: string } | undefined;

  return {
    serverSession: session,
    hasSession: !!session,
    hasUser: !!session?.user,
    userRole: user?.role || 'NO ROLE',
    userEmail: user?.email || 'NO EMAIL',
    allKeys: session ? Object.keys(session) : 'NO SESSION',
    userKeys: session?.user ? Object.keys(session.user) : 'NO USER',
  };
});
