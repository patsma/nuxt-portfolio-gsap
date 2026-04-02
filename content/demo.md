---
title: Demo
description: All template components in one page
---

::hero-section{heroId="demo"}
::

::text-section
---
title: Text Section
body: This is a text-heavy section with scroll animation. It uses entrance animations on first load and ScrollTrigger for scroll-linked reveals. Each section demonstrates the core animation patterns.
---
::

::spacer-component{size="md"}
::

::image-scaling-section
---
imageSrc: /assets/dummy/placeholder1.jpg
imageAlt: Demo image with scaling reveal
startWidth: 25
startHeight: 25
scrollAmount: '180%'
startPosition: left
---
::

::spacer-component{size="lg"}
::

::image-section
---
src: /assets/dummy/placeholder2.jpg
alt: Parallax demo image
speed: 0.9
lag: 0.1
---
::

::spacer-component{size="md"}
::

::text-section
---
title: Another Section
body: Demonstrating multiple text sections with different content. Each uses the same underlying animation patterns — useScrollTriggerInit for scroll coordination, v-page-fade for page transitions.
---
::

::spacer-component{size="md"}
::

::image-scaling-section
---
imageSrc: /assets/dummy/placeholder3.jpg
imageAlt: Second scaling image
startWidth: 25
startHeight: 25
scrollAmount: '120%'
startPosition: right
---
::

::spacer-component{size="lg"}
::
