// Disable Umami analytics for admin routes
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client) {
    if (to.path.startsWith("/admin")) {
      window.localStorage.setItem("umami.disabled", "1");
    } else {
      window.localStorage.removeItem("umami.disabled");
    }
  }
});