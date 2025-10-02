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

    // Read all color values from CSS custom properties - single source of truth!
    const colorVariants = ["100", "60", "50", "40", "30", "15", "5"];
    const colors = {
      light: {},
      dark: {},
    };

    colorVariants.forEach((variant) => {
      const lightStr = getComputedStyle(html).getPropertyValue(`--color-light-${variant}`).trim();
      const darkStr = getComputedStyle(html).getPropertyValue(`--color-dark-${variant}`).trim();
      colors.light[variant] = parseRgba(lightStr);
      colors.dark[variant] = parseRgba(darkStr);
    });

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

      // Create a proxy object to animate ALL color values - start with light theme
      const colorProxy = {
        bgR: colors.light["100"].r,
        bgG: colors.light["100"].g,
        bgB: colors.light["100"].b,
        textR: colors.dark["100"].r,
        textG: colors.dark["100"].g,
        textB: colors.dark["100"].b,
      };

      let updateCount = 0;
      const tl = $gsap.timeline({
        paused: true,
        onUpdate: function () {
          updateCount++;
          // Format as rgba colors for CSS custom properties
          const toRgba = (r, g, b, a) => {
            return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
          };

          const bgR = Math.round(colorProxy.bgR);
          const bgG = Math.round(colorProxy.bgG);
          const bgB = Math.round(colorProxy.bgB);
          const textR = Math.round(colorProxy.textR);
          const textG = Math.round(colorProxy.textG);
          const textB = Math.round(colorProxy.textB);

          if (updateCount % 10 === 0 || updateCount === 1) {
            console.log(`🎨 onUpdate #${updateCount}: bg(${bgR},${bgG},${bgB}) text(${textR},${textG},${textB})`);
          }

          // Update ALL theme variables with interpolated color values on EVERY frame
          // Background variants use TEXT color (inverted!) - so accent backgrounds are visible
          // Light theme: light bg + dark accent backgrounds
          // Dark theme: dark bg + light accent backgrounds
          html.style.setProperty("--theme-100", toRgba(bgR, bgG, bgB, 1));
          html.style.setProperty("--theme-60", toRgba(textR, textG, textB, 0.6));
          html.style.setProperty("--theme-50", toRgba(textR, textG, textB, 0.5));
          html.style.setProperty("--theme-40", toRgba(textR, textG, textB, 0.4));
          html.style.setProperty("--theme-30", toRgba(textR, textG, textB, 0.3));
          html.style.setProperty("--theme-15", toRgba(textR, textG, textB, 0.15));
          html.style.setProperty("--theme-5", toRgba(textR, textG, textB, 0.05));

          // Text variants use TEXT color
          html.style.setProperty("--theme-text-100", toRgba(textR, textG, textB, 1));
          html.style.setProperty("--theme-text-60", toRgba(textR, textG, textB, 0.6));
          html.style.setProperty("--theme-text-50", toRgba(textR, textG, textB, 0.5));
          html.style.setProperty("--theme-text-40", toRgba(textR, textG, textB, 0.4));
          html.style.setProperty("--theme-text-30", toRgba(textR, textG, textB, 0.3));
          html.style.setProperty("--theme-text-15", toRgba(textR, textG, textB, 0.15));
          html.style.setProperty("--theme-text-5", toRgba(textR, textG, textB, 0.05));
        }
      });

      // Read theme duration from CSS variable for consistency
      const themeDuration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-theme")) / 1000 || 0.6;

      // Animate the proxy object's color values - light to dark
      tl.to(
        colorProxy,
        {
          bgR: colors.dark["100"].r,
          bgG: colors.dark["100"].g,
          bgB: colors.dark["100"].b,
          textR: colors.light["100"].r,
          textG: colors.light["100"].g,
          textB: colors.light["100"].b,
          duration: themeDuration,
          ease: "power2.inOut",
        },
        0
      );

      // SVG icon animations - sync with color theme using same duration
      const lightHex = `#${((1 << 24) + (colors.light["100"].r << 16) + (colors.light["100"].g << 8) + colors.light["100"].b).toString(16).slice(1)}`;
      const darkHex = `#${((1 << 24) + (colors.dark["100"].r << 16) + (colors.dark["100"].g << 8) + colors.dark["100"].b).toString(16).slice(1)}`;

      // Set initial states explicitly so GSAP knows where to animate from
      $gsap.set(background, { fill: darkHex, fillOpacity: 0.6 }); // Starts dark 60% on light theme
      $gsap.set(sunLightBeams, { autoAlpha: 1, fill: lightHex }); // Sun beams visible and light on light theme
      $gsap.set(convertedMoonWhite, { fill: lightHex }); // Moon starts light
      $gsap.set(sunLightInner, { fill: lightHex }); // Sun starts light

      // Animate TO dark theme state
      tl.to(
        background,
        { duration: themeDuration, fill: lightHex, fillOpacity: 0.6, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        sunLightBeams,
        { duration: themeDuration, autoAlpha: 0, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        convertedMoonWhite,
        { duration: themeDuration, morphSVG: moonDark, fill: darkHex, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        sunLightInner,
        { duration: themeDuration, morphSVG: convertedSunDark, fill: darkHex, ease: "power2.inOut" },
        "<"
      );

      // Start with light theme (progress at 0, timeline paused, not reversed)
      // User clicks will toggle between light (progress 0) and dark (progress 1)
      tl.progress(0).pause();

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
