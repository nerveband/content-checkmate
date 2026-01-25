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

  let imageElement: HTMLImageElement;
  let containerElement: HTMLDivElement;
  let imageDimensions = $state({ width: 0, height: 0 });

  function handleImageLoad() {
    if (imageElement && containerElement) {
      imageDimensions = {
        width: imageElement.clientWidth,
        height: imageElement.clientHeight
      };
    }
  }

  function getBoxStyle(box: { x_min: number; y_min: number; x_max: number; y_max: number }) {
    const left = box.x_min * 100;
    const top = box.y_min * 100;
    const width = (box.x_max - box.x_min) * 100;
    const height = (box.y_max - box.y_min) * 100;

    return `left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;`;
  }

  const issuesWithBoxes = $derived(issues.filter(issue => issue.boundingBox));
</script>

<div bind:this={containerElement} class="relative inline-block">
  <img
    bind:this={imageElement}
    src={imageUrl}
    alt="Analysis preview"
    class="max-w-full h-auto"
    onload={handleImageLoad}
  />

  {#if visible && issuesWithBoxes.length > 0}
    {#each issuesWithBoxes as issue}
      {#if issue.boundingBox}
        <button
          type="button"
          class="absolute border-2 transition-all cursor-pointer {highlightedIssueId === issue.id ? 'border-negative bg-negative/20 border-4' : 'border-accent bg-accent/10 hover:bg-accent/20'}"
          style={getBoxStyle(issue.boundingBox)}
          onclick={() => onIssueClick?.(issue.id)}
          aria-label="Bounding box for {issue.identifiedContent}"
        ></button>
      {/if}
    {/each}
  {/if}
</div>
