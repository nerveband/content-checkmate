<script lang="ts">
  import type { AnalysisTableItem } from '$lib/types';

  let {
    imageUrl,
    issues,
    visible = true,
    highlightedIssueId = null,
    onIssueClick
  }: {
    imageUrl: string;
    issues: AnalysisTableItem[];
    visible?: boolean;
    highlightedIssueId?: string | null;
    onIssueClick?: (issueId: string) => void;
  } = $props();

  function getBoxStyle(box: { x_min: number; y_min: number; x_max: number; y_max: number }) {
    const left = box.x_min * 100;
    const top = box.y_min * 100;
    const width = (box.x_max - box.x_min) * 100;
    const height = (box.y_max - box.y_min) * 100;

    return `left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;`;
  }

  const issuesWithBoxes = $derived(issues.filter(issue => issue.boundingBox));
</script>

<div class="relative inline-block">
  <img
    src={imageUrl}
    alt="Uploaded image with policy violation highlights"
    class="max-w-full h-auto"
  />

  {#if visible && issuesWithBoxes.length > 0}
    {#each issuesWithBoxes as issue}
      <button
        type="button"
        class="absolute border-2 transition-all cursor-pointer focus:ring-2 focus:ring-accent focus:outline-none {highlightedIssueId === issue.id ? 'border-negative bg-negative/20 border-4' : 'border-accent bg-accent/10 hover:bg-accent/20'}"
        style={getBoxStyle(issue.boundingBox)}
        onclick={() => onIssueClick?.(issue.id)}
        aria-label="Bounding box for {issue.identifiedContent}"
      ></button>
    {/each}
  {/if}
</div>
