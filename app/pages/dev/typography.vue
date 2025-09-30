<template>
  <main class="p-6 md:p-8 lg:p-12">
    <header class="mb-8">
      <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
        Typography Board
      </h1>
      <p class="mt-2 text-stone-600">
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
            class="font-display tracking-tight leading-display text-step-7 italic"
          >
            Lorem ipsum dolor sit amet
          </div>
          <div
            class="font-display tracking-tight leading-display text-step-6 font-[300]"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </section>
  </main>
</template>

<script setup>
// No script needed; we rely on utilities and tokens for preview.
</script>
