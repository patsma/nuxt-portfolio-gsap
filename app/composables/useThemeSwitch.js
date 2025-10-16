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

  // Helper to parse rgba() or hex string to RGB object
  const parseColor = (colorString) => {
    // Try rgba() format first
    const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3]),
      };
    }

    // Try hex format (#ffffff or #fff)
    const hexMatch =
      colorString.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i) ||
      colorString.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
    if (hexMatch) {
      return {
        r: parseInt(
          hexMatch[1].length === 1 ? hexMatch[1] + hexMatch[1] : hexMatch[1],
          16
        ),
        g: parseInt(
          hexMatch[2].length === 1 ? hexMatch[2] + hexMatch[2] : hexMatch[2],
          16
        ),
        b: parseInt(
          hexMatch[3].length === 1 ? hexMatch[3] + hexMatch[3] : hexMatch[3],
          16
        ),
      };
    }

    return { r: 0, g: 0, b: 0 };
  };

  // Helper function to initialize a single theme toggle button
  const initButton = (
    button,
    themeStore,
    html,
    colors,
    gradientColors,
    themeDuration,
    tl
  ) => {
    if (!button) return;

    // Find SVG elements within this button's context using attribute selectors
    // Elements have unique IDs like "theme-toggle-X-bg", so we match by ID suffix
    const svgRoot = button.querySelector("svg");
    if (!svgRoot) {
      console.warn("useThemeSwitch: SVG not found in button", button.id);
      return;
    }

    const sunDark = svgRoot.querySelector('[id$="-sun-dark"]');
    const sunLight = svgRoot.querySelector('[id$="-sun-light"]');
    const sunLightBeams = svgRoot.querySelectorAll(
      '[id$="-sun-light-beams"] path'
    );
    const sunLightInner = svgRoot.querySelector('[id$="-sun-light-inner"]');
    const moonDark = svgRoot.querySelector('[id$="-moon-dark"]');
    const moonWhite = svgRoot.querySelector('[id$="-moon-white"]');
    const background = svgRoot.querySelector('[id$="-bg"]');

    if (!sunDark || !moonWhite || !sunLightInner || !moonDark) {
      console.warn(
        "useThemeSwitch: Required SVG elements not found in button",
        button.id
      );
      return;
    }

    // Convert specific circle elements to paths BEFORE morphing
    const convertedMoonWhite = $MorphSVGPlugin.convertToPath(moonWhite)[0];
    const convertedSunDark = $MorphSVGPlugin.convertToPath(sunDark)[0];

    // Use the converted elements for setting initial state
    $gsap.set([convertedSunDark, moonDark], { autoAlpha: 0 });

    // SVG icon animations - sync with theme colors
    const lightHex = `#${((1 << 24) + (colors.light["100"].r << 16) + (colors.light["100"].g << 8) + colors.light["100"].b).toString(16).slice(1)}`;
    const darkHex = `#${((1 << 24) + (colors.dark["100"].r << 16) + (colors.dark["100"].g << 8) + colors.dark["100"].b).toString(16).slice(1)}`;

    // Always set to light (start state), timeline.progress() will move to dark if needed
    $gsap.set(background, { fill: darkHex, fillOpacity: 0.6 });
    $gsap.set(sunLightBeams, { autoAlpha: 1, fill: lightHex });
    $gsap.set(convertedMoonWhite, { fill: lightHex });
    $gsap.set(sunLightInner, { fill: lightHex });
    $gsap.set([convertedSunDark, moonDark], { autoAlpha: 0 });

    // Add animations to the shared timeline for this button's SVG
    // These will be added to the timeline that already handles color transitions
    tl.to(
      background,
      {
        duration: themeDuration,
        fill: lightHex,
        fillOpacity: 0.6,
        ease: "power2.inOut",
      },
      0
    );
    tl.to(
      sunLightBeams,
      { duration: themeDuration, autoAlpha: 0, ease: "power2.inOut" },
      0
    );
    tl.to(
      convertedMoonWhite,
      {
        duration: themeDuration,
        morphSVG: moonDark,
        fill: darkHex,
        ease: "power2.inOut",
      },
      0
    );
    tl.to(
      sunLightInner,
      {
        duration: themeDuration,
        morphSVG: convertedSunDark,
        fill: darkHex,
        ease: "power2.inOut",
      },
      0
    );

    // Button click ONLY toggles store - store is source of truth
    button.addEventListener("click", function () {
      // Get current state BEFORE toggle
      const wasLight = !themeStore.isDark;

      // console.log("🖱️ [Theme Toggle] Button clicked:", button.id);
      // console.log("  → Was:", wasLight ? "LIGHT" : "DARK");

      // Toggle store ONCE
      themeStore.toggle();

      // console.log("  → Now:", themeStore.isDark ? "DARK" : "LIGHT");

      // Animate timeline based on NEW state (simple toggle)
      if (wasLight) {
        // Was light, now dark → animate forward
        // console.log("  → Animating timeline: play() → progress 1");
        tl.play();
      } else {
        // Was dark, now light → animate backward
        // console.log("  → Animating timeline: reverse() → progress 0");
        tl.reverse();
      }
    });
  };

  // Function to initialize theme switching
  const initThemeSwitch = () => {
    // console.log("🎨 initThemeSwitch called!");
    // console.log("$gsap:", !!$gsap, "$MorphSVGPlugin:", !!$MorphSVGPlugin);

    if (!$gsap || !$MorphSVGPlugin) {
      console.warn("useThemeSwitch: GSAP or MorphSVGPlugin not available");
      return;
    }

    // Query for both desktop and mobile theme toggle buttons
    const themeSwitchDesktop = document.querySelector("#themeSwitch");
    const themeSwitchMobile = document.querySelector("#themeSwitchMobile");

    if (!themeSwitchDesktop && !themeSwitchMobile) {
      console.warn("useThemeSwitch: No theme switch buttons found");
      return;
    }

    // Use theme store as single source of truth for TOGGLING
    const themeStore = useThemeStore();
    const html = document.documentElement;

    // Read initial theme directly from same source as blocking script
    // Can't rely on Pinia hydration timing - it may not have run yet
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDarkInitially = stored ? stored === "dark" : prefersDark;

    // CRITICAL: Immediately sync Pinia store state with what we just read
    // This prevents the double-click bug when starting with dark theme
    // Without this, store might still have default isDark: false
    // causing button logic to think it's light when timeline is actually dark
    themeStore.isDark = isDarkInitially;

    // console.log(
    //   "🎬 [GSAP Timeline] Reading initial theme directly:",
    //   "| localStorage:",
    //   stored || "null",
    //   "| system prefers:",
    //   prefersDark ? "dark" : "light",
    //   "| isDark:",
    //   isDarkInitially,
    //   "| Store synced:",
    //   themeStore.isDark
    // );

    // Read all color values from CSS custom properties - single source of truth!
    const colorVariants = ["100", "60", "50", "40", "30", "15", "5"];
    const colors = {
      light: {},
      dark: {},
    };

    colorVariants.forEach((variant) => {
      const lightStr = getComputedStyle(html)
        .getPropertyValue(`--color-light-${variant}`)
        .trim();
      const darkStr = getComputedStyle(html)
        .getPropertyValue(`--color-dark-${variant}`)
        .trim();
      colors.light[variant] = parseColor(lightStr);
      colors.dark[variant] = parseColor(darkStr);
    });

    // Read gradient colors for FluidGradient component
    const gradientCorners = ["tl", "tr", "bl", "br"];
    const gradientColors = {
      light: {},
      dark: {},
    };

    gradientCorners.forEach((corner) => {
      const lightStr = getComputedStyle(html)
        .getPropertyValue(`--gradient-light-${corner}`)
        .trim();
      const darkStr = getComputedStyle(html)
        .getPropertyValue(`--gradient-dark-${corner}`)
        .trim();

      // console.log(`📊 Raw CSS for gradient-light-${corner}:`, lightStr);
      // console.log(`📊 Raw CSS for gradient-dark-${corner}:`, darkStr);

      gradientColors.light[corner] = parseColor(lightStr);
      gradientColors.dark[corner] = parseColor(darkStr);

      // console.log(`📊 Parsed light ${corner}:`, gradientColors.light[corner]);
      // console.log(`📊 Parsed dark ${corner}:`, gradientColors.dark[corner]);
    });

    // console.log("🎨 Colors from CSS:", colors);
    // console.log("🌈 Gradient colors from CSS:", gradientColors);

    // Create GSAP context for proper cleanup
    const ctx = $gsap.context(() => {
      // Create a proxy object to animate ALL color values
      // ALWAYS initialize from LIGHT theme (timeline start position)
      // Timeline animates FROM light (progress 0) TO dark (progress 1)
      const colorProxy = {
        // Light theme → background = light, text = dark
        bgR: colors.light["100"].r,
        bgG: colors.light["100"].g,
        bgB: colors.light["100"].b,
        textR: colors.dark["100"].r,
        textG: colors.dark["100"].g,
        textB: colors.dark["100"].b,
        // Gradient colors (light theme)
        gradTL_R: gradientColors.light.tl.r,
        gradTL_G: gradientColors.light.tl.g,
        gradTL_B: gradientColors.light.tl.b,
        gradTR_R: gradientColors.light.tr.r,
        gradTR_G: gradientColors.light.tr.g,
        gradTR_B: gradientColors.light.tr.b,
        gradBL_R: gradientColors.light.bl.r,
        gradBL_G: gradientColors.light.bl.g,
        gradBL_B: gradientColors.light.bl.b,
        gradBR_R: gradientColors.light.br.r,
        gradBR_G: gradientColors.light.br.g,
        gradBR_B: gradientColors.light.br.b,
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
            // console.log(
            //   `🎨 onUpdate #${updateCount}: bg(${bgR},${bgG},${bgB}) text(${textR},${textG},${textB})`
            // );
          }

          // Update ALL theme variables with interpolated color values on EVERY frame
          // Background variants use TEXT color (inverted!) - so accent backgrounds are visible
          // Light theme: light bg + dark accent backgrounds
          // Dark theme: dark bg + light accent backgrounds
          html.style.setProperty("--theme-100", toRgba(bgR, bgG, bgB, 1));
          html.style.setProperty(
            "--theme-60",
            toRgba(textR, textG, textB, 0.6)
          );
          html.style.setProperty(
            "--theme-50",
            toRgba(textR, textG, textB, 0.5)
          );
          html.style.setProperty(
            "--theme-40",
            toRgba(textR, textG, textB, 0.4)
          );
          html.style.setProperty(
            "--theme-30",
            toRgba(textR, textG, textB, 0.3)
          );
          html.style.setProperty(
            "--theme-15",
            toRgba(textR, textG, textB, 0.15)
          );
          html.style.setProperty(
            "--theme-5",
            toRgba(textR, textG, textB, 0.05)
          );

          // Text variants use TEXT color
          html.style.setProperty(
            "--theme-text-100",
            toRgba(textR, textG, textB, 1)
          );
          html.style.setProperty(
            "--theme-text-60",
            toRgba(textR, textG, textB, 0.6)
          );
          html.style.setProperty(
            "--theme-text-50",
            toRgba(textR, textG, textB, 0.5)
          );
          html.style.setProperty(
            "--theme-text-40",
            toRgba(textR, textG, textB, 0.4)
          );
          html.style.setProperty(
            "--theme-text-30",
            toRgba(textR, textG, textB, 0.3)
          );
          html.style.setProperty(
            "--theme-text-15",
            toRgba(textR, textG, textB, 0.15)
          );
          html.style.setProperty(
            "--theme-text-5",
            toRgba(textR, textG, textB, 0.05)
          );

          // Gradient colors for FluidGradient background
          const gradTL = toRgba(
            Math.round(colorProxy.gradTL_R),
            Math.round(colorProxy.gradTL_G),
            Math.round(colorProxy.gradTL_B),
            1
          );
          const gradTR = toRgba(
            Math.round(colorProxy.gradTR_R),
            Math.round(colorProxy.gradTR_G),
            Math.round(colorProxy.gradTR_B),
            1
          );
          const gradBL = toRgba(
            Math.round(colorProxy.gradBL_R),
            Math.round(colorProxy.gradBL_G),
            Math.round(colorProxy.gradBL_B),
            1
          );
          const gradBR = toRgba(
            Math.round(colorProxy.gradBR_R),
            Math.round(colorProxy.gradBR_G),
            Math.round(colorProxy.gradBR_B),
            1
          );

          if (updateCount % 10 === 0 || updateCount === 1) {
            // console.log(
            //   `🌈 Gradient colors #${updateCount}:`,
            //   { gradTL, gradTR, gradBL, gradBR }
            // );
          }

          html.style.setProperty("--gradient-tl", gradTL);
          html.style.setProperty("--gradient-tr", gradTR);
          html.style.setProperty("--gradient-bl", gradBL);
          html.style.setProperty("--gradient-br", gradBR);
        },
      });

      // Read theme duration from CSS variable for consistency - handle both 's' and 'ms' units
      const themeDurationRaw = getComputedStyle(html)
        .getPropertyValue("--duration-theme")
        .trim();

      let themeDuration = 0.6; // Default fallback
      if (themeDurationRaw.endsWith("ms")) {
        themeDuration = parseFloat(themeDurationRaw) / 1000; // Convert ms to seconds
      } else if (themeDurationRaw.endsWith("s")) {
        themeDuration = parseFloat(themeDurationRaw); // Already in seconds
      }

      // console.log('🎨 Theme duration raw:', themeDurationRaw, 'parsed:', themeDuration, 'seconds');

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
          // Gradient colors - animate to dark theme
          gradTL_R: gradientColors.dark.tl.r,
          gradTL_G: gradientColors.dark.tl.g,
          gradTL_B: gradientColors.dark.tl.b,
          gradTR_R: gradientColors.dark.tr.r,
          gradTR_G: gradientColors.dark.tr.g,
          gradTR_B: gradientColors.dark.tr.b,
          gradBL_R: gradientColors.dark.bl.r,
          gradBL_G: gradientColors.dark.bl.g,
          gradBL_B: gradientColors.dark.bl.b,
          gradBR_R: gradientColors.dark.br.r,
          gradBR_G: gradientColors.dark.br.g,
          gradBR_B: gradientColors.dark.br.b,
          duration: themeDuration,
          ease: "power2.inOut",
        },
        0
      );

      // Initialize both theme toggle buttons with the shared timeline
      // Each button's SVG elements will be animated by the same timeline
      initButton(
        themeSwitchDesktop,
        themeStore,
        html,
        colors,
        gradientColors,
        themeDuration,
        tl
      );
      initButton(
        themeSwitchMobile,
        themeStore,
        html,
        colors,
        gradientColors,
        themeDuration,
        tl
      );

      // Set initial timeline position based on localStorage reading (not store)
      // Store will eventually sync via hydration, but timeline needs correct state NOW
      tl.progress(isDarkInitially ? 1 : 0).pause();
      // console.log('🎬 [GSAP Timeline] Timeline initialized:',
      //   '| Progress set to:', tl.progress(),
      //   '| Visual state:', isDarkInitially ? 'DARK' : 'LIGHT',
      //   '| Buttons initialized:', {
      //     desktop: !!themeSwitchDesktop,
      //     mobile: !!themeSwitchMobile
      //   });
    });

    // Return cleanup function
    return () => {
      if (ctx) ctx.revert();
    };
  };

  return { initThemeSwitch };
}
