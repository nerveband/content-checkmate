/**
 * Markdown Utility Functions
 *
 * Provides inline markdown parsing for use across components.
 * Handles bold (**text**), italic (*text*), and basic formatting.
 */

/**
 * Parse inline markdown to HTML.
 * Converts **bold**, *italic*, and escapes HTML.
 *
 * @param text - Raw text that may contain markdown
 * @returns HTML string with markdown converted
 */
export function parseInlineMarkdown(text: string | undefined | null): string {
  if (!text) return '';

  // Escape HTML to prevent XSS
  let result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Parse bold (**text**) - must come before italic
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

  // Parse italic (*text*) - single asterisks
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return result;
}

/**
 * Parse full markdown including block elements.
 * For use in larger content blocks like summaries.
 *
 * @param text - Raw text that may contain markdown
 * @returns HTML string with markdown converted
 */
export function parseMarkdown(text: string | undefined | null): string {
  if (!text) return '';

  // Escape HTML to prevent XSS
  let result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (multiline)
  result = result.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 rounded p-2 text-sm font-mono overflow-x-auto my-2"><code>$1</code></pre>');

  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  // Headers
  result = result.replace(/^### (.*$)/gim, '<h3 class="font-semibold text-gray-900 mt-3 mb-1">$1</h3>');
  result = result.replace(/^## (.*$)/gim, '<h2 class="font-semibold text-gray-900 mt-4 mb-2 text-lg">$1</h2>');
  result = result.replace(/^# (.*$)/gim, '<h1 class="font-bold text-gray-900 mt-4 mb-2 text-xl">$1</h1>');

  // Bold (**text**)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

  // Italic (*text*)
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Lists (unordered)
  result = result.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  result = result.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2">$&</ul>');

  // Line breaks for readability (double newline = paragraph break)
  result = result.replace(/\n\n/g, '</p><p class="mt-2">');
  result = '<p>' + result + '</p>';
  result = result.replace(/<p><\/p>/g, ''); // Remove empty paragraphs

  return result;
}

/**
 * Strip markdown formatting from text.
 * Useful for plain text display or copy functions.
 *
 * @param text - Text with markdown formatting
 * @returns Plain text without markdown
 */
export function stripMarkdown(text: string | undefined | null): string {
  if (!text) return '';

  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1')     // Remove italic
    .replace(/`([^`]+)`/g, '$1')       // Remove inline code
    .replace(/```[^`]+```/g, '')       // Remove code blocks
    .replace(/^#{1,3}\s*/gm, '')       // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^- /gm, '• ');           // Convert list markers
}
