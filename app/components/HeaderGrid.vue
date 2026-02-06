<template>
  <!--
    Simplified fixed header with responsive grid layout
    - Desktop: 1fr auto 1fr columns → logo (left), nav (center), empty (right)
    - Mobile: hamburger (left), logo (center), empty (right), nav hidden
    - Mobile overlay: appears below header, fills viewport minus header height
  -->
  <ClientOnly>
    <header
      ref="containerRef"
      class="header-grid headroom--top"
      data-entrance-animate="true"
    >
      <!-- Animated background - reveals from bottom to top when menu opens -->
      <div
        ref="backgroundRef"
        class="header-grid__background"
      />
      <div class="content-grid">
        <div class="breakout3 header-grid__inner">
          <!-- Top row: shared row for both desktop and mobile -->
          <div class="header-grid__row header-grid__row--top">
            <!-- Hamburger: visible only on mobile, animates lines (no icon swap) -->
            <button
              ref="hamburgerBtn"
              class="header-grid__hamburger"
              :aria-expanded="Boolean(isOpen)"
              aria-controls="mobile-overlay"
              aria-label="Toggle main menu"
              @click="toggle()"
            >
              <span class="sr-only">{{
                isOpen ? "Close menu" : "Open menu"
              }}</span>
              <HamburgerSVG
                ref="hamburgerSvgComponent"
                class="header-grid__hamburgerIcon"
              />
            </button>
            <!-- Single logo used for both desktop and mobile -->
            <NuxtLink
              to="/"
              class="header-grid__brand"
            >
              <div class="flex flex-col">
                <span
                  class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-100)]"
                >Morten Christensen</span>
                <span
                  ref="titleElementRef"
                  class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-center md:text-left text-[var(--theme-text-60)]"
                >{{ titleStore.currentText }}</span>
              </div>
            </NuxtLink>
            <!-- Desktop nav centered (hidden on mobile) -->
            <nav
              class="header-grid__nav"
              aria-label="Primary"
            >
              <NuxtLink
                to="/"
                class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
                :data-active="isActive('/')"
              >
                Work
              </NuxtLink>
              <NuxtLink
                to="/about"
                class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
                :data-active="isActive('/about')"
              >
                About
              </NuxtLink>
              <!-- Theme toggle in desktop nav -->
              <ClientOnly>
                <button
                  id="themeSwitch"
                  ref="themeToggleDesktopRef"
                  class="cursor-pointer"
                  aria-label="Toggle theme"
                >
                  <ThemeToggleSVG class="w-12" />
                </button>
              </ClientOnly>
              <NuxtLink
                to="/lab"
                class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
                :data-active="isActive('/lab')"
              >
                Lab
              </NuxtLink>
              <NuxtLink
                to="/contact"
                class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
                :data-active="isActive('/contact')"
              >
                Contact
              </NuxtLink>
            </nav>
            <!-- Right spacer: location/date on desktop, theme toggle on mobile -->
            <div class="header-grid__spacer flex items-center justify-end">
              <!-- Desktop: Location and date (dynamic time updated every second) -->
              <div class="hidden md:flex flex-col items-end">
                <span
                  class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-100)]"
                >Tokyo, JP</span>
                <span
                  v-if="isClient"
                  class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-60)]"
                >{{ tokyoTime }}</span>
              </div>
              <!-- Mobile: Theme toggle -->
              <ClientOnly>
                <button
                  id="themeSwitchMobile"
                  ref="themeToggleMobileRef"
                  class="flex md:hidden cursor-pointer"
                  aria-label="Toggle theme"
                >
                  <ThemeToggleSVG class="w-12" />
                </button>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
      <!-- Mobile overlay: full height with clip-path reveal -->
      <div
        id="mobile-overlay"
        ref="overlayRef"
        class="fixed inset-x-0 top-0 h-[100dvh] pt-20 bg-[var(--theme-100)] md:hidden z-40"
      >
        <div class="content-grid h-full">
          <div
            class="breakout1 pt-[var(--size-header)] pb-[var(--space-m)] flex flex-col gap-[var(--space-s)]"
          >
            <NuxtLink
              v-for="item in items"
              :key="'m-' + item.href"
              :to="item.href"
              class="block pp-eiko-mobile-custom-navigation-menu-items !text-7xl leading-tight nav-link text-[var(--theme-text-100)]"
              :data-active="isActive(item.href)"
              @click.prevent="handleMobileNavClick(item.href)"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>
  </ClientOnly>
