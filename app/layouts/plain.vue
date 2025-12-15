<template>
  <!-- Plain layout without ScrollSmoother for testing and comparison -->
  <div class="min-h-screen">
    <header
      role="banner"
      aria-label="Site header"
    >
      <SimpleHeader />
    </header>
    <div class="pt-header-plus-lg">
      <slot />
    </div>
  </div>
</template>

<script setup>
// No script required
</script>
