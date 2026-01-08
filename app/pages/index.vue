<script setup lang="ts">
// Use the content-driven HeroSection from components/content/
import HeroSection from '~/components/content/HeroSection.vue'
</script>

<template>
  <div>
    <!-- 1. Hero Section - Content-driven from data/hero/home.yml -->
    <HeroSection hero-id="home" />

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
