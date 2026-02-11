export default defineEventHandler(async (event) => {
  await clearUserSession(event);

  // Also delete cookies directly
  const cookieName = useRuntimeConfig(event).session?.name || 'nuxt-session';
  deleteCookie(event, cookieName);
  deleteCookie(event, `${cookieName}.token`);

  return {
    success: true,
    message: "Logged out successfully",
  };
});
