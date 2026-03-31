// Disable umami tracking for admin routes
export default defineNuxtRouteMiddleware(() => {
  // Disable umami tracking for all admin routes
  if (import.meta.client) {
    window.localStorage.setItem('umami.disabled', '1');
  }
});