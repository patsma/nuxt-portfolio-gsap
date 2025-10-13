<template>
  <!-- Fluid gradient background (z-0, behind everything) -->
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Smooth cursor trail effect (z-50, on top) -->
  <CursorTrail />
</template>
