<template>
  <main class="p-6 md:p-8 lg:p-12">
    <header class="mb-8">
      <h1
        class="font-display text-step-3 md:text-step-4 font-semibold tracking-tight"
      >
        Typography Board
      </h1>
      <p class="mt-2 text-stone-600 font-body text-step-0">
        Preview of display/body fonts using fluid tokens.
      </p>
    </header>

    <section class="space-y-10">
      <!-- Display samples (PP Eiko) -->
      <div>
        <h2 class="mb-4 text-xl font-medium text-stone-700">
          Display – PP Eiko
        </h2>
        <div class="grid gap-6">
          <div class="font-display tracking-tight leading-display text-step-8">
            Lorem ipsum dolor sit amet
          </div>
          <div
            class="font-display tracking-tighter leading-display text-step-7 italic"
          >
            Lorem ipsum dolor sit amet
          </div>
          <div
            class="font-display tracking-tightest leading-display text-step-6 font-[300]"
          >
            Lorem ipsum dolor sit amet
          </div>
        </div>
      </div>

      <!-- Body samples (IBM Plex Sans JP) -->
      <div>
        <h2 class="mb-4 text-xl font-medium text-stone-700">
          Body – IBM Plex Sans JP
        </h2>
        <div class="grid gap-4">
          <p class="font-body text-step-0 leading-relaxed">
            Regular body copy. The quick brown fox jumps over the lazy dog
            1234567890.
          </p>
          <p class="font-body text-step-1 leading-relaxed font-[500]">
            Medium paragraph weight. The quick brown fox jumps over the lazy
            dog.
          </p>
          <p class="font-body text-step-2 leading-loose">
            Larger paragraph with loose leading for long-form reading.
          </p>
        </div>
      </div>

      <!-- Utility matrix -->
      <div>
        <h2 class="mb-4 text-xl font-medium text-stone-700">Utility Matrix</h2>
        <div class="grid grid-cols-1 gap-6">
          <div class="p-4 rounded-lg border border-black/10">
            <h3 class="mb-2 text-sm font-medium text-stone-700">Headlines</h3>
            <div class="space-y-2">
              <div
                class="font-display text-step-7 leading-display tracking-tight"
              >
                H1 Display
              </div>
              <div class="font-display text-step-6 leading-display">
                H2 Display
              </div>
              <div class="font-display text-step-5 leading-tight">
                H3 Display
              </div>
            </div>
          </div>
          <div class="p-4 rounded-lg border border-black/10">
            <h3 class="mb-2 text-sm font-medium text-stone-700">
              Paragraph scale
            </h3>
            <div class="space-y-1">
              <p class="font-body text-step-0">Text step 0</p>
              <p class="font-body text-step-1">Text step 1</p>
              <p class="font-body text-step-2">Text step 2</p>
              <p class="font-body text-step-3">Text step 3</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Figma-named style samples (fluid mapping) -->
      <div>
        <h2 class="mb-4 text-xl font-medium text-stone-700">Figma styles</h2>
        <div class="grid gap-6">
          <div class="p-4 rounded-lg border border-black/10">
            <h3 class="mb-2 text-sm font-medium text-stone-700">PP Eiko</h3>
            <ul class="space-y-2">
              <li
                class="font-display text-step-7 leading-display tracking-tight"
              >
                PP Eiko/Mobile/H1
              </li>
              <li
                class="font-display text-step-7 leading-display tracking-tight italic"
              >
                PP Eiko/Mobile/H1 italic
              </li>
              <li class="font-display text-step-6 leading-[1.5] tracking-tight">
                PP Eiko/Mobile/H2
              </li>
              <li
                class="font-display text-step-8 leading-display tracking-tighter"
              >
                PP Eiko/Mobile/H2 enlarged
              </li>
              <li
                class="font-display text-step-8 leading-display tracking-tighter italic"
              >
                PP Eiko/Mobile/H2 enlarged italic
              </li>
              <li class="font-display text-step-5 leading-[1.4]">
                PP Eiko/Mobile/H3
              </li>
              <li class="font-display text-step-5 leading-[1.4] italic">
                PP Eiko/Mobile/H3 italic
              </li>
              <li
                class="font-display text-step-7 leading-tight tracking-tightest"
              >
                PP Eiko/Mobile/H3 enlarged
              </li>
              <li class="font-display text-step-0 font-[500] leading-[1]">
                PP Eiko/Mobile/Custom/Navigation Menu-items
              </li>
              <li
                class="font-display text-step-9 leading-display tracking-tighter"
              >
                PP Eiko/Laptop/H1
              </li>
              <li
                class="font-display text-step-9 leading-display tracking-tighter italic"
              >
                PP Eiko/Laptop/H1 italic
              </li>
              <li class="font-display text-step-4 leading-[1.5] tracking-tight">
                PP Eiko/Laptop/H2
              </li>
              <li
                class="font-display text-step-10 leading-display tracking-tightest"
              >
                PP Eiko/Laptop/H2 enlarged
              </li>
              <li
                class="font-display text-step-10 leading-display tracking-tightest italic"
              >
                PP Eiko/Laptop/H2 enlarged italic
              </li>
              <li
                class="font-display text-step-10 leading-tight tracking-tightest"
              >
                PP Eiko/Laptop/H3 enlarged
              </li>
              <li
                class="font-display text-step-8 leading-display tracking-tighter"
              >
                PP Eiko/Desktop/H1
              </li>
              <li
                class="font-display text-step-8 leading-display tracking-tighter italic"
              >
                PP Eiko/Desktop/H1 italic
              </li>
              <li class="font-display text-step-5 leading-[1.5] tracking-tight">
                PP Eiko/Desktop/H2
              </li>
              <li
                class="font-display text-step-10 leading-display tracking-tightest"
              >
                PP Eiko/Desktop/H2 enlarged
              </li>
              <li
                class="font-display text-step-10 leading-display tracking-tightest italic"
              >
                PP Eiko/Desktop/H2 enlarged italic
              </li>
              <li class="font-display text-step-4 leading-[1.4]">
                PP Eiko/Desktop/H3
              </li>
              <li class="font-display text-step-4 leading-[1.4] italic">
                PP Eiko/Desktop/H3 italic
              </li>
              <li
                class="font-display text-step-10 leading-tight tracking-tightest"
              >
                PP Eiko/Desktop/H3 enlarged
              </li>
              <li class="font-display text-step-3 font-[500] leading-[1]">
                PP Eiko/Desktop/Custom/Navigation
              </li>
              <li class="font-display text-step-6 leading-[1.5]">
                PP Eiko/Desktop large/H2
              </li>
            </ul>
          </div>
          <div class="p-4 rounded-lg border border-black/10">
            <h3 class="mb-2 text-sm font-medium text-stone-700">
              IBM Plex Sans JP
            </h3>
            <ul class="space-y-2">
              <li class="font-body text-step-7 leading-display tracking-tight">
                IBM Plex Sans JP/Mobile/H1
              </li>
              <li class="font-body text-step-8 leading-display tracking-tight">
                IBM Plex Sans JP/Mobile/H2 enlarged
              </li>
              <li class="font-body text-step-0 font-[500] leading-[1.5]">
                IBM Plex Sans JP/Mobile/Caption
              </li>
              <li class="font-body text-step-2 leading-[1.5]">
                IBM Plex Sans JP/Mobile/P2
              </li>
              <li class="font-body text-step-0 leading-[1.5]">
                IBM Plex Sans JP/Mobile/P1
              </li>
              <li class="font-body text-step-0 font-[500] leading-[1.5]">
                IBM Plex Sans JP/Mobile/Button
              </li>
              <li
                class="font-body text-[10px] font-[500] leading-[1.1] tracking-[0.0625em]"
              >
                IBM Plex Sans JP/Mobile/Custom/Labels
              </li>
              <li
                class="font-body text-[12px] leading-[1.3] tracking-[-0.03125em]"
              >
                IBM Plex Sans JP/Mobile/Custom/Navigation Caption
              </li>
              <li class="font-body text-[10px] leading-[1.2]">
                IBM Plex Sans JP/Mobile/Custom/Navigation Subcaption
              </li>
              <li
                class="font-body text-step-9 leading-display tracking-tighter"
              >
                IBM Plex Sans JP/Laptop/H1
              </li>
              <li
                class="font-body text-step-10 leading-display tracking-tighter"
              >
                IBM Plex Sans JP/Laptop/H2 enlarged
              </li>
              <li
                class="font-body text-step-4 font-[300] leading-[1.5] tracking-tight"
              >
                IBM Plex Sans JP/Laptop/P2
              </li>
              <li
                class="font-body text-step-8 leading-display tracking-tighter"
              >
                IBM Plex Sans JP/Desktop/H1
              </li>
              <li class="font-body text-step-10 leading-display tracking-tight">
                IBM Plex Sans JP/Desktop/H2 enlarged
              </li>
              <li
                class="font-body text-step-4 font-[500] leading-[1.5] tracking-tight"
              >
                IBM Plex Sans JP/Desktop/Caption
              </li>
              <li
                class="font-body text-step-6 font-[300] leading-[1.5] tracking-tight"
              >
                IBM Plex Sans JP/Desktop/P2
              </li>
              <li class="font-body text-step-3 leading-[1.5] tracking-tight">
                IBM Plex Sans JP/Desktop/P1
              </li>
              <li
                class="font-body text-step-2 font-[500] leading-[1.1] tracking-[0.125em]"
              >
                IBM Plex Sans JP/Desktop/Custom/Labels
              </li>
              <li class="font-body text-step-1 leading-[1] tracking-tight">
                IBM Plex Sans JP/Desktop/Custom/Navigation Caption
              </li>
              <li class="font-body text-[14px] leading-[1]">
                IBM Plex Sans JP/Desktop/Custom/Navigation Subcaption
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// No script needed; we rely on utilities and tokens for preview.
</script>
