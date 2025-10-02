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

  // Define your themes - using your project colors
  const lightTheme = {
    "--theme-bg": "#fffaf5", // --color-light-100
    "--theme-text": "#090925", // --color-dark-100
    "--theme-text-muted": "rgba(9, 9, 37, 0.6)", // --color-dark-60
    "--theme-accent": "#090925",
  };

  const darkTheme = {
    "--theme-bg": "#090925", // --color-dark-100
    "--theme-text": "#fffaf5", // --color-light-100
    "--theme-text-muted": "rgba(255, 250, 245, 0.6)", // --color-light-60
    "--theme-accent": "#fffaf5",
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

      // Create a proxy object to animate color values
      const colorProxy = {
        bgR: 255,
        bgG: 250,
        bgB: 245,
        textR: 9,
        textG: 9,
        textB: 37,
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

      // Animate the proxy object's color values
      tl.to(
        colorProxy,
        {
          bgR: 9,
          bgG: 9,
          bgB: 37,
          textR: 255,
          textG: 250,
          textB: 245,
          duration: 0.6,
          ease: "power2.inOut",
        },
        0
      );

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
