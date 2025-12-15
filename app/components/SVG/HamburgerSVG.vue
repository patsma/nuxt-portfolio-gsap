<template>
  <svg
    ref="svgRef"
    width="100%"
    height="100%"
    viewBox="0 0 44 32"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xml:space="preserve"
    xmlns:serif="http://www.serif.com/"
    style="fill-rule: evenodd; clip-rule: evenodd"
  >
    <g transform="matrix(1,0,0,1,-1643.13,-3519.52)">
      <g id="hamburger">
        <g id="closed">
          <g transform="matrix(1,0,0,1,1645.19,3525.87)">
            <path
              d="M0,0.5L39,0.5"
              style="
                fill: none;
                fill-rule: nonzero;
                stroke: var(--theme-text-100);
                stroke-width: 1px;
              "
            />
          </g>
          <g transform="matrix(1,0,0,1,1645.19,3525.87)">
            <path
              d="M0,18.5L39,18.5"
              style="
                fill: none;
                fill-rule: nonzero;
                stroke: var(--theme-text-100);
                stroke-width: 1px;
              "
            />
          </g>
          <g transform="matrix(1,0,0,1,1645.19,3525.87)">
            <path
              d="M0,9.5L39,9.5"
              style="
                fill: none;
                fill-rule: nonzero;
                stroke: var(--theme-text-100);
                stroke-width: 1px;
              "
            />
          </g>
        </g>
        <g id="opened">
          <g
            transform="matrix(0.707107,0.707107,-0.707107,0.707107,1657.62,3514.87)"
          >
            <path
              d="M0,9.5L39,9.5"
              style="
                fill: none;
                fill-rule: nonzero;
                stroke: var(--theme-text-100);
                stroke-width: 1px;
              "
            />
          </g>
          <g
            transform="matrix(0.707107,-0.707107,0.707107,0.707107,1644.19,3542.59)"
          >
            <path
              d="M0,9.5L39,9.5"
              style="
                fill: none;
                fill-rule: nonzero;
                stroke: var(--theme-text-100);
                stroke-width: 1px;
              "
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
// We expose both svgRef and svgRootRef for consistency with components
// that expect a `svgRootRef` public API (e.g. advanced GSAP setups).
// Both point to the same root <svg> element.
const svgRef = ref<SVGSVGElement | null>(null)
defineExpose({
  svgRef,
  svgRootRef: svgRef
})
</script>
