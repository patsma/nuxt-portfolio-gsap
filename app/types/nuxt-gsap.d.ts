/**
 * Type augmentation for GSAP plugins injected by @hypernym/nuxt-gsap
 *
 * This provides TypeScript support for GSAP in Vue components and composables.
 */

// GSAP core types (simplified for our usage)
interface GSAPStatic {
  timeline: (config?: Record<string, unknown>) => GSAPTimeline
  set: (targets: unknown, vars: Record<string, unknown>) => void
  to: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTween
  fromTo: (targets: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>) => GSAPTween
  context: (fn: () => void, scope?: unknown) => GSAPContext
  utils: {
    toArray: <T>(items: unknown) => T[]
    snap: (value: number | false) => (v: number) => number
    wrap: ((min: number, max: number, value: number) => number) & ((min: number, max: number) => (value: number) => number)
  }
  getProperty: (target: Element, property: string, unit?: string) => number
  killTweensOf: (targets: unknown) => void
}

interface GSAPTimeline {
  to: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  from: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  fromTo: (targets: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  add: (animation: unknown, position?: number | string) => GSAPTimeline
  play: (from?: number | string) => GSAPTimeline
  pause: (atTime?: number | string, suppressEvents?: boolean) => GSAPTimeline
  resume: () => GSAPTimeline
  reverse: (from?: number | string, suppressEvents?: boolean) => GSAPTimeline
  restart: (includeDelay?: boolean, suppressEvents?: boolean) => GSAPTimeline
  progress: (value?: number, suppressEvents?: boolean) => GSAPTimeline | number
  totalTime: (time: number) => GSAPTimeline
  rawTime: () => number
  duration: () => number
  time: () => number
  timeScale: (scale?: number) => GSAPTimeline | number
  tweenTo: (time: number, vars?: Record<string, unknown>) => GSAPTween
  kill: () => void
  seek: (time: number | string, suppressEvents?: boolean) => GSAPTimeline
  scrollTrigger?: ScrollTriggerInstance
  vars: Record<string, unknown>
}

interface GSAPTween {
  play: () => GSAPTween
  pause: () => GSAPTween
  kill: () => void
}

interface GSAPContext {
  revert: () => void
  kill: () => void
  add: (fn: () => void) => void
}

// GSDevTools type
interface GSDevToolsStatic {
  create: (config?: Record<string, unknown>) => GSDevToolsInstance
  getById: (id: string) => GSDevToolsInstance | null
}

interface GSDevToolsInstance {
  kill: () => void
}

// CustomBounce type
interface CustomBounceStatic {
  create: (id: string, config?: Record<string, unknown>) => void
}

interface ScrollTriggerStatic {
  create: (config: Record<string, unknown>) => ScrollTriggerInstance
  refresh: () => void
  getAll: () => ScrollTriggerInstance[]
  getById: (id: string) => ScrollTriggerInstance | null
  kill: (reset?: boolean) => void
}

interface ScrollTriggerInstance {
  kill: (reset?: boolean) => void
  refresh: () => void
  pin?: Element | null
  trigger?: Element | null
  progress: number
}

interface SplitTextStatic {
  create: (element: Element, config: Record<string, unknown>) => SplitTextInstance
}

interface SplitTextInstance {
  chars?: Element[]
  words?: Element[]
  lines?: Element[]
  revert: () => void
  [key: string]: unknown
}

interface ScrollSmootherStatic {
  create: (config: Record<string, unknown>) => ScrollSmootherInstance
  get: () => ScrollSmootherInstance | null
}

interface ScrollSmootherInstance {
  kill: () => void
  refresh: () => void
  scrollTo: (position: number | string | Element, smooth?: boolean) => void
  effects: (selector: string) => void
  paused: (value?: boolean) => boolean
}

interface MorphSVGPluginStatic {
  convertToPath: (element: Element | null) => Element[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DrawSVGPluginStatic {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ObserverPluginStatic {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FlipPluginStatic {}

// Headroom controller type
interface HeadroomController {
  updateHeader: (currentScroll: number) => void
  reset: () => void
  pause: () => void
  resume: () => void
  unpause: () => void
}

// Augment NuxtApp to include GSAP plugins
declare module '#app' {
  interface NuxtApp {
    $gsap: GSAPStatic
    $ScrollTrigger: ScrollTriggerStatic
    $SplitText: SplitTextStatic
    $ScrollSmoother: ScrollSmootherStatic
    $MorphSVGPlugin: MorphSVGPluginStatic
    $DrawSVGPlugin: DrawSVGPluginStatic
    $Observer: ObserverPluginStatic
    $Flip: FlipPluginStatic
    $headroom: HeadroomController
    $GSDevTools: GSDevToolsStatic
    $CustomBounce: CustomBounceStatic
  }
}

// Also augment the Vue instance for Options API usage
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $gsap: GSAPStatic
    $ScrollTrigger: ScrollTriggerStatic
  }
}

// Export types for use in composables
export type {
  GSAPStatic,
  GSAPTimeline,
  GSAPTween,
  GSAPContext,
  ScrollTriggerStatic,
  ScrollTriggerInstance,
  SplitTextStatic,
  SplitTextInstance,
  ScrollSmootherStatic,
  ScrollSmootherInstance,
  MorphSVGPluginStatic
}
