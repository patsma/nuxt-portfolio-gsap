<script setup lang="ts">
// Use the content-driven HeroSection
import HeroSection from '~/components/content/HeroSection.vue'
</script>

<template>
  <div>
    <!-- 1. Hero Section - Content-driven from data/hero/about.yml -->
    <HeroSection hero-id="about" />

    <!-- 2. Biography Section -->
    <BiographySection>
      <template #label>
        Biography
      </template>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam.
      </p>
    </BiographySection>

    <!-- 3. Experience Section -->
    <ExperienceSection
      view-more-text="View all"
      view-more-to="/about"
    >
      <ExperienceItem
        date-range="2023 – Current"
        title="Senior UX/UI Designer"
        company="TCS"
        location="Tokyo"
      />
      <ExperienceItem
        date-range="2020 – 2023"
        title="Lead/Senior Digital Designer"
        company="Bærnholdt"
        location="Copenhagen"
      />
      <ExperienceItem
        date-range="2018 – 2020"
        title="Senior UX/UI Designer"
        company="Pointvoucher"
        location="Copenhagen"
      />
    </ExperienceSection>

    <!-- 4. Image from left -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="left"
    />

    <!-- 5. Spacer -->
    <div class="h-20" />

    <!-- 6. Image from right -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder2.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="right"
    />

    <!-- 7. Services Section -->
    <ServicesSection>
      <template #column-left>
        <p>Art Direction</p>
        <p>Creative Direction</p>
        <p>Concept Development</p>
        <p>Consulting & Guidance</p>
      </template>
      <template #column-right>
        <p>User Experience Design (UX)</p>
        <p>Digital Design (UI)</p>
        <p>Interactive Design</p>
        <p>Design Systems & Tokens</p>
      </template>
    </ServicesSection>

    <!-- 8. Clients Section -->
    <ClientsSection>
      <template #label>
        Clients
      </template>
      <template #primary-clients>
        <p>
          Carlsberg, Coop, Lundbech Foundation, Munch Museet, Terma,
          Tivoli, World's Best Bar 2023
        </p>
      </template>
      <template #secondary-clients>
        <p>
          Arkyn, Begravelse Danmark, Bibelselskabet, BioInnovation Institute,
          Bjelin, Boligforeningen 3B, Bærnholdt, Byggefirmaet Hoffmann, Contempas,
          Dansk Sygeplejeråd, Det Nationale Forsknings- og Analysecenter for
          Velfærd (VIVE), Elvstrøm, Grøndalcentret, Lederne, Møbelsnedkeren,
          Novozymes, Pointvoucher, Scion DTU, Stadshagenselskabet, TCS
        </p>
      </template>
    </ClientsSection>

    <!-- 9. Awards & Recognition Section -->
    <AwardsRecognitionSection>
      <template #label>
        Awards &<br>Recognition
      </template>
      <template #awards-column>
        <p>1 <span class="text-[var(--theme-text-60)]">x</span> Awwwards</p>
        <p>4 <span class="text-[var(--theme-text-60)]">x</span> Behance</p>
        <p>
          2 <span class="text-[var(--theme-text-60)]">x</span> CSS Design
          Awards
        </p>
        <p>1 <span class="text-[var(--theme-text-60)]">x</span> CSS Light</p>
      </template>
      <template #featured-column>
        <p>Design Rush – Featured</p>
        <p>Web Design Pub – Featured</p>
      </template>
    </AwardsRecognitionSection>

    <!-- 10. Recommendations Section -->
    <RecommendationsSection>
      <template #label>
        Recommendations
      </template>

      <RecommendationItem
        id="rec-1"
        :index="0"
        quote="An extraordinary individual"
        full-recommendation="I worked closely with Morten for almost three years while building an ambitious creative digital agency with Morten as a key player in executing on our most prominent digital design solutions.

Morten is always on the lookout for what's next and has a strong eye for spotting design trends and capturing the visual DNA of clients on all levels.

I have always been impressed by the speed and thoroughness that Morten shows in all projects he is a part of."
        author-first-name="Thomas"
        author-last-name="Rømhild"
        author-title="CEO, Bærnholdt"
        author-image="/assets/dummy/placeholder.jpg"
      />

      <RecommendationItem
        id="rec-2"
        :index="1"
        quote="I understood once & for all"
        full-recommendation="Morten's user-centric approach significantly improved our platform's usability and conversion rates. His attention to detail and ability to translate complex requirements into intuitive designs has been invaluable to our product development process."
        author-first-name="Jesper"
        author-last-name="Geldø Hansen"
        author-title="UX Writer, Microsoft"
        author-image="/assets/dummy/placeholder2.jpg"
      />

      <RecommendationItem
        id="rec-3"
        :index="2"
        quote="A talented passionate designer"
        full-recommendation="Working with Morten was a game-changer for our digital transformation. His creative vision and technical expertise helped us reimagine our entire user experience. He consistently delivered exceptional work that exceeded our expectations."
        author-first-name="Mikkel"
        author-last-name="Kreiner"
        author-title="CTO, Arkyn"
        author-image="/assets/dummy/placeholder3.jpg"
      />

      <RecommendationItem
        id="rec-4"
        :index="3"
        quote="Fast and efficient at work and colleagues"
        full-recommendation="Morten brings an incredible combination of strategic thinking and hands-on design skills. His ability to understand business objectives and translate them into compelling user experiences sets him apart. A true professional in every sense."
        author-first-name="Rune"
        author-last-name="Brændholt"
        author-title="Partner, Bærnholdt"
        author-image="/assets/dummy/placeholder1.jpg"
      />
    </RecommendationsSection>

    <!-- 11. Image from left -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder3.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="left"
    />

    <!-- 12. Spacer -->
    <div class="h-20" />

    <!-- 13. Image from right -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder1.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="right"
    />
  </div>
</template>
