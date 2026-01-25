<script lang="ts">
  import { historyStore } from '$lib/stores/history.svelte';
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { editorStore } from '$lib/stores/editor.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatFileSize, getFileTypeLabel } from '$lib/utils/fileUtils';

  let activeFilter = $state<'all' | 'analyses' | 'generations'>('all');

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'analyses', label: 'Analyses' },
    { id: 'generations', label: 'Generations' }
  ] as const;

  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  function handleLoadAnalysis(entry: typeof historyStore.analyses[0]) {
    // Switch to Media & Text tab
    analysisStore.activeTab = 'mediaAndText';

    // Restore the analysis result
    analysisStore.analysisResult = entry.analysisResult;

    // Note: Cannot restore the actual file, but show the preview
    // In a real implementation, you'd need to store the base64 data
  }

  function handleLoadGeneration(entry: typeof historyStore.generations[0]) {
    // Switch to Image Editor tab
    analysisStore.activeTab = 'imageEditor';

    // Restore the generated image and prompt
    editorStore.generatedImage = entry.imageUrl;
    editorStore.prompt = entry.prompt;
  }

  const filteredAnalyses = $derived(
    activeFilter === 'generations' ? [] : historyStore.analyses
  );

  const filteredGenerations = $derived(
    activeFilter === 'analyses' ? [] : historyStore.generations
  );

  const hasAnyHistory = $derived(
    historyStore.analyses.length > 0 || historyStore.generations.length > 0
  );
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="font-display text-4xl text-gray-900 mb-2">History</h1>
    <p class="text-gray-600">
      View all your past analyses and generated images
    </p>
  </div>

  <!-- Filter Tabs & Clear Button -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex gap-2">
      {#each filterTabs as tab}
        <button
          onclick={() => activeFilter = tab.id}
          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 {activeFilter === tab.id ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    {#if hasAnyHistory}
      <Button variant="ghost" size="sm" onclick={() => historyStore.clearAll()}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All
      </Button>
    {/if}
  </div>

  <!-- Empty State -->
  {#if !hasAnyHistory}
    <Card>
      <div class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
        <p class="text-gray-600">
          Your analyses and generated images will appear here
        </p>
      </div>
    </Card>
  {:else}
    <div class="space-y-6">
      <!-- Analyses Section -->
      {#if filteredAnalyses.length > 0}
        <div>
          <h2 class="font-semibold text-lg text-gray-900 mb-4">
            Analysis History ({filteredAnalyses.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each filteredAnalyses as entry (entry.id)}
              <Card hover class="cursor-pointer group" onclick={() => handleLoadAnalysis(entry)}>
                <!-- Preview Image -->
                <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src={entry.filePreview}
                    alt={entry.uploadedFile.name}
                    class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>

                <!-- Info -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate flex-1">
                      {entry.uploadedFile.name}
                    </p>
                    <Badge
                      variant={entry.analysisResult.overallSeverity === 'Compliant' ? 'compliant' : entry.analysisResult.overallSeverity === 'High Risk' ? 'high' : entry.analysisResult.overallSeverity === 'Medium Risk' ? 'medium' : 'low'}
                      size="sm"
                    >
                      {entry.analysisResult.overallSeverity}
                    </Badge>
                  </div>

                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(entry.uploadedFile.size)}</span>
                    <span>·</span>
                    <span>{getFileTypeLabel(entry.uploadedFile.type)}</span>
                    <span>·</span>
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>

                  {#if entry.analysisResult.issuesTable.length > 0}
                    <p class="text-xs text-gray-600">
                      {entry.analysisResult.issuesTable.length} issue{entry.analysisResult.issuesTable.length === 1 ? '' : 's'} found
                    </p>
                  {/if}
                </div>
              </Card>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Generations Section -->
      {#if filteredGenerations.length > 0}
        <div>
          <h2 class="font-semibold text-lg text-gray-900 mb-4">
            Generated Images ({filteredGenerations.length})
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {#each filteredGenerations as entry (entry.id)}
              <button
                onclick={() => handleLoadGeneration(entry)}
                class="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-accent transition-all duration-200 hover:shadow-md"
                title={entry.prompt}
              >
                <img
                  src={entry.imageUrl}
                  alt="Generated"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p class="text-xs text-white truncate">{entry.prompt}</p>
                  <p class="text-xs text-white/70">{formatTimestamp(entry.timestamp)}</p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