</template>

<script setup lang="ts">
// Import the provided SVG-based hamburger icon for mobile
import HamburgerSVG from './SVG/HamburgerSVG.vue'
import ThemeToggleSVG from './ThemeToggleSVG.vue'
import { useLoadingStore } from '~/stores/loading'
import { useMenuStore } from '~/stores/menu'
import { useLoadingSequence } from '~/composables/useLoadingSequence'
import { useTokyoTime } from '~/composables/useTokyoTime'
import { useTitleRotationStore } from '~/stores/title-rotation'

// Loading store for font readiness check
const loadingStore = useLoadingStore()

// Menu store for coordinated navigation
const menuStore = useMenuStore()

// Nuxt GSAP services (provided by GSAP Nuxt module/plugin)
const nuxtApp = useNuxtApp()
const { $gsap, $DrawSVGPlugin, $SplitText, $GSDevTools } = nuxtApp

// Loading system integration
const { isFirstLoad } = useLoadingSequence()

// Dynamic time display for Tokyo
const { tokyoTime } = useTokyoTime()

// Animated title rotation system
const titleStore = useTitleRotationStore()

// Client-side only flag for SSR safety
const isClient = ref(false)

// Router for programmatic navigation after menu close
const router = useRouter()

// Track if we're navigating (to coordinate headroom resume)
const isNavigating = ref(false)

// Computed wrapper for menu store state (replaces useState)
const isOpen = computed(() => menuStore.isOpen)

// Refs to animate
const containerRef = ref<HTMLElement | null>(null)
const hamburgerBtn = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const backgroundRef = ref<HTMLElement | null>(null)
const titleElementRef = ref<HTMLElement | null>(null)
const themeToggleDesktopRef = ref<HTMLElement | null>(null)
const themeToggleMobileRef = ref<HTMLElement | null>(null)

// Reference to child SVG component to access its root SVG via exposed ref
type MaybeRefSvg = SVGSVGElement | null | { value: SVGSVGElement | null }

interface HamburgerSVGExposed {
  svgRootRef?: MaybeRefSvg
  svgRef?: MaybeRefSvg
}

const hamburgerSvgComponent = ref<HamburgerSVGExposed | null>(null)

// GSAP Timeline type (matches project pattern)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GSAPTimeline = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SplitTextInstance = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GSAPContext = any

// Internal handles - GSAP timelines and SplitText instances
let hamburgerTl: GSAPTimeline | null = null
let menuTl: GSAPTimeline | null = null
let navSplitInstance: SplitTextInstance | null = null
let titleTl: GSAPTimeline | null = null
let titleSplitInstance: SplitTextInstance | null = null
let gsapCtx: GSAPContext | null = null

// Navigation items — main pages for page transition demo
interface NavItem {
  label: string
  href: string
}

