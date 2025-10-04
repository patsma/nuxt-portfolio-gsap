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
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
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
    const isDarkInitially = html.classList.contains("theme-dark");

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
      colors.light[variant] = parseRgba(lightStr);
      colors.dark[variant] = parseRgba(darkStr);
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
      gradientColors.light[corner] = parseRgba(lightStr);
      gradientColors.dark[corner] = parseRgba(darkStr);
    });

    console.log("🎨 Colors from CSS:", colors);
    console.log("🌈 Gradient colors from CSS:", gradientColors);
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

      // Create a proxy object to animate ALL color values
      // Initialize from current theme to avoid first-frame jump
      const colorProxy = isDarkInitially
        ? {
            // Dark theme active → background = dark, text = light
            bgR: colors.dark["100"].r,
            bgG: colors.dark["100"].g,
            bgB: colors.dark["100"].b,
            textR: colors.light["100"].r,
            textG: colors.light["100"].g,
            textB: colors.light["100"].b,
            // Gradient colors (dark theme)
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
          }
        : {
            // Light theme active → background = light, text = dark
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
            console.log(
              `🎨 onUpdate #${updateCount}: bg(${bgR},${bgG},${bgB}) text(${textR},${textG},${textB})`
            );
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
          html.style.setProperty(
            "--gradient-tl",
            toRgba(
              Math.round(colorProxy.gradTL_R),
              Math.round(colorProxy.gradTL_G),
              Math.round(colorProxy.gradTL_B),
              1
            )
          );
          html.style.setProperty(
            "--gradient-tr",
            toRgba(
              Math.round(colorProxy.gradTR_R),
              Math.round(colorProxy.gradTR_G),
              Math.round(colorProxy.gradTR_B),
              1
            )
          );
          html.style.setProperty(
            "--gradient-bl",
            toRgba(
              Math.round(colorProxy.gradBL_R),
              Math.round(colorProxy.gradBL_G),
              Math.round(colorProxy.gradBL_B),
              1
            )
          );
          html.style.setProperty(
            "--gradient-br",
            toRgba(
              Math.round(colorProxy.gradBR_R),
              Math.round(colorProxy.gradBR_G),
              Math.round(colorProxy.gradBR_B),
              1
            )
          );
        },
      });

      // Read theme duration from CSS variable for consistency
      const themeDuration =
        parseFloat(
          getComputedStyle(html).getPropertyValue("--duration-theme")
        ) / 1000 || 0.6;

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

      // SVG icon animations - sync with color theme using same duration
      const lightHex = `#${((1 << 24) + (colors.light["100"].r << 16) + (colors.light["100"].g << 8) + colors.light["100"].b).toString(16).slice(1)}`;
      const darkHex = `#${((1 << 24) + (colors.dark["100"].r << 16) + (colors.dark["100"].g << 8) + colors.dark["100"].b).toString(16).slice(1)}`;

      // Set initial states explicitly so GSAP knows where to animate from
      if (isDarkInitially) {
        // Already dark → set to timeline end visuals
        $gsap.set(background, { fill: lightHex, fillOpacity: 0.6 });
        $gsap.set(sunLightBeams, { autoAlpha: 0, fill: lightHex });
        $gsap.set(convertedMoonWhite, { fill: darkHex });
        $gsap.set(sunLightInner, { fill: darkHex });
      } else {
        // Light theme visuals
        $gsap.set(background, { fill: darkHex, fillOpacity: 0.6 });
        $gsap.set(sunLightBeams, { autoAlpha: 1, fill: lightHex });
        $gsap.set(convertedMoonWhite, { fill: lightHex });
        $gsap.set(sunLightInner, { fill: lightHex });
      }

      // Animate TO dark theme state
      tl.to(
        background,
        {
          duration: themeDuration,
          fill: lightHex,
          fillOpacity: 0.6,
          ease: "power2.inOut",
        },
        "<"
      );
      tl.to(
        sunLightBeams,
        { duration: themeDuration, autoAlpha: 0, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        convertedMoonWhite,
        {
          duration: themeDuration,
          morphSVG: moonDark,
          fill: darkHex,
          ease: "power2.inOut",
        },
        "<"
      );
      tl.to(
        sunLightInner,
        {
          duration: themeDuration,
          morphSVG: convertedSunDark,
          fill: darkHex,
          ease: "power2.inOut",
        },
        "<"
      );

      // Sync timeline with current theme and choose first-click direction
      // - If dark initially → set progress to 1 and first click should go back to light (reverse)
      // - If light initially → set progress to 0 and first click should go to dark (play)
      tl.progress(isDarkInitially ? 1 : 0).pause();
      tl.reversed(!isDarkInitially);

      themeSwitch.addEventListener("click", function () {
        console.log("Theme switch clicked!");
        console.log("Timeline reversed?", tl.reversed());
        console.log("Timeline progress:", tl.progress());
        console.log("Current colorProxy values:", colorProxy);
        toggleTimeline(tl);
        console.log("After toggle - reversed?", tl.reversed());

        // Use theme store for centralized state management
        const themeStore = useThemeStore();
        themeStore.toggle();
      });
    }, themeSwitch);

    // Return cleanup function
    return () => {
      if (ctx) ctx.revert();
    };
  };

  return { initThemeSwitch };
}
