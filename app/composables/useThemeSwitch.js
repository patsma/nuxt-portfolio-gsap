// ~/composables/useThemeSwitch.js
export default function useThemeSwitch() {
  const { $gsap, $MorphSVGPlugin } = useNuxtApp();

  // Function to toggle the GSAP timeline
  function toggleTimeline(timeline) {
    if (timeline.reversed()) {
      timeline.play();
    } else {
      timeline.reverse();
    }
  }

  // Define your themes
  const lightTheme = {
    "--color-bg": "#FFFFFF",
    "--color-text": "#000000",
    "--color-secondary": "#AAAAAA",
    "--color-tertiary": "#888888",
    "--color-gradient": "linear-gradient(to right, #FFFFFF, #DDDDDD)",
    "--color-bg-gradient": "linear-gradient(to right, #DDDDDD, #FFFFFF)",
  };

  const darkTheme = {
    "--color-bg": "#000000",
    "--color-text": "#FFFFFF",
    "--color-secondary": "#444444",
    "--color-tertiary": "#666666",
    "--color-gradient": "linear-gradient(to right, #000000, #333333)",
    "--color-bg-gradient": "linear-gradient(to right, #333333, #000000)",
  };

  // Function to initialize theme switching
  const initThemeSwitch = () => {
    if (!$gsap || !$MorphSVGPlugin) {
      console.warn("useThemeSwitch: GSAP or MorphSVGPlugin not available");
      return;
    }

    const themeSwitch = document.querySelector("#themeSwitch");
    if (!themeSwitch) {
      console.warn("useThemeSwitch: #themeSwitch button not found");
      return;
    }

    const html = document.documentElement;
    const sunDark = document.querySelector("#sun-dark");
    const sunLight = document.querySelector("#sun-light");
    const sunLightBeams = document.querySelectorAll("#sun-light-beams path");
    const sunLightInner = document.querySelector("#sun-light-inner");
    const moonDark = document.querySelector("#moon-dark");
    const moonWhite = document.querySelector("#moon-white");
    const background = document.querySelector("#bg");

    if (!sunDark || !moonWhite || !sunLightInner || !moonDark) {
      console.warn("useThemeSwitch: Required SVG elements not found");
      return;
    }

    // Convert specific circle elements to paths BEFORE morphing
    // This must happen before any morph animations are created
    const convertedMoonWhite = $MorphSVGPlugin.convertToPath(moonWhite)[0];
    const convertedSunDark = $MorphSVGPlugin.convertToPath(sunDark)[0];

    const currentBgColor = getComputedStyle(html)
      .getPropertyValue("--color-bg")
      .trim();

    // Create GSAP context for proper cleanup
    const ctx = $gsap.context(() => {
      $gsap.set([sunDark, moonDark], { autoAlpha: 0 });

      const tl = $gsap.timeline({ paused: true });

      if (currentBgColor === darkTheme["--color-bg"]) {
        tl.to(html, { ...lightTheme, ease: "power1.out", duration: 0.5 });
      } else {
        tl.to(html, { ...darkTheme, ease: "power1.out", duration: 0.5 });
      }

      tl.to(
        background,
        { duration: 0.5, fill: "#fffaf5", ease: "power1.out" },
        "<"
      );
      tl.to(
        sunLightBeams,
        { duration: 0.5, autoAlpha: 0, ease: "power1.out" },
        "<"
      );
      tl.to(
        convertedMoonWhite,
        { duration: 0.5, morphSVG: moonDark, fill: "#090925", ease: "power1.out" },
        "<"
      );
      tl.to(
        sunLightInner,
        { duration: 0.5, morphSVG: convertedSunDark, fill: "#090925", ease: "power1.out" },
        "<"
      );
      tl.reverse();

      themeSwitch.addEventListener("click", function () {
        toggleTimeline(tl);
      });
    }, themeSwitch);

    // Return cleanup function
    return () => {
      if (ctx) ctx.revert();
    };
  };

  return { initThemeSwitch };
}