const items: NavItem[] = [
  { label: 'Work', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Lab', href: '/lab' },
  { label: 'Contact', href: '/contact' }
]

// Active route highlighting
const route = useRoute()

function isActive(href: string): boolean {
  return route.path === href
}

/**
 * Wait for fonts to be ready before creating SplitText
 * Prevents "SplitText called before fonts loaded" warning
 */
async function waitForFonts(): Promise<void> {
  // If fonts are already ready, return immediately
  if (loadingStore.fontsReady) {
    return
  }

  // Wait for fonts to be ready
  if (typeof document !== 'undefined') {
    try {
      await document.fonts.ready
    }
    catch (error) {
      console.warn('⚠️ Font loading wait failed:', error)
    }
  }
}

/**
 * Set up SplitText animation for the title element
 * Creates a timeline that fades characters in and out, then cycles to next title
 */
async function setupTitleAnimation(): Promise<void> {
  if (!titleElementRef.value || !$SplitText || !$gsap) return

  // CRITICAL: Wait for fonts to be loaded before creating SplitText
  // This prevents "SplitText called before fonts loaded" warning
  await waitForFonts()

  // Clean up previous SplitText instance
  if (titleSplitInstance) {
    titleSplitInstance.revert?.()
  }

  // CRITICAL: Force DOM to match current store value
  // SplitText.revert() restores the original text it captured, not the reactive store value
  if (titleElementRef.value) {
    titleElementRef.value.textContent = titleStore.currentText
  }

  // Create new SplitText instance with the updated text
  titleSplitInstance = $SplitText.create(titleElementRef.value, {
    type: 'chars'
  })

  // Create animation timeline (no repeat - cycling handled by watcher/store)
  if (titleTl) {
    titleTl.kill()
  }

  titleTl = $gsap.timeline()

  // Fade in characters with stagger
  titleTl.from(titleSplitInstance.chars, {
    duration: 2,
    opacity: 0,
    stagger: 0.1,
    ease: 'power2.out'
  })

  // Fade out characters with stagger, then update to next title
  titleTl.to(titleSplitInstance.chars, {
    duration: 2,
    opacity: 0,
    stagger: 0.1,
    ease: 'power2.in',
    onComplete: () => {
      // Advance to next title in rotation
      titleStore.updateText()
      // Directly chain to next animation (don't rely on watcher)
      nextTick(() => {
        setupTitleAnimation()
      })
    }
  })
}

onMounted(() => {
  // Set client flag for SSR safety
  isClient.value = true

  if (!$gsap) return

  const scopeEl = containerRef.value || undefined

  nextTick(() => {
    // Initialize theme switch
    const { initThemeSwitch } = useThemeSwitch()
    initThemeSwitch()

    gsapCtx = $gsap.context(async () => {
      // CRITICAL: Wait for fonts before creating SplitText
      // This prevents "SplitText called before fonts loaded" warning
      await waitForFonts()

      /**
       * Helper to unwrap child-exposed refs safely
       */
      const getExposedSvgEl = (exp: HamburgerSVGExposed | null): SVGSVGElement | null => {
        if (!exp) return null
        const candidate = exp.svgRootRef ?? exp.svgRef
        if (candidate == null) return null
        return Object.prototype.hasOwnProperty.call(candidate, 'value')
          ? (candidate as { value: SVGSVGElement | null }).value
          : (candidate as SVGSVGElement | null)
      }

      // Prefer animating via child component's exposed svgRootRef for reliability
      const svgRoot: SVGSVGElement | null
        = getExposedSvgEl(hamburgerSvgComponent.value)
          || hamburgerBtn.value?.querySelector('svg')
          || null

      if (!svgRoot) {
        console.warn('HeaderGrid: hamburger SVG root not found')
        return
      }

      // Cross-draw between #closed and #opened path sets using DrawSVG
      const closedPaths = svgRoot.querySelectorAll('#closed path')
      const openedPaths = svgRoot.querySelectorAll('#opened path')

      if (!closedPaths.length || !openedPaths.length) {
        console.warn(
          'HeaderGrid: expected #closed and #opened path groups in HamburgerSVG'
        )
        return
      }

      // Read durations from CSS variables - handle both 's' and 'ms' units
      const html = document.documentElement
      const hoverDurationRaw = getComputedStyle(html)
        .getPropertyValue('--duration-hover')
        .trim()

      let hoverDuration = 0.3 // Default fallback
      if (hoverDurationRaw.endsWith('ms')) {
        hoverDuration = parseFloat(hoverDurationRaw) / 1000 // Convert ms to seconds
      }
      else if (hoverDurationRaw.endsWith('s')) {
        hoverDuration = parseFloat(hoverDurationRaw) // Already in seconds
      }

      // Nav link hover effects are now handled by CSS (see base.scss)
      // No GSAP event listeners needed - browser-native :hover is simpler and more performant

      const tl = $gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' }
      })
      if ($DrawSVGPlugin) {
        // Initialize states
        $gsap.set(closedPaths, { autoAlpha: 1, drawSVG: '100%' })
        $gsap.set(openedPaths, { autoAlpha: 1, drawSVG: 0 })

        // Animate out closed, then in opened using CSS variable duration
        tl.to(
          closedPaths,
          { drawSVG: 0, duration: hoverDuration * 0.93, stagger: 0.04 },
          0
        ).to(
          openedPaths,
          { drawSVG: '100%', duration: hoverDuration * 1.07, stagger: 0.04 },
          '<+0.06'
        )
      }
      else {
        // Fallback without DrawSVG: simple crossfade
        $gsap.set(openedPaths, { autoAlpha: 0 })
        tl.to(
          closedPaths,
          { autoAlpha: 0, duration: hoverDuration * 0.6 },
          0
        ).to(
          openedPaths,
          { autoAlpha: 1, duration: hoverDuration * 0.73 },
          '<+0.05'
        )
      }
      hamburgerTl = tl

      // Unified menu animation - combines background, overlay, and nav items
      if (overlayRef.value && backgroundRef.value) {
        const menuTimeline = $gsap.timeline({ paused: true })
        const links = overlayRef.value.querySelectorAll('a')

        // Set initial states for both backgrounds
        $gsap.set(backgroundRef.value, {
          clipPath: 'inset(100% 0 0 0)', // Hidden at bottom
          willChange: 'clip-path'
        })

        $gsap.set(overlayRef.value, {
          opacity: 1,
          clipPath: 'inset(100% 0 0 0)', // Hidden at bottom
          willChange: 'clip-path'
        })

        // Apply SplitText to nav links for masked reveal
        if ($SplitText && links.length > 0) {
          // Combine all link text for unified splitting
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          navSplitInstance = $SplitText.create(links as any, {
            type: 'lines',
            mask: 'lines' // Use masking for clean reveals
          })

          // Set initial state: text positioned below mask with rotation
          $gsap.set(navSplitInstance.lines, {
            yPercent: 100,
            rotate: 20,
            transformOrigin: '0% 0%'
          })
        }

        // Animation sequence
        // Phase 1: Both backgrounds clip up from bottom to top simultaneously
        menuTimeline
          .add('clipReveal') // Label for this phase
          .to(
            backgroundRef.value,
            {
              clipPath: 'inset(0% 0 0 0)',
              duration: hoverDuration * 1.17,
              ease: 'power2.out'
            },
            'clipReveal'
          )
          .to(
            overlayRef.value,
            {
              clipPath: 'inset(0% 0 0 0)', // Full reveal from bottom to top
              duration: hoverDuration * 2.17,
              ease: 'power2.out'
            },
            'clipReveal' // Start at same time as background
          )

        // Phase 2: Nav items reveal with SplitText (starts slightly before clips finish)
        if (navSplitInstance && navSplitInstance.lines) {
          menuTimeline
            .add('itemsReveal', '-=0.25') // Overlap by 0.25s for smooth flow
            .to(
              navSplitInstance.lines,
              {
                yPercent: 0,
                rotate: 0,
                duration: hoverDuration * 1.2,
                stagger: 0.08,
                ease: 'back.out(1.2)' // Bouncy, premium feel like HeroSection
              },
              'itemsReveal'
            )
        }

        // Store unified timeline
        menuTl = menuTimeline

        // Add GSDevTools for debugging in development
        if (import.meta.dev && $GSDevTools) {
          // $GSDevTools.create({
          //   animation: menuTimeline,
          //   id: "menuTimeline",
          // });
        }
      }

      // Create initial load animation if this is the first load
      if (isFirstLoad()) {
        // Use entrance animation system for unified control
        const { setupEntrance } = useEntranceAnimation()

        setupEntrance(containerRef.value, {
          position: '1.5',
          animate: (el) => {
            const tl = $gsap.timeline({
              // onStart: () =>
              //   console.log("🎬 Header entrance animation started"),
              // onComplete: () => console.log("✨ Header entrance complete"),
            })

            // Elements are already hidden by CSS + is-first-load class
            // Just set initial transform states
            const brandEl = el.querySelector('.header-grid__brand')
            const navLinks = el.querySelectorAll('.header-grid__nav')
            const spacerEl = el.querySelector('.header-grid__spacer')
            const hamburgerEl = el.querySelector('.header-grid__hamburger')

            if (brandEl) $gsap.set(brandEl, { x: -20, autoAlpha: 0 })
            if (navLinks) $gsap.set(navLinks, { y: -10, autoAlpha: 0 })
            if (spacerEl) $gsap.set(spacerEl, { x: 20, autoAlpha: 0 })
            if (hamburgerEl)
              $gsap.set(hamburgerEl, { scale: 0.8, autoAlpha: 0 })

            // Desktop theme toggle (separate from nav links for proper animation)
            if (themeToggleDesktopRef.value)
              $gsap.set(themeToggleDesktopRef.value, {
                scale: 0.8,
                autoAlpha: 0
              })

            // Animate container in first
            tl.to(el, {
              autoAlpha: 1,
              duration: 0.6,
              ease: 'power2.out'
            })

            // Then animate individual elements
            if (brandEl) {
              tl.to(
                brandEl,
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.8,
                  ease: 'power3.out'
                },
                '-=0.4'
              )
            }

            if (navLinks) {
              tl.to(
                navLinks,
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                  ease: 'power2.out',
                  stagger: 0.08
                },
                '-=0.5'
              )
            }

            // Desktop theme toggle animates with nav links (cohesive sequence)
            if (themeToggleDesktopRef.value) {
              tl.to(
                themeToggleDesktopRef.value,
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.6,
                  ease: 'power2.out'
                },
                '-=0.6'
              )
            }

            if (hamburgerEl) {
              tl.to(
                hamburgerEl,
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.5,
                  ease: 'back.out(1.5)'
                },
                '-=0.6'
              )
            }

            if (spacerEl) {
              tl.to(
                spacerEl,
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.7,
                  ease: 'power3.out'
                },
                '-=0.4'
              )
            }

            return tl
          }
        })
      }

      // Set up title animation (runs after entrance animation completes on first load)
      // Use nextTick to ensure DOM is ready after entrance animation
      nextTick(() => {
        setupTitleAnimation()
      })
    }, scopeEl)
  })
})

