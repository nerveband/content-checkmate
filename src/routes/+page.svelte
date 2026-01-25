<script lang="ts">
  import { onMount } from 'svelte';
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { historyStore } from '$lib/stores/history.svelte';
  import { analyzeContent, initializeClient, getClient } from '$lib/services/gemini';
  import { generateId } from '$lib/utils/fileUtils';
  import type { ActiveTab } from '$lib/types';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import FileUpload from '$lib/components/analysis/FileUpload.svelte';
  import ExclusionRules from '$lib/components/analysis/ExclusionRules.svelte';
  import AnalysisResults from '$lib/components/analysis/AnalysisResults.svelte';
  import ImageEditor from '$lib/components/editor/ImageEditor.svelte';
  import PolicyGuide from '$lib/components/guide/PolicyGuide.svelte';
  import History from '$lib/components/history/History.svelte';

  // Timer state for analysis
  let analysisStartTime = $state<number | null>(null);
  let elapsedSeconds = $state(0);
  let timerInterval = $state<ReturnType<typeof setInterval> | undefined>(undefined);

  // Timer effect
  $effect(() => {
    if (analysisStore.isAnalyzing && analysisStartTime !== null) {
      timerInterval = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - analysisStartTime!) / 1000);
      }, 1000);

      return () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = undefined;
        }
      };
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
      }
      if (!analysisStore.isAnalyzing) {
        elapsedSeconds = 0;
        analysisStartTime = null;
      }
    }
  });

  const tabs = [
    { id: 'mediaAndText', label: 'Media & Text' },
    { id: 'textOnly', label: 'Text Only' },
    { id: 'imageEditor', label: 'Image Editor' },
    { id: 'policyGuide', label: 'Policy Guide' },
    { id: 'history', label: 'History' }
  ];

  // Auto-initialize Gemini client if env API key is set
  onMount(() => {
    if (settingsStore.isUsingEnvApiKey && !getClient()) {
      initializeClient(settingsStore.apiKey);
    }
  });

  async function handleAnalyze() {
    if (!settingsStore.hasValidApiKey) {
      analysisStore.error = 'Please add your Gemini API key first (click API Key button in header)';
      return;
    }

    analysisStore.isAnalyzing = true;
    analysisStore.error = null;
    analysisStore.analysisResult = null;
    analysisStartTime = Date.now();
    elapsedSeconds = 0;

    try {
      if (!getClient()) {
        initializeClient(settingsStore.apiKey);
      }

      const result = await analyzeContent(
        analysisStore.uploadedFileBase64,
        analysisStore.uploadedFileMimeType,
        analysisStore.description || undefined,
        analysisStore.ctaText || undefined,
        analysisStore.isVideo,
        analysisStore.selectedExclusionTags.length > 0 ? analysisStore.selectedExclusionTags : undefined,
        analysisStore.customExclusions || undefined,
        analysisStore.postIntent || undefined,
        analysisStore.isSiepNotApplicable
      );

      analysisStore.analysisResult = result;

      // Save to history if we have a file - use base64 data URL for persistence
      if (analysisStore.uploadedFile && analysisStore.uploadedFileBase64 && analysisStore.uploadedFileMimeType) {
        const dataUrl = `data:${analysisStore.uploadedFileMimeType};base64,${analysisStore.uploadedFileBase64}`;
        historyStore.addAnalysis({
          id: generateId(),
          timestamp: Date.now(),
          uploadedFile: {
            name: analysisStore.uploadedFile.name,
            size: analysisStore.uploadedFile.size,
            type: analysisStore.uploadedFile.type
          },
          filePreview: dataUrl,
          analysisResult: result,
          description: analysisStore.description,
          ctaText: analysisStore.ctaText,
          postIntent: analysisStore.postIntent
        });
      }
    } catch (err) {
      analysisStore.error = err instanceof Error ? err.message : 'Analysis failed';
    } finally {
      analysisStore.isAnalyzing = false;
    }
  }

  async function handleTextOnlyAnalyze() {
    if (!settingsStore.hasValidApiKey) {
      analysisStore.error = 'Please add your Gemini API key first';
      return;
    }

    if (!analysisStore.description && !analysisStore.ctaText) {
      analysisStore.error = 'Please enter some text to analyze';
      return;
    }

    analysisStore.isAnalyzing = true;
    analysisStore.error = null;
    analysisStore.analysisResult = null;
    analysisStartTime = Date.now();
    elapsedSeconds = 0;

    try {
      if (!getClient()) {
        initializeClient(settingsStore.apiKey);
      }

      const result = await analyzeContent(
        null,
        null,
        analysisStore.description || undefined,
        analysisStore.ctaText || undefined,
        false,
        analysisStore.selectedExclusionTags.length > 0 ? analysisStore.selectedExclusionTags : undefined,
        analysisStore.customExclusions || undefined,
        analysisStore.postIntent || undefined,
        analysisStore.isSiepNotApplicable
      );

      analysisStore.analysisResult = result;
    } catch (err) {
      analysisStore.error = err instanceof Error ? err.message : 'Analysis failed';
    } finally {
      analysisStore.isAnalyzing = false;
    }
  }

  function canAnalyze(): boolean {
    if (analysisStore.activeTab === 'textOnly') {
      return !!(analysisStore.description || analysisStore.ctaText);
    }
    return !!(analysisStore.uploadedFile || analysisStore.description || analysisStore.ctaText);
  }
