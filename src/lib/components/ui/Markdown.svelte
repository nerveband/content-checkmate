<script lang="ts">
  /**
   * Markdown Component
   *
   * Renders markdown text with proper styling, especially for bold text.
   * Uses simple regex-based parsing for common markdown features.
   *
   * Features:
   * - **Bold text** rendered with font-weight: 700 (NOT yellow background)
   * - Headers (h1, h2, h3)
   * - Lists (unordered)
   * - Code blocks (inline and multiline)
   * - Links
   * - Paragraphs with proper spacing
   */

  interface Props {
    content: string;
    class?: string;
  }

  let { content = '', class: className = '' }: Props = $props();

  /**
   * Simple markdown parser optimized for our policy guide content.
   * Processes markdown in the correct order to avoid conflicts.
   */
  function parseMarkdown(text: string): string {
    if (!text) return '';

    // Escape HTML to prevent XSS
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parse in order of priority (most specific to least specific)

    // 1. Code blocks (multiline) - preserve content inside
    text = text.replace(/```([^`]+)```/g, '<pre class="code-block"><code>$1</code></pre>');

    // 2. Inline code - preserve content inside
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 3. Headers (must come before bold to avoid conflicts)
    text = text.replace(/^### (.*$)/gim, '<h3 class="heading-3">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="heading-2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="heading-1">$1</h1>');

    // 4. Bold - CRITICAL: Must render as font-weight: 700, NOT background color
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // 5. Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="link" target="_blank" rel="noopener noreferrer">$1</a>');

    // 6. Unordered lists
    text = text.replace(/^\- (.*$)/gim, '<li class="list-item">$1</li>');

    // 7. Wrap consecutive list items in <ul>
    text = text.replace(/(<li class="list-item">.*<\/li>\n?)+/g, '<ul class="list">$&</ul>');

    // 8. Paragraphs - split by double newlines
    const paragraphs = text.split(/\n\n+/);
    text = paragraphs
      .map(p => {
        // Don't wrap if already wrapped in a block element
        if (p.match(/^<(h[123]|ul|pre|div)/)) {
          return p;
        }
        return `<p class="paragraph">${p.replace(/\n/g, '<br />')}</p>`;
      })
      .join('\n');

    return text;
  }

  // Use $derived to automatically update when content changes
  let html = $derived(parseMarkdown(content));
</script>

<div class="markdown {className}">
  {@html html}
</div>

<style>
  .markdown {
    @apply max-w-none;
  }

  /* Headers */
  .markdown :global(.heading-1) {
    @apply text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0;
  }

  .markdown :global(.heading-2) {
    @apply text-xl font-semibold text-gray-900 mt-6 mb-3 first:mt-0;
  }

  .markdown :global(.heading-3) {
    @apply text-lg font-semibold text-gray-900 mt-4 mb-2 first:mt-0;
  }

  /* Bold - CRITICAL: font-weight, NOT background color */
  .markdown :global(.font-bold),
  .markdown :global(strong) {
    font-weight: 700;
    color: rgb(17 24 39); /* gray-900 */
  }

  /* Paragraphs */
  .markdown :global(.paragraph) {
    @apply text-gray-700 mb-3 leading-relaxed;
  }

  .markdown :global(.paragraph:last-child) {
    @apply mb-0;
  }

  /* Lists */
  .markdown :global(.list) {
    @apply space-y-1 mb-3;
  }

  .markdown :global(.list-item) {
    @apply text-gray-700 ml-5;
    list-style-type: disc;
  }

  /* Links */
  .markdown :global(.link) {
    @apply text-accent hover:text-accent-dark underline transition-colors;
  }

  /* Code */
  .markdown :global(.inline-code) {
    @apply px-1.5 py-0.5 bg-gray-100 text-gray-800 text-sm font-mono;
    border-radius: 0.25rem;
  }

  .markdown :global(.code-block) {
    @apply block p-4 bg-gray-100 text-sm font-mono overflow-x-auto mb-3;
    border-radius: 0.5rem;
  }

  .markdown :global(.code-block code) {
    color: rgb(31 41 55); /* gray-800 */
  }
</style>