watch(isOpen, (open) => {
  // Animate hamburger icon
  if (hamburgerTl) {
    if (open) hamburgerTl.play()
    else hamburgerTl.reverse()
  }

  // Animate unified menu (background + overlay + nav items)
  if (menuTl) {
    if (open) {
      menuTl.play()
    }
    else {
      // Hook into reverse complete to notify store when animation finishes
      menuTl.eventCallback('onReverseComplete', () => {
        menuStore.notifyAnimationComplete()
      })
      menuTl.reverse()
    }
  }

  // Pause/resume headroom when menu toggles
  if (nuxtApp.$headroom) {
    if (open) {
      // Menu opening: pause headroom so header stays visible and stable
      nuxtApp.$headroom.pause()
    }
    else if (!isNavigating.value) {
      // Menu closing WITHOUT navigation: resume headroom immediately
      // (When navigating, page transition handles headroom resume)
      nuxtApp.$headroom.resume()
    }
  }
})

// Watch for title text changes and re-animate
// This is triggered by the animation timeline's onComplete callback
watch(
  () => titleStore.currentText,
  (newVal, oldVal) => {
    // Only re-animate if this is not the initial setup
    if (oldVal !== undefined) {
      nextTick(() => {
        setupTitleAnimation()
      })
    }
  }
)

// Menu interactions
function toggle() {
  menuStore.toggle()
}

/**
 * Handle mobile nav link clicks
 * Waits for menu close animation to complete before navigating
 * This ensures smooth, predictable transition sequencing
 */
async function handleMobileNavClick(href: string): Promise<void> {
  isNavigating.value = true
  await menuStore.closeWithAnimation()
  router.push(href)
}

// Reset navigation flag after page transition completes
nuxtApp.hook('page:finish', () => {
  isNavigating.value = false
})

onUnmounted(() => {
  // Clean up GSAP context
  if (gsapCtx && typeof gsapCtx.revert === 'function') {
    gsapCtx.revert()
  }

  // Clean up SplitText instance for nav links
  if (navSplitInstance) {
    navSplitInstance.revert?.()
    navSplitInstance = null
  }

  // Clean up title animation timeline and SplitText
  if (titleTl) {
    titleTl.kill()
    titleTl = null
  }
  if (titleSplitInstance) {
    titleSplitInstance.revert?.()
    titleSplitInstance = null
  }
})
</script>

<style scoped lang="scss"></style>
