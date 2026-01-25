<script lang="ts">
  import type { AnalysisTableItem } from '$lib/types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { parseInlineMarkdown } from '$lib/utils/markdown';

  interface Props {
    item: AnalysisTableItem;
    index: number;
    onSuggestFix?: (item: AnalysisTableItem) => void;
    isHighlighted?: boolean;
    onHighlight?: (id: string) => void;
  }

  let { item, index, onSuggestFix, isHighlighted = false, onHighlight }: Props = $props();

  const severityVariant = {
    High: 'high',
    Medium: 'medium',
    Low: 'low'
  } as const;

  const sourceLabels = {
    primaryImage: 'Image',
    videoFrame: 'Video',
    descriptionText: 'Description',
    ctaText: 'CTA'
  } as const;

  function getSeverityBorderClass(severity: string | undefined): string {
    switch (severity) {
      case 'High':
        return 'border-l-negative';
      case 'Medium':
        return 'border-l-warning';
      case 'Low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  }
</script>

<div
  class="bg-white rounded-xl border border-gray-200 shadow-card p-4 border-l-4 transition-all duration-200 hover:shadow-elevated animate-slide-up {getSeverityBorderClass(item.severity)} {isHighlighted ? 'ring-2 ring-accent shadow-elevated' : ''} {item.boundingBox && onHighlight ? 'cursor-pointer' : ''}"
  style="animation-delay: {index * 50}ms"
  data-issue-id={item.id}
  onmouseenter={() => item.boundingBox && onHighlight?.(item.id)}
  onmouseleave={() => onHighlight?.('')}
  onclick={() => item.boundingBox && onHighlight?.(item.id)}
  role={item.boundingBox && onHighlight ? 'button' : undefined}
  tabindex={item.boundingBox && onHighlight ? 0 : undefined}
>
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center gap-2 flex-wrap mb-2">
        {#if item.severity}
          <Badge variant={severityVariant[item.severity as keyof typeof severityVariant] || 'default'}>
            {item.severity} Risk
          </Badge>
        {/if}
        {#if item.sourceContext}
          <Badge variant="default">
            {sourceLabels[item.sourceContext] || item.sourceContext}
          </Badge>
        {/if}
        {#if item.timestamp !== undefined && item.timestamp !== null}
          <Badge variant="default">
            {Math.floor(item.timestamp / 60)}:{(item.timestamp % 60).toString().padStart(2, '0')}
          </Badge>
        {/if}
      </div>

      <!-- Content -->
      <p class="text-sm text-gray-900 font-medium mb-1">
        {@html parseInlineMarkdown(item.identifiedContent)}
      </p>

      <!-- Issue Description -->
      <p class="text-sm text-gray-600 mb-2">
        {@html parseInlineMarkdown(item.issueDescription)}
      </p>

      <!-- Recommendation -->
      <div class="bg-positive-light/50 rounded-lg px-3 py-2">
        <p class="text-sm text-positive-dark">
          <span class="font-medium">Fix:</span> {@html parseInlineMarkdown(item.recommendation)}
        </p>
      </div>
    </div>

    <!-- Actions -->
    {#if onSuggestFix}
      <Button variant="secondary" size="sm" onclick={() => onSuggestFix(item)}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI Fix
      </Button>
    {/if}
  </div>
</div>