</script>

<svelte:head>
  <title>Content Checkmate - AI Policy Analyzer</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Hero Section -->
  <div class="text-center mb-8">
    <h1 class="font-display text-4xl text-gray-900 mb-2">
      Analyze Your Content
    </h1>
    <p class="text-gray-600 max-w-2xl mx-auto">
      Check your content against Meta's advertising policies before you publish.
      Get instant feedback and AI-powered suggestions for compliance.
    </p>
  </div>

  <!-- Tabs -->
  <Tabs
    {tabs}
    bind:activeTab={analysisStore.activeTab}
    class="mb-6"
  />

  <!-- Tab Content -->
  <div class="space-y-6">
    {#if analysisStore.activeTab === 'mediaAndText'}
      <!-- Media & Text Tab -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Inputs -->
        <div class="lg:col-span-2 space-y-6">
          <Card>
            <h2 class="font-display text-xl text-gray-900 mb-4">Upload Content</h2>
            <FileUpload />
          </Card>

          <Card>
            <h2 class="font-display text-xl text-gray-900 mb-4">Add Context</h2>
            <div class="space-y-4">
              <Textarea
                bind:value={analysisStore.description}
                label="Description / Caption"
                placeholder="Enter the text that will accompany your content..."
                rows={3}
              />
              <Textarea
                bind:value={analysisStore.ctaText}
                label="Call to Action"
                placeholder="Enter your CTA text (e.g., 'Shop Now', 'Learn More')..."
                rows={2}
              />
              <Textarea
                bind:value={analysisStore.postIntent}
                label="Post Intent (Optional)"
                placeholder="Describe the goal of this post to get better recommendations..."
                rows={2}
              />
            </div>
          </Card>

          <!-- Analyze Button -->
          <div>
            {#if analysisStore.error}
              <div class="mb-4 p-4 bg-negative-light rounded-lg border border-negative/20">
                <p class="text-sm text-negative-dark">{analysisStore.error}</p>
              </div>
            {/if}

            <Button
              variant="primary"
              size="lg"
              loading={analysisStore.isAnalyzing}
              disabled={!canAnalyze() || !settingsStore.hasValidApiKey}
              onclick={handleAnalyze}
              class="w-full"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {analysisStore.isAnalyzing ? `Analyzing... ${elapsedSeconds}s` : 'Analyze Content'}
            </Button>

            {#if !settingsStore.hasValidApiKey}
              <p class="text-sm text-gray-500 text-center mt-2">
                Add your API key to start analyzing
              </p>
            {/if}
          </div>
        </div>

        <!-- Right Column: Exclusions -->
        <div>
          <Card>
            <ExclusionRules />
          </Card>
        </div>
      </div>

      <!-- Results -->
      {#if analysisStore.analysisResult}
        <div class="mt-8">
          <AnalysisResults result={analysisStore.analysisResult} />
        </div>
      {/if}

    {:else if analysisStore.activeTab === 'textOnly'}
      <!-- Text Only Tab -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <Card>
            <h2 class="font-display text-xl text-gray-900 mb-4">Text Content</h2>
            <div class="space-y-4">
              <Textarea
                bind:value={analysisStore.description}
                label="Main Text"
                placeholder="Enter the text content you want to analyze..."
                rows={5}
              />
              <Textarea
                bind:value={analysisStore.ctaText}
                label="Call to Action"
                placeholder="Enter your CTA text..."
                rows={2}
              />
            </div>
          </Card>

          <div>
            {#if analysisStore.error}
              <div class="mb-4 p-4 bg-negative-light rounded-lg border border-negative/20">
                <p class="text-sm text-negative-dark">{analysisStore.error}</p>
              </div>
            {/if}

            <Button
              variant="primary"
              size="lg"
              loading={analysisStore.isAnalyzing}
              disabled={!canAnalyze() || !settingsStore.hasValidApiKey}
              onclick={handleTextOnlyAnalyze}
              class="w-full"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {analysisStore.isAnalyzing ? `Analyzing... ${elapsedSeconds}s` : 'Analyze Text'}
            </Button>
          </div>
        </div>

        <div>
          <Card>
            <ExclusionRules />
          </Card>
        </div>
      </div>

      {#if analysisStore.analysisResult}
        <div class="mt-8">
          <AnalysisResults result={analysisStore.analysisResult} />
        </div>
      {/if}

    {:else if analysisStore.activeTab === 'imageEditor'}
      <!-- Image Editor Tab -->
      <ImageEditor />

    {:else if analysisStore.activeTab === 'policyGuide'}
      <!-- Policy Guide Tab -->
      <PolicyGuide />

    {:else if analysisStore.activeTab === 'history'}
      <!-- History Tab -->
      <History />
    {/if}
  </div>
</div>
