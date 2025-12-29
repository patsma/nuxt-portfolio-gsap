<template>
  <div
    ref="containerRef"
    class="scroll-button grid justify-end"
    :data-hover-text="props.variant === 'view' ? 'View' : 'Scroll'"
    @click="handleClick"
  >
    <svg
      class="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
      viewBox="0 0 116.43 116.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Circular "Scroll" text -->
      <path
        v-if="props.variant === 'scroll'"
        ref="textRef"
        class="scroll-button__text"
        d="M53.16,108.93c1.1.09,1.95.58,2.55,1.46l-.85.64c-.45-.68-1.07-1.05-1.85-1.11-.47-.04-.83.04-1.09.23-.27.2-.42.48-.45.86-.03.31.05.55.21.73.17.19.46.34.88.45l.63.18c.7.19,1.22.47,1.55.83.33.37.46.84.42,1.41-.05.64-.32,1.13-.81,1.47-.49.33-1.12.47-1.9.41-1.06-.09-1.85-.53-2.35-1.32l.84-.61c.38.57.92.89,1.65.95.44.04.78-.03,1.03-.19.25-.15.38-.4.41-.73.03-.31-.05-.56-.22-.73-.17-.18-.47-.32-.89-.44l-.64-.17c-.72-.21-1.23-.5-1.54-.86-.31-.36-.44-.82-.4-1.4.03-.42.17-.83.42-1.17.23-.32.56-.56.97-.71s.89-.21,1.44-.17ZM45.69,107.6c.93.22,1.59.71,1.97,1.45.37.75.42,1.72.14,2.9-.19.79-.46,1.44-.83,1.94-.37.5-.82.85-1.33,1.03s-1.08.21-1.69.06c-1.21-.29-1.92-1.02-2.14-2.2l1.03-.29c.11.82.56,1.32,1.34,1.51.56.13,1.05.04,1.46-.28.41-.31.69-.81.86-1.49l.25-1.07c.16-.68.13-1.24-.1-1.7-.24-.45-.63-.75-1.19-.88-.41-.1-.78-.07-1.11.08-.34.15-.62.39-.85.73l-.76-.75c.37-.47.8-.8,1.3-.99.5-.18,1.05-.2,1.65-.06h0ZM38.05,108.35l1.15-2.75,1.04.44-2.83,6.76-2.89-1.21c-.6-.25-.99-.63-1.19-1.13-.19-.5-.16-1.06.1-1.68.21-.49.49-.86.85-1.1.36-.23.78-.32,1.26-.25l-.27-3.47,1.16.49.22,3.32,1.39.58h0ZM35.91,108.49c-.28-.12-.53-.14-.76-.06-.23.08-.4.27-.52.55l-.19.46c-.12.28-.13.53-.02.75.1.22.28.39.57.51l1.77.74.93-2.21-1.77-.74h0ZM30.41,100.85c.53.34.92.77,1.16,1.27.24.5.31,1.06.22,1.68-.1.61-.36,1.26-.8,1.94-.44.68-.92,1.18-1.44,1.52-.53.34-1.07.51-1.62.5-.56-.01-1.1-.19-1.64-.54-.54-.35-.92-.77-1.16-1.27-.24-.5-.31-1.06-.22-1.68.09-.62.35-1.27.8-1.95.44-.68.92-1.18,1.45-1.52.52-.34,1.06-.5,1.62-.49.55,0,1.09.18,1.63.53h0ZM29.85,101.69c-.49-.32-.99-.41-1.5-.26-.51.14-.96.5-1.33,1.07l-.62.96c-.37.57-.51,1.12-.43,1.64.07.52.36.95.85,1.26.49.32,1,.41,1.52.27.51-.14.95-.49,1.32-1.06l.62-.96c.37-.57.51-1.12.44-1.65-.09-.53-.38-.95-.87-1.27ZM21.09,94.74l.67-.74,3.06,2.78-4.93,5.42-.84-.76,4.26-4.68-2.22-2.02ZM16.4,89.22l.77-.64,2.64,3.18-5.64,4.68-.72-.87,4.87-4.04s-1.92-2.31-1.92-2.31ZM10.38,81.94c.11.21.14.4.09.57-.05.16-.17.29-.36.38l-.14.07c-.19.09-.36.11-.52.06-.17-.06-.31-.19-.42-.41-.1-.21-.13-.39-.07-.56.05-.17.17-.3.35-.39l.14-.07c.16-.09.34-.11.52-.06.16.05.3.19.4.4h0ZM8.65,69.3c.26,1.08.06,2.04-.59,2.88l-.88-.61c.5-.64.66-1.34.48-2.1-.11-.45-.3-.78-.56-.96-.27-.19-.59-.25-.95-.16-.3.07-.51.22-.63.43-.13.22-.18.54-.16.97l.03.65c.04.72-.06,1.3-.3,1.73-.25.42-.65.7-1.21.84-.63.15-1.18.05-1.65-.31-.47-.36-.8-.92-.98-1.68-.25-1.04-.08-1.92.52-2.65l.85.61c-.43.54-.55,1.16-.38,1.86.1.43.27.73.5.92.22.19.5.24.82.16.3-.07.51-.22.62-.44.11-.22.16-.54.14-.98l-.04-.66c-.02-.75.09-1.32.33-1.73.24-.41.64-.68,1.2-.82.41-.11.84-.1,1.24.03.38.12.71.35.98.7.27.35.48.78.61,1.31h0ZM7.58,61.79c.08.96-.17,1.73-.76,2.32-.6.59-1.5.93-2.71,1.04-.81.07-1.51.01-2.1-.18-.59-.2-1.06-.51-1.4-.94-.34-.43-.53-.96-.59-1.59-.11-1.24.37-2.14,1.42-2.72l.6.89c-.75.37-1.08.95-1.01,1.74.05.57.29,1.01.72,1.3.43.29.99.41,1.69.35l1.1-.09c.69-.06,1.22-.27,1.58-.63.36-.36.51-.83.46-1.4-.04-.42-.18-.76-.42-1.03-.26-.28-.59-.48-.96-.58l.47-.95c.56.2,1.01.51,1.35.93.33.41.52.93.57,1.55ZM4.47,54.77l2.97.23-.09,1.13L.05,55.56l.25-3.12c.05-.65.28-1.14.7-1.48.41-.34.96-.49,1.63-.43.53.04.97.2,1.31.46.33.27.55.64.63,1.11l3.22-1.34-.1,1.26-3.09,1.25s-.12,1.51-.12,1.51ZM3.67,52.78c.02-.31-.04-.55-.18-.74-.15-.19-.38-.3-.69-.33l-.5-.04c-.31-.02-.55.05-.72.21-.18.16-.28.39-.31.7l-.15,1.91,2.39.19.15-1.92ZM9.2,45.16c-.16.61-.44,1.11-.85,1.49-.4.38-.91.63-1.53.74-.61.1-1.31.05-2.09-.15-.78-.2-1.41-.5-1.9-.89-.49-.4-.82-.86-.98-1.38-.16-.53-.17-1.11,0-1.73.16-.62.44-1.12.85-1.49.4-.38.91-.63,1.52-.73.61-.11,1.32-.06,2.1.15.78.2,1.41.5,1.89.9.48.39.81.85.97,1.38.17.53.17,1.1,0,1.72ZM8.23,44.9c.15-.57.08-1.07-.22-1.5-.3-.44-.78-.75-1.43-.92l-1.11-.29c-.66-.17-1.22-.14-1.69.1-.47.24-.79.64-.93,1.2-.15.57-.07,1.08.22,1.53.29.44.77.75,1.42.92l1.11.29c.66.17,1.23.14,1.7-.1.47-.25.78-.66.93-1.22ZM12.08,34.4l.91.41-1.68,3.77-6.69-2.99.46-1.03,5.78,2.58s1.22-2.74,1.22-2.74ZM15.85,28.22l.85.53-2.19,3.5-6.21-3.89.6-.96,5.37,3.36,1.59-2.54h0ZM20.88,20.22c-.17.17-.34.26-.52.26-.17,0-.33-.07-.47-.22l-.11-.11c-.15-.15-.22-.3-.22-.47,0-.18.08-.35.25-.52.17-.17.33-.25.51-.24.17,0,.33.07.48.21l.11.11c.14.14.21.3.22.47,0,.17-.08.34-.25.51ZM32.35,14.62c-.94.58-1.91.7-2.92.34l.31-1.02c.77.28,1.48.21,2.15-.2.4-.25.64-.53.74-.84.1-.32.05-.64-.15-.96-.16-.26-.36-.41-.6-.46-.24-.05-.57,0-.97.16l-.61.23c-.68.26-1.25.35-1.74.26-.48-.1-.87-.4-1.17-.88-.34-.55-.42-1.1-.22-1.66.19-.56.62-1.05,1.28-1.46.91-.56,1.8-.68,2.68-.34l-.31.99c-.64-.24-1.27-.16-1.89.22-.37.23-.61.49-.72.76-.11.27-.07.55.1.83.17.27.37.42.61.45.24.04.57-.02.98-.17l.62-.24c.7-.26,1.28-.33,1.74-.23.47.1.85.4,1.15.89.24.39.36.78.36,1.19,0,.41-.12.81-.35,1.15-.24.37-.59.7-1.06.99ZM39.14,11.24c-.88.38-1.7.38-2.45,0-.74-.38-1.36-1.13-1.83-2.25-.32-.75-.48-1.43-.49-2.05,0-.62.15-1.16.46-1.62.31-.46.74-.81,1.32-1.05,1.14-.49,2.15-.32,3.03.5l-.66.85c-.58-.59-1.24-.73-1.97-.42-.53.23-.86.59-1.01,1.1-.14.5-.08,1.07.2,1.71l.43,1.01c.27.64.64,1.07,1.09,1.31.46.22.95.22,1.48,0,.39-.16.67-.4.85-.72.18-.32.27-.68.25-1.1l1.05.15c-.01.59-.17,1.12-.46,1.57-.29.44-.72.79-1.29,1.03h0ZM44.84,6.1l.71,2.89-1.1.27-1.74-7.12,3.04-.74c.63-.15,1.17-.09,1.62.2.45.29.76.76.92,1.41.13.52.12.98-.03,1.39-.15.4-.44.72-.86.95l2.28,2.63-1.22.3-2.16-2.54s-1.47.36-1.47.36ZM46.47,4.71c.3-.07.51-.21.64-.4.13-.2.17-.46.09-.75l-.12-.49c-.07-.3-.22-.5-.43-.62-.21-.12-.46-.14-.76-.07l-1.87.46.57,2.33s1.87-.46,1.87-.46ZM55.44,7.58c-.63.04-1.19-.07-1.69-.33-.49-.26-.88-.67-1.18-1.22-.29-.55-.46-1.23-.51-2.03-.05-.8.03-1.5.25-2.08.22-.59.56-1.04,1.01-1.37.45-.32,1-.5,1.64-.55.64-.04,1.2.07,1.68.33.49.26.88.67,1.17,1.22.29.55.47,1.23.52,2.04.05.8-.04,1.5-.26,2.08-.22.58-.55,1.03-1.01,1.36-.45.32-.99.5-1.63.54ZM55.39,6.57c.58-.04,1.04-.26,1.36-.68.33-.42.47-.97.43-1.65l-.07-1.15c-.04-.68-.25-1.2-.63-1.57-.37-.38-.85-.55-1.44-.51-.59.04-1.05.27-1.38.69-.33.41-.47.96-.43,1.64l.07,1.15c.04.68.25,1.21.63,1.58.38.37.87.54,1.46.5h0ZM66.57,6.94l-.1.99-4.11-.42.74-7.29,1.12.11-.64,6.3,2.99.3ZM73.61,8.59l-.24.97-4.01-.98,1.74-7.12,1.1.27-1.51,6.15s2.91.71,2.91.71ZM82.79,10.86c-.21-.11-.35-.24-.41-.41-.05-.16-.03-.33.06-.52l.07-.14c.09-.18.22-.3.38-.36.17-.06.36-.03.58.08.21.1.34.24.39.41.06.17.04.36-.05.52l-.07.14c-.08.16-.21.29-.38.36-.16.05-.35.03-.56-.08h0ZM91.7,19.99c-.85-.71-1.26-1.6-1.24-2.66l1.07-.03c-.02.82.27,1.47.87,1.97.36.3.7.45,1.03.44.33,0,.62-.15.86-.44.2-.24.28-.47.25-.72-.03-.25-.18-.54-.46-.88l-.41-.51c-.46-.56-.72-1.08-.79-1.57-.05-.49.1-.95.47-1.39.42-.5.92-.74,1.51-.73.59,0,1.19.26,1.79.76.82.68,1.2,1.5,1.16,2.44h-1.04c.02-.67-.24-1.24-.8-1.71-.34-.28-.65-.43-.95-.44-.29-.02-.54.1-.75.36-.2.24-.28.48-.24.72.04.24.2.53.47.87l.42.51c.46.59.72,1.11.76,1.58.05.47-.11.93-.48,1.37-.29.35-.63.59-1.01.72-.39.13-.81.14-1.21.02-.43-.11-.85-.34-1.27-.69h0ZM97.03,25.39c-.64-.72-.89-1.49-.77-2.32.13-.83.65-1.64,1.56-2.45.61-.54,1.21-.91,1.8-1.11.59-.19,1.15-.22,1.68-.07.53.15,1,.45,1.42.92.82.93.98,1.94.48,3.03l-1.01-.36c.38-.74.31-1.41-.22-2.01-.38-.43-.83-.64-1.36-.62-.52.02-1.04.26-1.56.73l-.82.73c-.52.46-.82.94-.9,1.45-.07.51.09.97.47,1.4.28.32.59.51.95.58.36.07.73.04,1.12-.11l.19,1.05c-.57.17-1.11.19-1.63.06-.51-.14-.97-.44-1.38-.9h0ZM103.7,29.18l-2.53,1.58-.6-.96,6.22-3.89,1.66,2.65c.34.55.45,1.08.32,1.6-.13.52-.48.96-1.05,1.32-.45.28-.89.42-1.33.4-.43-.02-.82-.19-1.17-.52l-1.79,2.99-.67-1.07,1.74-2.84-.8-1.28ZM105.53,30.3c.16.26.36.42.58.48.24.06.49.01.75-.15l.42-.26c.26-.16.41-.36.45-.6.05-.24,0-.48-.17-.74l-1.02-1.63-2.04,1.27s1.02,1.63,1.02,1.63ZM105.61,39.72c-.24-.59-.31-1.16-.21-1.7.1-.55.36-1.05.79-1.5.43-.45,1.02-.82,1.77-1.12.75-.3,1.43-.44,2.05-.42.63.03,1.17.2,1.61.53.45.33.79.79,1.03,1.39.24.59.31,1.16.21,1.7-.1.55-.36,1.05-.79,1.49-.43.45-1.02.83-1.78,1.13-.75.3-1.43.44-2.06.4-.62-.02-1.15-.2-1.6-.53-.45-.32-.79-.78-1.03-1.38ZM106.55,39.35c.22.54.57.9,1.07,1.08.5.18,1.07.14,1.7-.11l1.07-.43c.63-.25,1.06-.62,1.3-1.09.24-.47.25-.98.04-1.52-.22-.54-.58-.91-1.09-1.09-.5-.18-1.06-.15-1.69.11l-1.07.43c-.63.25-1.07.62-1.31,1.1-.23.48-.24.99-.02,1.54ZM109.71,50.09l-.98.22-.89-4.03,7.16-1.58.24,1.1-6.18,1.37.65,2.93ZM110.35,57.29l-1,.08-.32-4.12,7.31-.57.09,1.13-6.31.49s.24,2.99.24,2.99ZM111.07,66.72c.04-.24.12-.41.26-.52.14-.1.31-.14.51-.11l.16.02c.2.03.36.11.46.25.11.14.14.33.11.57-.04.23-.12.4-.27.5-.15.11-.33.15-.51.11l-.16-.02c-.18-.02-.34-.11-.46-.25-.1-.14-.13-.32-.1-.56ZM105.19,78.04c.41-1.03,1.12-1.7,2.14-2.01l.36,1c-.78.24-1.32.72-1.6,1.44-.17.43-.2.81-.1,1.11.11.32.34.54.69.68.29.11.54.12.76.01.23-.1.46-.34.69-.71l.36-.55c.39-.61.8-1.03,1.24-1.24.45-.2.94-.2,1.47.01.6.24.99.64,1.17,1.21s.12,1.21-.16,1.94c-.39.99-1.04,1.61-1.95,1.86l-.34-.98c.66-.19,1.12-.63,1.39-1.3.16-.41.2-.76.12-1.04-.07-.28-.27-.48-.58-.61-.29-.11-.55-.12-.76,0-.22.11-.44.35-.68.72l-.35.56c-.41.62-.83,1.03-1.27,1.22-.43.19-.92.18-1.45-.03-.4-.15-.74-.4-1-.74-.24-.33-.38-.73-.4-1.14-.03-.44.06-.92.26-1.42ZM101.73,84.79c.48-.83,1.14-1.32,1.96-1.46.83-.13,1.76.11,2.81.72.7.41,1.24.86,1.61,1.36.37.5.57,1.03.6,1.58.03.55-.12,1.09-.43,1.64-.62,1.07-1.54,1.54-2.73,1.4l.03-1.07c.82.13,1.43-.15,1.83-.84.29-.5.34-.99.16-1.48-.18-.48-.57-.9-1.18-1.25l-.95-.56c-.6-.35-1.15-.48-1.65-.4-.5.09-.9.39-1.19.88-.21.36-.29.72-.25,1.08.04.36.19.71.45,1.03l-.93.51c-.34-.49-.53-1-.56-1.53-.03-.53.11-1.06.42-1.59h0ZM100.22,92.32l-2.29-1.9.72-.87,5.64,4.68-2,2.41c-.41.5-.89.77-1.42.81s-1.06-.15-1.58-.58c-.41-.34-.68-.72-.8-1.13-.12-.41-.08-.84.12-1.28l-3.4-.76.81-.97,3.24.76.96-1.16h0ZM99.73,94.41c-.2.24-.29.47-.28.71.01.25.14.46.37.66l.38.32c.24.19.47.28.71.24.24-.03.46-.16.65-.39l1.23-1.48-1.85-1.53s-1.23,1.48-1.23,1.48ZM90.81,97.43c.49-.41,1-.65,1.55-.73.55-.08,1.11.01,1.67.28.56.27,1.1.71,1.62,1.33.52.62.87,1.22,1.04,1.82.17.61.17,1.17,0,1.7-.17.53-.5,1-.99,1.41-.49.41-1.01.66-1.55.73-.55.08-1.11-.01-1.67-.28-.56-.27-1.11-.71-1.63-1.33-.52-.62-.86-1.23-1.03-1.83-.17-.6-.17-1.16,0-1.69.17-.53.5-.99.99-1.41h0ZM91.46,98.21c-.45.38-.68.83-.69,1.35-.01.53.2,1.06.64,1.58l.74.88c.44.52.92.82,1.44.89.52.08,1.01-.07,1.46-.44.45-.38.68-.84.7-1.37.02-.53-.19-1.05-.63-1.57l-.74-.88c-.44-.52-.92-.82-1.45-.9-.53-.07-1.02.09-1.46.46ZM82.25,104.57l-.51-.86,3.55-2.11,3.74,6.3-.97.58-3.23-5.44-2.58,1.53h0ZM75.61,107.44l-.39-.92,3.81-1.6,2.83,6.76-1.04.44-2.45-5.84s-2.77,1.16-2.77,1.16ZM66.88,111.07c.24-.04.43-.01.57.08.14.1.22.25.26.45l.03.16c.04.2,0,.38-.1.51-.1.15-.27.24-.51.28-.23.04-.41,0-.55-.1-.15-.1-.25-.27-.27-.45l-.03-.16c-.04-.18,0-.36.1-.51.1-.14.27-.23.5-.27Z"
        fill="var(--theme-text-15)"
      />
      <!-- Circular "View" text -->
      <g
        v-else
        ref="textRef"
        class="scroll-button__text"
      >
        <path
          d="M51.82,104.88l1.75.16,2.29,10.04-1.57-.15-1.12-5.1-.62-3.41h-.07s-1.23,3.23-1.23,3.23l-2.07,4.81-1.51-.14,4.14-9.44Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M36.53,100.54l3.83,1.67-.49,1.12-1.22-.53-2.94,6.71,1.22.53-.49,1.12-3.83-1.67.49-1.12,1.22.54,2.94-6.71-1.22-.53.49-1.12Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M22.55,92.25l.89-.99,4.62,4.15-6.54,7.28-4.62-4.15.89-.99,3.49,3.14,1.89-2.1-3.19-2.86.88-.98,3.19,2.86,1.98-2.2-3.49-3.14Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M15.6,80.54l.74,1.54-7.82,6.32-.66-1.38,3.91-3.04,2.59-1.98-.02-.04-3.21.68-4.89,1-.73-1.53,3.86-3.16,2.54-2.08-.02-.04-3.18.75-4.84,1.12-.64-1.34,9.86-2.05.74,1.54-4.1,3.4-2.34,1.91v.02s2.98-.6,2.98-.6l5.22-1.05Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M7.2,51.93c-.04.32-.15.55-.34.7-.18.14-.41.19-.68.15l-.21-.03c-.27-.04-.48-.15-.62-.33-.14-.19-.2-.44-.15-.76.04-.31.16-.53.35-.67.18-.15.41-.2.68-.16l.21.03c.26.04.47.14.62.33.14.18.18.43.14.75Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M20.6,28.78l-1.09,1.38-9.66-3.56.98-1.23,4.89,1.85,3.19,1.34.04-.05-2.04-2.8-2.9-4.36.95-1.19,5.65,8.62Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M32.59,18.33l-3.49,2.29-.67-1.03,1.12-.73-4.02-6.13-1.12.73-.67-1.03,3.49-2.29.67,1.03-1.12.73,4.02,6.13,1.12-.73.67,1.03Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M47.16,11.15l.34,1.29-5.99,1.6-2.53-9.45,5.99-1.6.34,1.29-4.54,1.21.73,2.73,4.14-1.11.34,1.28-4.14,1.11.77,2.86,4.54-1.21Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M60.77,11.7l-1.69-.22-1.03-10,1.52.2.41,4.94.25,3.25h.04s1.18-3.06,1.18-3.06l1.84-4.64,1.68.22.55,4.96.35,3.26h.04s1.1-3.07,1.1-3.07l1.7-4.66,1.47.19-3.67,9.38-1.69-.22-.61-5.29-.32-3h-.03s-1.12,2.81-1.12,2.81l-1.97,4.95Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M89.32,20.3c-.24-.21-.38-.43-.4-.66-.02-.23.06-.44.24-.65l.14-.16c.18-.21.38-.32.61-.34.24-.02.48.08.72.29.24.2.36.42.37.65.02.23-.05.45-.23.66l-.14.16c-.17.2-.38.31-.61.34-.23.02-.46-.08-.7-.29Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M101.4,44.16l-.56-1.67,8.26-6.15.5,1.49-4.22,3.08-2.87,1.94.02.06,3.46-.18,5.23-.05.48,1.44-10.31.02Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M103.61,59.92v-4.18s1.21,0,1.21,0v1.33s7.33-.02,7.33-.02v-1.33s1.22,0,1.22,0v4.18s-1.22,0-1.22,0v-1.33s-7.33.02-7.33.02v1.33s-1.22,0-1.22,0Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M101.67,76.04l-1.27-.42,1.93-5.9,9.3,3.04-1.93,5.9-1.27-.42,1.46-4.46-2.69-.88-1.33,4.07-1.26-.41,1.33-4.07-2.82-.92-1.46,4.46Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M93.77,87.14l1.11-1.3,8.94,4.6-1,1.17-4.37-2.35-2.86-1.57-.03.03,1.92,2.66,2.89,4.07-1.1,1.29-4.45-2.25-2.93-1.49-.03.03,1.97,2.6,2.98,3.97-.96,1.12-5.86-8.2,1.11-1.3,4.76,2.38,2.69,1.37.02-.02-1.74-2.48-3.07-4.35Z"
          fill="var(--theme-text-15)"
        />
        <path
          d="M70.99,106.37c.31-.09.56-.08.77.03.2.11.34.3.41.56l.06.21c.08.26.06.5-.05.69-.12.21-.33.36-.63.45-.3.09-.55.07-.75-.05-.21-.11-.35-.29-.43-.56l-.06-.21c-.07-.26-.06-.49.05-.7.11-.2.32-.34.63-.43Z"
          fill="var(--theme-text-15)"
        />
      </g>
      <!-- Arrow (rotatable via direction prop) -->
      <path
        class="scroll-button__arrow"
        d="M59.6,75.44l3.6-4.43c1.89-2.32,4.45-3.63,7.12-3.63l-12,14.76-12-14.76c2.67,0,5.23,1.31,7.12,3.63l3.6,4.43v-40.16h2.57v40.16Z"
        fill="var(--theme-text-40)"
        fill-rule="evenodd"
        :style="arrowStyle"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * ScrollButtonSVG Component - Animated Circular Button with Direction Control
 *
 * Features:
 * - Two variants: 'scroll' (smooth scrolling) and 'view' (navigation)
 * - Infinite rotation of circular text (viewport-aware with ScrollTrigger)
 * - Arrow direction controlled via prop (up, down, left, right)
 * - Click behavior based on variant:
 *   - scroll + 'up': scrolls to top with distance-based duration
 *   - scroll + 'down': scrolls down 100vh with gentle 1.2s animation
 *   - scroll + 'left'/'right': reserved for future use
 *   - view: navigates to href URL
 * - Theme-aware colors
 * - Responsive sizing
 * - Integrates with both entrance animations (first load) and page transitions
 *
 * Props:
 * @param {string} variant - Button type: 'scroll' | 'view' (default: 'scroll')
 * @param {string} direction - Arrow direction: 'up' | 'down' | 'left' | 'right' (default: 'down')
 * @param {string} href - URL to navigate to (required when variant='view')
 *
 * Performance:
 * - Rotation pauses when scrolled out of viewport (saves resources)
 * - Resumes when scrolled back into view
 * - Proper cleanup on unmount
 */

