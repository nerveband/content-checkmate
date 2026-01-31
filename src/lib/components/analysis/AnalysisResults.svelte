<script lang="ts">
  import type { AnalysisResult, AnalysisTableItem } from '$lib/types';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ViolationCard from './ViolationCard.svelte';
  import BoundingBoxOverlay from './BoundingBoxOverlay.svelte';
  import FixGenerationModal from './FixGenerationModal.svelte';
  import { copyToClipboard } from '$lib/utils/fileUtils';
  import { parseInlineMarkdown, parseMarkdown } from '$lib/utils/markdown';
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { fixGenerationStore } from '$lib/stores/fixGeneration.svelte';

  interface Props {
    result: AnalysisResult;
  }

  let { result }: Props = $props();

  let copiedSummary = $state(false);
  let copiedFixes = $state(false);
  let highlightedIssueId = $state<string | null>(null);

  const severityVariant = {
    'High Risk': 'high',
    'Medium Risk': 'medium',
    'Low Risk': 'low',
    Compliant: 'compliant'
  } as const;

  async function handleCopySummary() {
    if (result.summaryForCopy) {
      await copyToClipboard(result.summaryForCopy);
      copiedSummary = true;
      setTimeout(() => (copiedSummary = false), 2000);
    }
  }

  async function handleCopyFixes() {
    if (result.suggestedFixes) {
      await copyToClipboard(result.suggestedFixes);
      copiedFixes = true;
      setTimeout(() => (copiedFixes = false), 2000);
    }
  }
</script>

<div class="space-y-6 animate-fade-in">
  <!-- AI Detection Badge -->
  {#if result.aiDetection}
    <Card>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-900">AI Generation Detection</h3>
          <p class="text-sm text-gray-600 mt-1">
            {@html parseInlineMarkdown(result.aiDetection.reasoning)}
          </p>
        </div>
        <Badge variant={result.aiDetection.confidence > 60 ? 'warning' : 'success'}>
          {result.aiDetection.confidence}% AI Confidence
        </Badge>
      </div>
    </Card>
  {/if}

  <!-- Overall Assessment Card -->
  <Card>
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <h3 class="font-display text-xl text-gray-900">Analysis Result</h3>
          {#if result.overallSeverity}
            <Badge
              variant={severityVariant[result.overallSeverity as keyof typeof severityVariant] || 'default'}
              size="md"
            >
              {result.overallSeverity}
            </Badge>
          {/if}
        </div>
        <p class="text-gray-700">{@html parseInlineMarkdown(result.overallAssessment)}</p>
      </div>

      <!-- Score Indicator -->
      <div class="flex-shrink-0">
        {#if result.overallSeverity === 'Compliant'}
          <div class="w-16 h-16 bg-positive-light rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        {:else if result.overallSeverity === 'High Risk'}
          <div class="w-16 h-16 bg-negative-light rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-negative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        {:else}
          <div class="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        {/if}
      </div>
    </div>

    <!-- Recommendations -->
    {#if result.recommendationsFeedback}
      <div class="mt-4 pt-4 border-t border-gray-100">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
        <p class="text-sm text-gray-600">{@html parseInlineMarkdown(result.recommendationsFeedback)}</p>
      </div>
    {/if}
  </Card>

  <!-- Image Preview with Bounding Boxes - Only for Media & Text tab -->
  {#if analysisStore.activeTab === 'mediaAndText' && analysisStore.uploadedFilePreview && result.issuesTable.some(i => i.boundingBox)}
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">Image Preview</h3>
        <Button
          variant="ghost"
          size="sm"
          onclick={() => analysisStore.showBoundingBoxes = !analysisStore.showBoundingBoxes}
        >
          {analysisStore.showBoundingBoxes ? 'Hide' : 'Show'} Issues
        </Button>
      </div>
      <div class="flex justify-center">
        <div class="max-w-2xl w-full">
          <BoundingBoxOverlay
            imageUrl={analysisStore.uploadedFilePreview}
            issues={result.issuesTable}
            visible={analysisStore.showBoundingBoxes}
            {highlightedIssueId}
            onIssueClick={(id) => highlightedIssueId = id}
          />
          {#if analysisStore.showBoundingBoxes}
            {@const issueCount = result.issuesTable.filter(i => i.boundingBox).length}
            <p class="text-center text-sm text-gray-500 mt-3">
              {issueCount} issue{issueCount !== 1 ? 's' : ''} highlighted - hover for details, click to jump to issue
            </p>
          {/if}
        </div>
      </div>
    </Card>
  {/if}

  <!-- Issues -->
  {#if result.issuesTable && result.issuesTable.length > 0}
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display text-lg text-gray-900">
          Issues Found ({result.issuesTable.length})
        </h3>
        {#if result.issuesTable.length > 1 && analysisStore.uploadedFilePreview && settingsStore.canAnalyze}
          <Button variant="primary" size="sm" onclick={() => fixGenerationStore.openModal(null, true)}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Fix All Issues
          </Button>
        {/if}
      </div>

      <div class="space-y-3">
        {#each result.issuesTable as item, index}
          <ViolationCard
            {item}
            {index}
            onSuggestFix={analysisStore.uploadedFilePreview && settingsStore.canAnalyze
              ? (item) => fixGenerationStore.openModal(item, false)
              : undefined}
            isHighlighted={highlightedIssueId === item.id}
            onHighlight={(id) => highlightedIssueId = id}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Excluded Items -->
  {#if result.excludedItemsTable && result.excludedItemsTable.length > 0}
    <Card>
      <h3 class="font-display text-lg text-gray-900 mb-3">
        Excluded Content ({result.excludedItemsTable.length})
      </h3>
      <div class="space-y-2">
        {#each result.excludedItemsTable as item}
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="flex items-center gap-2 mb-1">
              <Badge variant="default">{item.matchedRule}</Badge>
            </div>
            <p class="text-sm text-gray-700">{@html parseInlineMarkdown(item.identifiedContent)}</p>
            <p class="text-xs text-gray-500 mt-1">{@html parseInlineMarkdown(item.aiNote)}</p>
          </div>
        {/each}
      </div>
    </Card>
  {/if}

  <!-- Copyable Sections -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Summary for Copy -->
    {#if result.summaryForCopy}
      <Card>
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-900">Summary for Designers</h4>
          <Button variant="ghost" size="sm" onclick={handleCopySummary}>
            {#if copiedSummary}
              <svg class="w-4 h-4 text-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            {/if}
          </Button>
        </div>
        <div class="text-sm text-gray-600 whitespace-pre-wrap">{@html parseMarkdown(result.summaryForCopy)}</div>
      </Card>
    {/if}

    <!-- Suggested Fixes -->
    {#if result.suggestedFixes}
      <Card>
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-900">Suggested Fixes</h4>
          <Button variant="ghost" size="sm" onclick={handleCopyFixes}>
            {#if copiedFixes}
              <svg class="w-4 h-4 text-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            {/if}
          </Button>
        </div>
        <div class="text-sm text-gray-600 whitespace-pre-wrap">{@html parseMarkdown(result.suggestedFixes)}</div>
      </Card>
    {/if}
  </div>
</div>

<!-- Fix Generation Modal -->
<FixGenerationModal />
