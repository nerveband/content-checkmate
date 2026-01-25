<script lang="ts">
  /**
   * PolicyContent Component
   *
   * Renders policy content with enhanced formatting:
   * - Cards for subsections
   * - Tags/chips for individual policy items
   * - Color-coded categories
   * - Icons for different types
   */

  interface Props {
    content: string;
    searchQuery?: string;
  }

  let { content, searchQuery = '' }: Props = $props();

  // Parse content into structured format
  interface PolicyItem {
    text: string;
    isHighlighted: boolean;
  }

  interface PolicySubsection {
    title: string;
    items: PolicyItem[];
    type: 'prohibited' | 'sensitive' | 'required' | 'info';
  }

  interface PolicySection {
    title: string;
    description: string;
    subsections: PolicySubsection[];
  }

  function detectType(title: string, content: string): 'prohibited' | 'sensitive' | 'required' | 'info' {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerTitle.includes('prohibited') || lowerTitle.includes('banned') ||
        lowerTitle.includes('dangerous') || lowerContent.includes('flag content')) {
      return 'prohibited';
    }
    if (lowerTitle.includes('sensitive') || lowerTitle.includes('restricted') ||
        lowerTitle.includes('special') || lowerTitle.includes('caution')) {
      return 'sensitive';
    }
    if (lowerTitle.includes('required') || lowerTitle.includes('mandatory') ||
        lowerTitle.includes('authorization') || lowerTitle.includes('verification')) {
      return 'required';
    }
    return 'info';
  }

  function getTypeStyles(type: 'prohibited' | 'sensitive' | 'required' | 'info') {
    switch (type) {
      case 'prohibited':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          headerBg: 'bg-red-100',
          headerText: 'text-red-800',
          tagBg: 'bg-red-100',
          tagText: 'text-red-700',
          icon: '⛔'
        };
      case 'sensitive':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50',
          headerBg: 'bg-amber-100',
          headerText: 'text-amber-800',
          tagBg: 'bg-amber-100',
          tagText: 'text-amber-700',
          icon: '⚠️'
        };
      case 'required':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          headerBg: 'bg-blue-100',
          headerText: 'text-blue-800',
          tagBg: 'bg-blue-100',
          tagText: 'text-blue-700',
          icon: '📋'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          headerBg: 'bg-gray-100',
          headerText: 'text-gray-800',
          tagBg: 'bg-gray-100',
          tagText: 'text-gray-700',
          icon: 'ℹ️'
        };
    }
  }

  function parseContent(rawContent: string): PolicySection {
    const lines = rawContent.split('\n');
    const section: PolicySection = {
      title: '',
      description: '',
      subsections: []
    };

    let currentSubsection: PolicySubsection | null = null;
    let descriptionLines: string[] = [];
    let inDescription = true;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Main section title (## Header)
      if (trimmedLine.startsWith('## ')) {
        section.title = trimmedLine.replace('## ', '');
        inDescription = true;
        continue;
      }

      // Subsection title (### Header or **Bold Header**)
      if (trimmedLine.startsWith('### ') || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.startsWith('- '))) {
        inDescription = false;

        // Save previous subsection
        if (currentSubsection && currentSubsection.items.length > 0) {
          section.subsections.push(currentSubsection);
        }

        const title = trimmedLine.replace('### ', '').replace(/\*\*/g, '');
        currentSubsection = {
          title,
          items: [],
          type: detectType(title, '')
        };
        continue;
      }

      // List items
      if (trimmedLine.startsWith('- ')) {
        inDescription = false;
        const itemText = trimmedLine.replace('- ', '').replace(/\*\*/g, '').replace(/"/g, '');
        const isHighlighted = searchQuery && itemText.toLowerCase().includes(searchQuery.toLowerCase());

        if (currentSubsection) {
          currentSubsection.items.push({ text: itemText, isHighlighted });
          // Update type based on content
          currentSubsection.type = detectType(currentSubsection.title, itemText);
        }
        continue;
      }

      // Description text (non-empty lines before first subsection)
      if (inDescription && trimmedLine && !trimmedLine.startsWith('#')) {
        descriptionLines.push(trimmedLine.replace(/\*\*/g, ''));
      }
    }

    // Save last subsection
    if (currentSubsection && currentSubsection.items.length > 0) {
      section.subsections.push(currentSubsection);
    }

    section.description = descriptionLines.join(' ').trim();

    return section;
  }

  const parsedSection = $derived(parseContent(content));
</script>

<div class="space-y-6">
  <!-- Section Header -->
  {#if parsedSection.title}
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-xl font-bold text-gray-900">{parsedSection.title}</h2>
      {#if parsedSection.description}
        <p class="mt-2 text-gray-600 text-sm">{parsedSection.description}</p>
      {/if}
    </div>
  {/if}

  <!-- Subsections as Cards -->
  {#if parsedSection.subsections.length > 0}
    <div class="grid gap-4">
      {#each parsedSection.subsections as subsection}
        {@const styles = getTypeStyles(subsection.type)}

        <div class="rounded-lg border {styles.border} {styles.bg} overflow-hidden">
          <!-- Subsection Header -->
          <div class="px-4 py-3 {styles.headerBg} {styles.headerText} font-medium flex items-center gap-2">
            <span>{styles.icon}</span>
            <span>{subsection.title}</span>
            <span class="ml-auto text-xs opacity-70">{subsection.items.length} items</span>
          </div>

          <!-- Items as Tags -->
          <div class="p-4">
            <div class="flex flex-wrap gap-2">
              {#each subsection.items as item}
                <span
                  class="inline-flex items-center px-3 py-1.5 rounded-full text-sm {styles.tagBg} {styles.tagText} {item.isHighlighted ? 'ring-2 ring-accent ring-offset-1 font-medium' : ''}"
                >
                  {item.text}
                </span>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Fallback for sections without subsections - render as formatted text -->
    <div class="prose prose-sm max-w-none text-gray-700">
      {@html content
        .replace(/^## .*$/gm, '')
        .replace(/^### (.*)$/gm, '<h4 class="font-semibold text-gray-900 mt-4 mb-2">$1</h4>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/^- (.*)$/gm, '<div class="flex items-start gap-2 mb-1"><span class="text-accent mt-1">•</span><span>$1</span></div>')
        .replace(/\n\n/g, '<br/><br/>')
      }
    </div>
  {/if}
</div>