import { clampedNormalize } from '~/utils/math'
import useMagnetic from '~/composables/useMagnetic'

// Scroll animation config
const SCROLL_DOWN_DURATION = 1.2
const SCROLL_DOWN_EASE = 'power2.inOut'
const SCROLL_UP_MIN_DURATION = 1.2
const SCROLL_UP_MAX_DURATION = 3.5
const SCROLL_UP_DISTANCE_MAX = 4000 // scales faster for typical pages
const SCROLL_UP_EASE = 'power2.inOut'

// Nuxt GSAP
const { $gsap, $ScrollTrigger } = useNuxtApp()

// Loading store for first load detection
const loadingStore = useLoadingStore()

// ScrollSmoother manager for smooth scroll behavior
const { getSmoother } = useScrollSmootherManager()

// Props
const props = withDefaults(defineProps<{
  direction?: 'up' | 'down' | 'left' | 'right'
  variant?: 'scroll' | 'view'
  href?: string
}>(), {
  direction: 'down',
  variant: 'scroll'
})

// Refs
const containerRef = ref<HTMLElement | null>(null)
const textRef = ref(null)

// Magnetic hover effect - bouncy spring feel stretched in time
useMagnetic(containerRef, {
  threshold: 150,
  maxDisplacement: 28,
  strength: 0.5,
  stiffness: 0.08, // Original bouncy stiffness
  damping: 0.82, // Original bouncy damping (nice oscillation)
  velocityInfluence: 1.5,
  timeScale: 0.4 // Slow motion - same spring character, 40% speed
})

