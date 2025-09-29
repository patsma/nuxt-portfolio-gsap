import { ref, onMounted, onUnmounted, computed } from "vue";

/**
 * useIsMobile composable (simplified, synced with SCSS variables)
 * Breakpoints from `app/assets/scss/_variables.scss`:
 * - $tablet: 768px
 * - $laptop: 1024px
 * - $largeDesktop: 1536px
 * - $extraLargeDesktop: 3820px
 * @returns {{
 *  isMobile: import('vue').Ref<boolean>,
 *  isTablet: import('vue').Ref<boolean>,
 *  isLaptop: import('vue').Ref<boolean>,
 *  isDesktop: import('vue').Ref<boolean>,
 *  isLargeDesktop: import('vue').Ref<boolean>,
 *  isExtraLargeDesktop: import('vue').Ref<boolean>
 * }}
 */
export default function useIsMobile() {
  const TABLET = 768;
  const LAPTOP = 1024;
  const LARGE_DESKTOP = 1536;
  const EXTRA_LARGE_DESKTOP = 3820;

  const width = ref(0);

  function update() {
    width.value = window.innerWidth;
  }

  onMounted(() => {
    update();
    window.addEventListener("resize", update, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  const isMobile = computed(() => width.value < TABLET);
  const isTablet = computed(
    () => width.value >= TABLET && width.value < LAPTOP
  );
  const isLaptop = computed(
    () => width.value >= LAPTOP && width.value < LARGE_DESKTOP
  );
  const isDesktop = computed(() => width.value >= LAPTOP);
  const isLargeDesktop = computed(
    () => width.value >= LARGE_DESKTOP && width.value < EXTRA_LARGE_DESKTOP
  );
  const isExtraLargeDesktop = computed(
    () => width.value >= EXTRA_LARGE_DESKTOP
  );

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isLargeDesktop,
    isExtraLargeDesktop,
  };
}
