/**
 * ScrollSmoother middleware - DISABLED
 *
 * This middleware was killing ScrollSmoother immediately on navigation,
 * causing visible jumps BEFORE page transitions could hide them.
 *
 * The page:start hook in scrollsmoother.client.js now handles:
 * 1. Starting fade out transition
 * 2. Killing smoother mid-fade (jump hidden by opacity)
 *
 * Keeping this file for reference but disabled.
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Middleware disabled - transitions handled by page:start/finish hooks
  return;
});