// Rotation animation instance (stored for cleanup)
// Using any type - GSAPTween type doesn't include all runtime methods (resume, pause, etc.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rotationAnimation: any = null
let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null

// Computed arrow rotation based on direction
const arrowStyle = computed(() => {
  const rotations: Record<string, string> = {
    down: '0deg',
    up: '180deg',
    left: '90deg',
    right: '-90deg'
  }
  return {
    transform: `rotate(${rotations[props.direction]})`,
    transformOrigin: '58.2px 58.25px' // center of 116.43x116.5 viewBox
  }
})

/**
 * Handle click - organic smooth scroll based on direction
 * Uses GSAP tween for full control over duration and easing
 * - up: scroll to top with distance-based duration (longer pages = longer animation)
 * - down: scroll down 100vh with gentle fixed 1.2s animation
 * - left/right: reserved for future horizontal scrolling
 *
 * View variant: navigates to href URL instead of scrolling
 */
const handleClick = () => {
  // View variant: navigate to href
  if (props.variant === 'view' && props.href) {
    navigateTo(props.href)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const smoother = getSmoother() as any // Cast needed - scrollTop() exists at runtime

  if (props.direction === 'up') {
    // Calculate duration based on scroll distance for organic feel
    const scrollDistance = smoother ? smoother.scrollTop() : window.scrollY
    const duration = clampedNormalize(
      scrollDistance,
      0,
      SCROLL_UP_DISTANCE_MAX,
      SCROLL_UP_MIN_DURATION,
      SCROLL_UP_MAX_DURATION
    )

    if (smoother) {
      // Use GSAP tween for organic duration/easing
      $gsap.to(smoother, {
        scrollTop: 0,
        duration,
        ease: SCROLL_UP_EASE
      })
    }
    else {
      // Fallback: animate window scroll position
      const scrollObj = { y: window.scrollY }
      $gsap.to(scrollObj, {
        y: 0,
        duration,
        ease: SCROLL_UP_EASE,
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y)
        }
      })
    }
  }
  else if (props.direction === 'down') {
    // Scroll down 100vh with gentle, fixed duration
    const currentScroll = smoother ? smoother.scrollTop() : window.scrollY
    const targetScroll = currentScroll + window.innerHeight

    if (smoother) {
      // Use GSAP tween for organic duration/easing
      $gsap.to(smoother, {
        scrollTop: targetScroll,
        duration: SCROLL_DOWN_DURATION,
        ease: SCROLL_DOWN_EASE
      })
    }
    else {
      // Fallback: animate window scroll position
      const scrollObj = { y: currentScroll }
      $gsap.to(scrollObj, {
        y: targetScroll,
        duration: SCROLL_DOWN_DURATION,
        ease: SCROLL_DOWN_EASE,
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y)
        }
      })
    }
  }
  // left/right: no scroll behavior (reserved for future horizontal scrolling)
}

