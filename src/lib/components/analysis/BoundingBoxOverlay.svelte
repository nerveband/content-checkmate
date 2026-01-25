<script lang="ts">
  import type { AnalysisTableItem } from '$lib/types';
  import { stripMarkdown } from '$lib/utils/markdown';

  let {
    imageUrl,
    issues,
    visible = true,
    highlightedIssueId = null,
    onIssueClick,
    showLabels = true,
    size = 'normal'
  }: {
    imageUrl: string;
    issues: AnalysisTableItem[];
    visible?: boolean;
    highlightedIssueId?: string | null;
    onIssueClick?: (issueId: string) => void;
    showLabels?: boolean;
    size?: 'normal' | 'large';
  } = $props();

  let hoveredIssueId = $state<string | null>(null);

  function getBoxStyle(box: { x_min: number; y_min: number; x_max: number; y_max: number }) {
    const left = box.x_min * 100;
    const top = box.y_min * 100;
    const width = (box.x_max - box.x_min) * 100;
    const height = (box.y_max - box.y_min) * 100;

    return `left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;`;
  }

  // Determine if tooltip should show below (for boxes near top of image)
  function shouldShowTooltipBelow(box: { y_min: number }): boolean {
    return box.y_min < 0.3; // If box is in top 30%, show tooltip below
  }

  function getSeverityColor(severity: string | undefined) {
    switch (severity) {
      case 'High':
        return {
          border: 'border-red-500',
          bg: 'bg-red-500/20',
          bgHover: 'hover:bg-red-500/30',
          label: 'bg-red-500',
          text: 'text-white'
        };
      case 'Medium':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-500/20',
          bgHover: 'hover:bg-amber-500/30',
          label: 'bg-amber-500',
          text: 'text-white'
        };
      case 'Low':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-500/20',
          bgHover: 'hover:bg-blue-500/30',
          label: 'bg-blue-500',
          text: 'text-white'
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-500/20',
          bgHover: 'hover:bg-gray-500/30',
          label: 'bg-gray-500',
          text: 'text-white'
        };
    }
  }

  function handleClick(issueId: string) {
    onIssueClick?.(issueId);
    // Scroll to the violation card
    const card = document.querySelector(`[data-issue-id="${issueId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const issuesWithBoxes = $derived(issues.filter(issue => issue.boundingBox));
</script>

<div class="relative inline-block {size === 'large' ? 'w-full' : ''}">
  <img
    src={imageUrl}
    alt="Uploaded image with policy violation highlights"
    class="{size === 'large' ? 'w-full h-auto' : 'max-w-full h-auto'} rounded-lg"
  />

  {#if visible && issuesWithBoxes.length > 0}
    {#each issuesWithBoxes as issue, index}
      {@const colors = getSeverityColor(issue.severity)}
      {@const isHighlighted = highlightedIssueId === issue.id}
      {@const isHovered = hoveredIssueId === issue.id}

      <button
        type="button"
        class="absolute border-2 transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-none
          {isHighlighted ? `${colors.border} ${colors.bg} border-4 shadow-lg` : `${colors.border} ${colors.bg} ${colors.bgHover}`}
          {isHovered ? 'z-20' : 'z-10'}"
        style={getBoxStyle(issue.boundingBox)}
        onclick={() => handleClick(issue.id)}
        onmouseenter={() => hoveredIssueId = issue.id}
        onmouseleave={() => hoveredIssueId = null}
        aria-label="Issue: {stripMarkdown(issue.identifiedContent)}"
      >
        <!-- Severity Label Badge -->
        {#if showLabels}
          <span class="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap {colors.label} {colors.text} shadow-sm">
            {issue.severity || 'Issue'} #{index + 1}
          </span>
        {/if}

        <!-- Tooltip on Hover - positioned based on box location -->
        {#if isHovered}
          {@const showBelow = shouldShowTooltipBelow(issue.boundingBox)}
          <div
            class="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            style="{showBelow ? 'top: 100%; margin-top: 0.5rem;' : 'bottom: 100%; margin-bottom: 0.5rem;'}"
          >
            <div class="bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 w-72 relative">
              <!-- Arrow pointing to box -->
              {#if showBelow}
                <div class="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
              {:else}
                <div class="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
              {/if}

              <!-- Content -->
              <div class="space-y-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-1.5 py-0.5 rounded text-xs font-medium {colors.label}">
                    {issue.severity}
                  </span>
                  {#if issue.sourceContext}
                    <span class="text-gray-400 text-xs">
                      {issue.sourceContext === 'primaryImage' ? 'Image' : issue.sourceContext}
                    </span>
                  {/if}
                </div>

                {#if issue.identifiedContent}
                  <p class="font-medium text-sm leading-snug text-white">
                    {stripMarkdown(issue.identifiedContent)}
                  </p>
                {/if}

                {#if issue.issueDescription}
                  <p class="text-gray-300 text-xs leading-snug">
                    {stripMarkdown(issue.issueDescription)}
                  </p>
                {/if}

                {#if issue.recommendation}
                  <div class="pt-1.5 border-t border-gray-700">
                    <p class="text-green-400 text-xs leading-snug">
                      <span class="font-medium">Fix:</span> {stripMarkdown(issue.recommendation)}
                    </p>
                  </div>
                {/if}

                <p class="text-gray-500 text-xs italic pt-1">
                  Click to view details
                </p>
              </div>
            </div>
          </div>
        {/if}
      </button>
    {/each}
  {/if}
</div>
