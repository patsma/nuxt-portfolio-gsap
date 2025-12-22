<script setup lang="ts">
import HeroSection from '~/components/HeroSection.vue'
import ScrollButtonSVG from '~/components/SVG/ScrollButtonSVG.vue'

const services = [
  'ART DIRECTION',
  'CREATIVE DIRECTION',
  'CONCEPT DEVELOPMENT',
  'CONSULTING & GUIDANCE',
  'USER EXPERIENCE DESIGN (UX)',
  'DIGITAL DESIGN (UI)',
  'INTERACTIVE DESIGN',
  'DESIGN SYSTEMS & TOKENS'
]
</script>

<template>
  <div>
    <!-- 1. Hero Section -->
    <HeroSection>
      <!-- Main hero text with mixed opacity and font styling -->
      <h1
        v-page-split:lines="{ animateFrom: 'below' }"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <span class="text-[var(--theme-text-60)]">Welcome, I am</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> Morten</span>
        <span class="text-[var(--theme-text-60)]"> – a</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> Danish</em>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          designer</span>
        <span class="text-[var(--theme-text-60)]"> based in</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> Tokyo</span>
        <span class="text-[var(--theme-text-60)]">
          approaching today's challenges with a</span>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          digital</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]">-first</em>
        <span class="text-[var(--theme-text-60)]"> and</span>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          user</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]">-centred</em>
        <span class="text-[var(--theme-text-60)]"> mindset</span>
      </h1>

      <!-- Services list with tag styling -->
      <template #services>
        <nav
          class="services-list pt-10 md:pt-0"
          aria-label="Services"
        >
          <div
            v-page-stagger="{ stagger: 0.08, duration: 0.5 }"
            data-speed="0.95"
            class="flex flex-wrap gap-2 max-w-3xl"
          >
            <div class="tag-label">
              Services
            </div>
            <div
              v-for="service in services"
              :key="service"
              class="tag"
            >
              {{ service }}
            </div>
          </div>
        </nav>
      </template>

      <!-- Scroll down button (right side on desktop) -->
      <template #button>
        <ScrollButtonSVG
          v-page-fade:left
          data-speed="1"
        />
      </template>
    </HeroSection>

    <!-- 2. Video from left -->
    <VideoScalingSection
      video-src="/assets/dummy/sample1.mp4"
      poster-src="/assets/dummy/placeholder.jpg"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="180%"
      start-position="left"
    />

    <!-- 3. Interactive Case Study Section -->
    <InteractiveCaseStudySection>
      <InteractiveCaseStudyItem
        title="Recommendating"
        tag="APP"
        description="Art direction & UI"
        image="/assets/dummy/placeholder.jpg"
        image-alt="Recommendating preview"
      />
      <InteractiveCaseStudyItem
        title="Maj"
        description="Art direction & UI"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="Maj project preview"
      />
      <InteractiveCaseStudyItem
        title="BioInnovation Institute"
        tag="INTRANET"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="BioInnovation Institute preview"
      />
      <InteractiveCaseStudyItem
        title="Mælt"
        description="Art direction, Interactive design & UI"
        image="/assets/dummy/placeholder3.jpg"
        image-alt="Mælt project preview"
      />
      <InteractiveCaseStudyItem
        title="Nixu"
        tag="REDESIGN"
        description="Art direction, Interactive design, & UI"
        image="/assets/dummy/placeholder.jpg"
        image-alt="Nixu preview"
      />
      <InteractiveCaseStudyItem
        title="Neurotorium"
        description="Interactive design & UI"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="Neurotorium preview"
      />
      <InteractiveCaseStudyItem
        title="Fonden for Socialt Ansvar"
        description="Interactive design & UI"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="Fonden for Socialt Ansvar preview"
      />
      <InteractiveCaseStudyItem
        title="BII Magazine"
        tag="PRINT DIGITALISATION"
        description="Art direction, Interactive design & UI"
        image="/assets/dummy/placeholder3.jpg"
        image-alt="BII Magazine preview"
      />
      <InteractiveCaseStudyItem
        title="August Krogh"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder.jpg"
        image-alt="August Krogh preview"
      />
      <InteractiveCaseStudyItem
        title="LevendeStreg"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="LevendeStreg preview"
      />
      <InteractiveCaseStudyItem
        title="ScienceNews"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="ScienceNews preview"
      />
      <InteractiveCaseStudyItem
        title="Pointvoucher"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder3.jpg"
        image-alt="Pointvoucher preview"
      />
      <InteractiveCaseStudyItem
        title="Pointvoucher Studios"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder.jpg"
        image-alt="Pointvoucher Studios preview"
      />
      <InteractiveCaseStudyItem
        title="FoodWaste"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="FoodWaste preview"
      />
      <InteractiveCaseStudyItem
        title="eSmiley"
        tag="REDESIGN"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="eSmiley preview"
      />
      <InteractiveCaseStudyItem
        title="Bibelselskabet"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder3.jpg"
        image-alt="Bibelselskabet preview"
      />
      <InteractiveCaseStudyItem
        title="Molio"
        description="UI & UX"
        image="/assets/dummy/placeholder.jpg"
        image-alt="Molio preview"
      />
      <InteractiveCaseStudyItem
        title="LinkFactory"
        tag="REDESIGN"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="LinkFactory preview"
      />
      <InteractiveCaseStudyItem
        title="Haveselskabet"
        tag="APP"
        description="UI & UX"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="Haveselskabet preview"
      />
      <InteractiveCaseStudyItem
        title="Fonda"
        description="UI & UX"
        image="/assets/dummy/placeholder3.jpg"
        image-alt="Fonda preview"
      />
      <InteractiveCaseStudyItem
        title="Independo"
        tag="APP"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder.jpg"
        image-alt="Independo preview"
      />
      <InteractiveCaseStudyItem
        title="SpotTheSpy"
        tag="APP"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="SpotTheSpy preview"
      />
      <InteractiveCaseStudyItem
        title="Westend London"
        description="Art direction, UI & UX"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="Westend London preview"
      />
      <InteractiveCaseStudyItem
        title="Pengi"
        tag="REDESIGN"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder3.jpg"
        image-alt="Pengi preview"
      />
      <InteractiveCaseStudyItem
        title="Firstborn Capital"
        tag="REDESIGN"
        description="Art direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder.jpg"
        image-alt="Firstborn Capital preview"
      />
      <InteractiveCaseStudyItem
        title="Dansk Markedsføring"
        description="UI & UX"
        image="/assets/dummy/placeholder1.jpg"
        image-alt="Dansk Markedsføring preview"
      />
      <InteractiveCaseStudyItem
        title="SuperBrugsen"
        tag="IN-STORE"
        description="Art Direction, Interactive design, UI & UX"
        image="/assets/dummy/placeholder2.jpg"
        image-alt="SuperBrugsen preview"
      />
    </InteractiveCaseStudySection>
  </div>
</template>
