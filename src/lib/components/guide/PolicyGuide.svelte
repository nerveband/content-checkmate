<script lang="ts">
  import { POLICY_CATEGORIES, POLICY_GUIDE } from '$lib/data/policies';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Markdown from '$lib/components/ui/Markdown.svelte';

  let searchQuery = $state('');
  let activeCategory = $state<string | null>(null);

  const policyContent: Record<string, { title: string; content: string[] }[]> = {
    'word-restrictions': [
      {
        title: 'Personal Attributes (Banned)',
        content: [
          'Race, ethnicity, religion, sexual orientation',
          'Terms: "Catholic Church", "Jewish holidays", "LGBT culture"',
          'Health conditions: "diabetes awareness", "chemotherapy"'
        ]
      },
      {
        title: 'Financial/Scam Indicators',
        content: [
          '"Get rich quick", "work from home", "pyramid scheme"',
          '"Quick cash", "debt relief", "easy money"',
          '"Miracle", "cure", "illegal drugs"'
        ]
      },
      {
        title: 'Sensitive Content',
        content: [
          '"Pandemic", "coronavirus", "infection"',
          '"Cigarettes", "guns", "ammunition"',
          '"Gambling", "betting", "casino"'
        ]
      },
      {
        title: 'Political Triggers',
        content: [
          '"Politics", "election", "voting", "candidate"',
          '"Immigration", "civil rights", "social justice"',
          '"Conspiracy theories", "feminism"'
        ]
      }
    ],
    'content-categories': [
      {
        title: 'SIEP (Social Issues, Elections, Politics)',
        content: [
          'Voting rights advocacy',
          'Civil rights movements',
          'Immigration policy discussion',
          'Electoral advocacy',
          'Healthcare access advocacy'
        ]
      },
      {
        title: 'DOI (Dangerous Organizations/Individuals)',
        content: [
          'Blacklisted political movements',
          'Designated terrorist organizations',
          'Banned political parties',
          'Praise for restricted individuals'
        ]
      }
    ],
    'image-detection': [
      {
        title: 'Prohibited Visual Content',
        content: [
          'Violence or weapons imagery',
          'Political rally footage without disclaimers',
          'Misleading before/after images',
          'AI-generated political content without disclosure'
        ]
      },
      {
        title: 'Sensitive Visual Categories',
        content: [
          'Protest imagery (may require SIEP auth)',
          'Government buildings/officials',
          'Military/police in political context',
          'Religious symbols in ads'
        ]
      }
    ],
    geographic: [
      {
        title: 'Special Regional Rules',
        content: [
          'Washington State: No local election ads',
          'Palestine/Israel: Enhanced scrutiny',
          'Election periods: Blanket restrictions'
        ]
      },
      {
        title: 'Country-Specific Policies',
        content: [
          'EU: Enhanced transparency (DSA)',
          'US: Strict election interference policies',
          'Brazil/India: Regional election restrictions'
        ]
      }
    ],
    authorization: [
      {
        title: 'Mandatory Authorization Triggers',
        content: [
          'Political candidate mentions',
          'Social issue advocacy',
          'Election-related content',
          'Civil rights messaging',
          'Health policy advocacy'
        ]
      },
      {
        title: 'Verification Requirements',
        content: [
          'Identity verification',
          'Business documentation',
          'Geographic verification',
          'Disclaimer placement'
        ]
      }
    ],
    'ai-synthetic': [
      {
        title: 'Mandatory Disclosure',
        content: [
          'Realistic depictions of people',
          'Realistic-looking people who don\'t exist',
          'Realistic events that didn\'t happen',
          'Altered footage of real events'
        ]
      },
      {
        title: 'Detection Priorities',
        content: [
          'Deepfake political content',
          'Synthetic audio in political ads',
          'Manipulated images',
          'AI-generated protest footage'
        ]
      }
    ],
    'risk-scoring': [
      {
        title: 'High Risk (Immediate Flag)',
        content: [
          'Direct political candidate mentions',
          'Fundraising for political causes',
          'Voting procedure instructions',
          'Sensitive geopolitical content'
        ]
      },
      {
        title: 'Medium Risk (Enhanced Review)',
        content: [
          'Social issue advocacy',
          'Health policy discussion',
          'Immigration-related content',
          'Religious messaging in ads'
        ]
      },
      {
        title: 'Low Risk (Monitor)',
        content: [
          'General educational content',
          'Non-political messaging',
          'Cultural celebration content',
          'Generic health information'
        ]
      }
    ]
  };

  const icons: Record<string, string> = {
    type: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    layers: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    key: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    sparkles: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    'alert-triangle': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  };
</script>

<div class="space-y-6">
  <!-- Search -->
  <Input
    bind:value={searchQuery}
    placeholder="Search policies..."
    class="max-w-md"
  />

  <!-- Categories Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {#each POLICY_CATEGORIES as category}
      <button
        type="button"
        class="text-left p-4 rounded-xl border-2 transition-all duration-200 {activeCategory === category.id ? 'border-accent bg-accent-light/30' : 'border-gray-200 hover:border-accent/50 bg-white'}"
        onclick={() => activeCategory = activeCategory === category.id ? null : category.id}
      >
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[category.icon] || icons.type} />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">{category.title}</h3>
            <p class="text-xs text-gray-500">{category.description}</p>
          </div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Category Details -->
  {#if activeCategory && policyContent[activeCategory]}
    <Card class="animate-slide-up">
      <div class="space-y-6">
        {#each policyContent[activeCategory] as section}
          <div>
            <h4 class="font-medium text-gray-900 mb-2">{section.title}</h4>
            <ul class="space-y-1">
              {#each section.content as item}
                {#if !searchQuery || item.toLowerCase().includes(searchQuery.toLowerCase())}
                  <li class="text-sm text-gray-600 flex items-start gap-2">
                    <span class="text-accent mt-1">•</span>
                    <span>{@html item.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark class="bg-accent-light px-0.5 rounded">$1</mark>')}</span>
                  </li>
                {/if}
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </Card>
  {:else if !activeCategory}
    <Card>
      <div class="text-center py-8">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 mb-4">Select a category above to view policy details</p>

        <!-- Demo: Full Policy Guide with Markdown -->
        <details class="mt-6 text-left">
          <summary class="text-accent hover:text-accent-dark cursor-pointer font-medium">
            View Full Policy Guide (Markdown Demo)
          </summary>
          <div class="mt-4 max-h-96 overflow-y-auto">
            <Markdown content={POLICY_GUIDE} />
          </div>
        </details>
      </div>
    </Card>
  {/if}
</div>
