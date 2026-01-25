<script lang="ts">
  import { POLICY_CATEGORIES, POLICY_GUIDE } from '$lib/data/policies';
  import Card from '$lib/components/ui/Card.svelte';
  import Markdown from '$lib/components/ui/Markdown.svelte';
  import { onMount } from 'svelte';

  let searchQuery = $state('');
  let activeSection = $state<string>('word-level-restrictions');
  let contentContainer: HTMLElement;
  let isScrolling = false;

  // Parse POLICY_GUIDE into sections based on ## headers
  const policySections = $derived(() => {
    const sections: Array<{ id: string; title: string; content: string }> = [];
    const lines = POLICY_GUIDE.split('\n');
    let currentSection: { id: string; title: string; content: string[] } | null = null;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection) {
          sections.push({
            id: currentSection.id,
            title: currentSection.title,
            content: currentSection.content.join('\n')
          });
        }
        // Start new section
        const title = line.replace('## ', '');
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        currentSection = { id, title, content: [] };
      }

      if (currentSection) {
        currentSection.content.push(line);
      }
    }

    // Add final section
    if (currentSection) {
      sections.push({
        id: currentSection.id,
        title: currentSection.title,
        content: currentSection.content.join('\n')
      });
    }

    return sections;
  });

  // Filter content by search query
  const filteredSections = $derived(() => {
    if (!searchQuery.trim()) {
      return policySections();
    }

    const query = searchQuery.toLowerCase();
    return policySections()
      .map(section => {
        const lines = section.content.split('\n').filter(line =>
          line.toLowerCase().includes(query)
        );
        return {
          ...section,
          content: lines.join('\n'),
          matchCount: lines.length
        };
      })
      .filter(section => section.matchCount > 0);
  });

  // Scroll to section when navigation item is clicked
  function scrollToSection(sectionId: string) {
    activeSection = sectionId;
    isScrolling = true;

    const element = document.getElementById(`section-${sectionId}`);
    if (element && contentContainer) {
      const containerTop = contentContainer.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const offset = elementTop - containerTop - 20; // 20px padding

      contentContainer.scrollTo({
        top: contentContainer.scrollTop + offset,
        behavior: 'smooth'
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrolling = false;
      }, 1000);
    }
  }

  // Update active section based on scroll position
  function handleScroll() {
    if (isScrolling || !contentContainer) return;

    const sections = policySections();
    const containerTop = contentContainer.getBoundingClientRect().top;

    // Find the section closest to the top of the viewport
    let closestSection = sections[0]?.id;
    let closestDistance = Infinity;

    sections.forEach(section => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        const distance = Math.abs(elementTop - containerTop - 20);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section.id;
        }
      }
    });

    activeSection = closestSection;
  }

  onMount(() => {
    if (contentContainer) {
      contentContainer.addEventListener('scroll', handleScroll);
      return () => contentContainer.removeEventListener('scroll', handleScroll);
    }
  });
</script>

<div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
  <!-- Left Sidebar - Sticky Navigation (25%) -->
  <aside class="lg:w-1/4 flex-shrink-0">
    <div class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
      <Card>
        <h3 class="font-semibold text-gray-900 mb-4">Policy Sections</h3>

        <nav class="space-y-1">
          {#each policySections() as section}
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-sm transition-colors"
              class:bg-accent-light={activeSection === section.id}
              class:text-accent={activeSection === section.id}
              class:font-medium={activeSection === section.id}
              class:text-gray-700={activeSection !== section.id}
              class:hover:bg-gray-100={activeSection !== section.id}
              style="border-radius: var(--radius-md)"
              onclick={() => scrollToSection(section.id)}
            >
              {section.title}
            </button>
          {/each}
        </nav>
      </Card>
    </div>
  </aside>

  <!-- Right Content Area (75%) -->
  <main class="flex-1 overflow-auto" bind:this={contentContainer}>
    <Card>
      <div class="prose prose-sm max-w-none">
        {#if searchQuery.trim()}
          <div class="mb-6 p-4 bg-accent-light/30 border-l-4 border-accent">
            <p class="text-sm text-gray-900">
              Search results for: <strong class="font-semibold">"{searchQuery}"</strong>
            </p>
            <p class="text-xs text-gray-600 mt-1">
              Found {filteredSections().length} matching section{filteredSections().length !== 1 ? 's' : ''}
            </p>
          </div>

          {#if filteredSections().length === 0}
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-gray-500 mb-4">No matching policies found.</p>
              <button
                type="button"
                class="text-accent hover:text-accent-dark underline text-sm"
                onclick={() => searchQuery = ''}
              >
                Clear search
              </button>
            </div>
          {:else}
            {#each filteredSections() as section}
              <div id="section-{section.id}" class="mb-8 scroll-mt-4">
                <Markdown content={section.content} />
              </div>
            {/each}
          {/if}
        {:else}
          {#each policySections() as section}
            <div id="section-{section.id}" class="mb-8 scroll-mt-4">
              <Markdown content={section.content} />
            </div>
          {/each}
        {/if}
      </div>
    </Card>

    <!-- Search Input - Mobile positioned at bottom, desktop at top -->
    <div class="lg:hidden sticky bottom-4 mt-4">
      <div class="bg-white p-4 shadow-elevated" style="border-radius: var(--radius-lg)">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search policies..."
          class="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          style="border-radius: var(--radius-md)"
        />
      </div>
    </div>
  </main>

  <!-- Desktop Search - positioned in top right -->
  <div class="hidden lg:block fixed top-20 right-6 w-64 z-10">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search policies..."
      class="w-full px-4 py-2 bg-white border border-gray-300 shadow-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      style="border-radius: var(--radius-md)"
    />
  </div>
</div>
