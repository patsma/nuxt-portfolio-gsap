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

  // Helper to parse rgba() string to RGB object
  const parseRgba = (rgbaString) => {
    const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    return { r: 0, g: 0, b: 0 };
  };

  // Function to initialize theme switching
  const initThemeSwitch = () => {
    console.log("🎨 initThemeSwitch called!");
    console.log("$gsap:", !!$gsap, "$MorphSVGPlugin:", !!$MorphSVGPlugin);

    if (!$gsap || !$MorphSVGPlugin) {
      console.warn("useThemeSwitch: GSAP or MorphSVGPlugin not available");
      return;
    }

    const themeSwitch = document.querySelector("#themeSwitch");
    console.log("Theme switch button found:", !!themeSwitch);

    if (!themeSwitch) {
      console.warn("useThemeSwitch: #themeSwitch button not found");
      return;
    }

    const html = document.documentElement;

    // Read color values from CSS custom properties - single source of truth!
    const light100Str = getComputedStyle(html).getPropertyValue("--color-light-100").trim();
    const dark100Str = getComputedStyle(html).getPropertyValue("--color-dark-100").trim();

    const colors = {
      light100: parseRgba(light100Str),
      dark100: parseRgba(dark100Str),
    };

    console.log("🎨 Colors from CSS:", colors);
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

    // Create GSAP context for proper cleanup
    const ctx = $gsap.context(() => {
      // Use the converted elements for setting initial state
      $gsap.set([convertedSunDark, moonDark], { autoAlpha: 0 });

      // Create a proxy object to animate color values - start with light theme
      const colorProxy = {
        bgR: colors.light100.r,
        bgG: colors.light100.g,
        bgB: colors.light100.b,
        textR: colors.dark100.r,
        textG: colors.dark100.g,
        textB: colors.dark100.b,
      };

      let updateCount = 0;
      const tl = $gsap.timeline({
        paused: true,
        onUpdate: function () {
          updateCount++;
          // Format as hex colors for CSS custom properties
          const toHex = (r, g, b) => {
            const hex = ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
            return `#${hex}`;
          };

          const bgColor = toHex(colorProxy.bgR, colorProxy.bgG, colorProxy.bgB);
          const textColor = toHex(colorProxy.textR, colorProxy.textG, colorProxy.textB);

          if (updateCount % 10 === 0 || updateCount === 1) {
            console.log(`🎨 onUpdate #${updateCount}:`, bgColor, textColor);
          }

          // Update CSS variables with interpolated color values on EVERY frame
          html.style.setProperty("--theme-bg", bgColor);
          html.style.setProperty("--theme-text", textColor);
          html.style.setProperty("--theme-text-muted", textColor); // Will use opacity in CSS
          html.style.setProperty("--theme-accent", textColor);
        }
      });

      // Animate the proxy object's color values - light to dark
      tl.to(
        colorProxy,
        {
          bgR: colors.dark100.r,
          bgG: colors.dark100.g,
          bgB: colors.dark100.b,
          textR: colors.light100.r,
          textG: colors.light100.g,
          textB: colors.light100.b,
          duration: 0.6,
          ease: "power2.inOut",
        },
        0
      );

      // SVG icon animations - sync with color theme
      const lightHex = `#${((1 << 24) + (colors.light100.r << 16) + (colors.light100.g << 8) + colors.light100.b).toString(16).slice(1)}`;
      const darkHex = `#${((1 << 24) + (colors.dark100.r << 16) + (colors.dark100.g << 8) + colors.dark100.b).toString(16).slice(1)}`;

      tl.to(
        background,
        { duration: 0.5, fill: lightHex, ease: "power1.out" },
        "<"
      );
      tl.to(
        sunLightBeams,
        { duration: 0.5, autoAlpha: 0, ease: "power1.out" },
        "<"
      );
      tl.to(
        convertedMoonWhite,
        { duration: 0.5, morphSVG: moonDark, fill: darkHex, ease: "power1.out" },
        "<"
      );
      tl.to(
        sunLightInner,
        { duration: 0.5, morphSVG: convertedSunDark, fill: darkHex, ease: "power1.out" },
        "<"
      );
      tl.reverse();

      themeSwitch.addEventListener("click", function () {
        console.log("Theme switch clicked!");
        console.log("Timeline reversed?", tl.reversed());
        console.log("Timeline progress:", tl.progress());
        console.log("Current colorProxy values:", colorProxy);
        toggleTimeline(tl);
        console.log("After toggle - reversed?", tl.reversed());
      });
    }, themeSwitch);

    // Return cleanup function
    return () => {
      if (ctx) ctx.revert();
    };
  };

  return { initThemeSwitch };
}