onMounted(() => {
  if (!textRef.value || !containerRef.value) return

  // Create infinite rotation animation (paused initially)
  rotationAnimation = $gsap.to(textRef.value, {
    rotation: 360,
    duration: 20,
    repeat: -1,
    ease: 'none',
    paused: true,
    transformOrigin: 'center center'
  })

  // ScrollTrigger: Pause/resume based on viewport visibility
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: containerRef.value,
    start: 'top bottom', // When top enters bottom of viewport
    end: 'bottom top', // When bottom leaves top of viewport
    onEnter: () => rotationAnimation?.resume(),
    onLeave: () => rotationAnimation?.pause(),
    onEnterBack: () => rotationAnimation?.resume(),
    onLeaveBack: () => rotationAnimation?.pause()
  })

  // Start rotation based on load type
  if (loadingStore.isFirstLoad) {
    // First load: wait for entrance animations to complete
    window.addEventListener(
      'app:complete',
      () => {
        rotationAnimation?.play()
      },
      { once: true }
    )
  }
  else {
    // Page navigation: delay for page transition to complete
    // setTimeout is simple and works reliably with v-page-fade timing
    setTimeout(() => {
      rotationAnimation?.play()
    }, 600) // Matches typical page transition duration
  }
})

onUnmounted(() => {
  // Clean up rotation animation
  if (rotationAnimation) {
    rotationAnimation.kill()
    rotationAnimation = null
  }

  // Clean up ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
})
</script>

<style scoped>
/**
 * ScrollButtonSVG Component Styles
 *
 * This component represents a circular "Scroll" button with animated text and arrow.
 * The SVG is theme-aware and responsive.
 *
 * Features:
 * - Circular text path spelling "Scroll" (rotates via GSAP)
 * - Arrow indicator (direction controlled via prop)
 * - Hoverable interaction (via CursorTrail)
 * - Theme-aware colors using CSS variables
 * - Responsive sizing (24px mobile -> 28px tablet -> 32px desktop)
 *
 * IMPORTANT: No CSS transitions on this element - GSAP handles all animations
 */

.scroll-button {
  /* Container positioned at end (right alignment) */
  cursor: pointer;
  /* NO transition property - conflicts with GSAP animations */
}

.scroll-button__text {
  /* Transform origin set via GSAP for rotation */
  transform-origin: center center;
}
</style>
