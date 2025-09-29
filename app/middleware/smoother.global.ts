export default defineNuxtRouteMiddleware((to, from) => {
  if (!process.client) return;
  // Skip on first client render to avoid killing the initial smoother
  try {
    if (!from || !from.fullPath) return;
  } catch (_) {}
  const nuxtApp = useNuxtApp();
  const api = (nuxtApp as any).$smoother;
  try {
    api && api.kill && api.kill();
  } catch (e) {}
});
