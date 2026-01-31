<script lang="ts">
  import { fixGenerationStore } from '$lib/stores/fixGeneration.svelte';
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { generateFixPrompt, generateComprehensiveFixPrompt } from '$lib/services/promptEngineering';
  import { generateImage } from '$lib/services/gemini';
  import { generateId, downloadImage } from '$lib/utils/fileUtils';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';

  // Constants
  const TIMER_UPDATE_INTERVAL = 1000; // ms
  const MAX_HISTORY_DISPLAY = 12;

  // Local state
  let editablePrompt = $state('');
  let generationStartTime = $state<number | null>(null);
  let elapsedSeconds = $state(0);
  let timerInterval = $state<ReturnType<typeof setInterval> | undefined>(undefined);

  // Helper function to reset timer
  function resetTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = undefined;
    }
    elapsedSeconds = 0;
    generationStartTime = null;
  }

  // Auto-generate prompt when modal opens (if not already generated)
  $effect(() => {
    if (fixGenerationStore.isModalOpen && !fixGenerationStore.generatedFixPrompt && !fixGenerationStore.isGeneratingPrompt) {
      handleGeneratePrompt();
    }
  });

  // Sync editablePrompt with store
  $effect(() => {
    editablePrompt = fixGenerationStore.generatedFixPrompt;
  });

  // Timer for image generation with cleanup
  $effect(() => {
    if (fixGenerationStore.isGenerating && generationStartTime !== null) {
      // Start timer
      timerInterval = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - generationStartTime!) / 1000);
      }, TIMER_UPDATE_INTERVAL);

      return () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = undefined;
        }
      };
    } else {
      // Clear timer when not generating
      resetTimer();
    }
  });

  async function handleGeneratePrompt() {
    try {
      fixGenerationStore.isGeneratingPrompt = true;
      fixGenerationStore.error = null;

      let prompt: string;

      if (fixGenerationStore.isComprehensiveFix && analysisStore.analysisResult?.issuesTable) {
        // Generate comprehensive fix for all violations
        const violations = analysisStore.analysisResult.issuesTable.filter(
          (item) => item.severity && ['High', 'Medium', 'Low'].includes(item.severity)
        );

        if (violations.length === 0) {
          throw new Error('No violations found to generate comprehensive fix');
        }

        prompt = await generateComprehensiveFixPrompt(violations);
      } else if (fixGenerationStore.targetIssue) {
        // Generate fix for single issue
        prompt = await generateFixPrompt(fixGenerationStore.targetIssue);
      } else {
        throw new Error('No target issue specified for fix generation');
      }

      fixGenerationStore.generatedFixPrompt = prompt;
      editablePrompt = prompt;
    } catch (error) {
      console.error('Failed to generate fix prompt:', error);
      fixGenerationStore.error = error instanceof Error ? error.message : 'Failed to generate fix prompt';
    } finally {
      fixGenerationStore.isGeneratingPrompt = false;
    }
  }

  async function handleGenerateImage() {
    if (!editablePrompt.trim()) {
      fixGenerationStore.error = 'Please provide a fix instruction';
      return;
    }

    if (!analysisStore.uploadedFileBase64 || !analysisStore.uploadedFileMimeType) {
      fixGenerationStore.error = 'No source image available';
      return;
    }

    try {
      fixGenerationStore.isGenerating = true;
      fixGenerationStore.error = null;
      generationStartTime = Date.now();
      elapsedSeconds = 0;

      const generatedImageUrl = await generateImage(
        analysisStore.uploadedFileBase64,
        editablePrompt,
        analysisStore.uploadedFileMimeType
      );

      fixGenerationStore.generatedImage = generatedImageUrl;

      // Add to history
      const historyItem = {
        id: generateId(),
        generatedPrompt: editablePrompt,
        imageUrl: generatedImageUrl,
        originalAnalysisIssueId: fixGenerationStore.targetIssue?.id,
        timestamp: Date.now()
      };

      fixGenerationStore.addToHistory(historyItem);
    } catch (error) {
      console.error('Failed to generate image:', error);
      fixGenerationStore.error = error instanceof Error ? error.message : 'Failed to generate image';
    } finally {
      fixGenerationStore.isGenerating = false;
      generationStartTime = null;
      elapsedSeconds = 0;
    }
  }

  function handleDownload() {
    if (!fixGenerationStore.generatedImage) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `fixed-image-${timestamp}.png`;

    downloadImage(fixGenerationStore.generatedImage, filename);
  }

  function handleRegenerateWithPrompt() {
    // Clear current generated image and regenerate
    fixGenerationStore.generatedImage = null;
    handleGenerateImage();
  }

  function handleClose() {
    editablePrompt = '';
    resetTimer();
    fixGenerationStore.closeModal();
  }

  function handlePromptInput() {
    // Update store when user edits the prompt
    fixGenerationStore.generatedFixPrompt = editablePrompt;
  }
</script>

<Modal
  bind:open={fixGenerationStore.isModalOpen}
  title="Generate Fixed Image"
  size="xl"
  onclose={handleClose}
>
  <div class="space-y-6">
    <!-- Two-column grid for images -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Original Image -->
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Original Image</h3>
        <Card padding="sm" hover={false}>
          {#if analysisStore.uploadedFilePreview}
            <img
              src={analysisStore.uploadedFilePreview}
              alt="Original"
              class="w-full h-auto rounded-lg"
            />
          {:else}
            <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <span class="text-gray-400">No image available</span>
            </div>
          {/if}
        </Card>

        <!-- Fix Instructions (editable) -->
        <div class="mt-4">
          <Textarea
            bind:value={editablePrompt}
            label="Fix Instructions"
            placeholder="Describe how to fix the image..."
            rows={6}
            disabled={fixGenerationStore.isGeneratingPrompt}
            oninput={handlePromptInput}
          />

          {#if fixGenerationStore.isGeneratingPrompt}
            <div class="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span class="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
              <span>Generating fix instructions...</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Right: Generated Image -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-700">Generated Image</h3>
          {#if fixGenerationStore.isGenerating}
            <span class="text-xs text-accent font-medium">
              {elapsedSeconds}s elapsed
            </span>
          {/if}
        </div>

        <Card padding="sm" hover={false}>
          {#if fixGenerationStore.generatedImage}
            <img
              src={fixGenerationStore.generatedImage}
              alt="Generated fix"
              class="w-full h-auto rounded-lg"
            />
          {:else if fixGenerationStore.isGenerating}
            <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="text-sm text-gray-600">Generating image...</p>
                <p class="text-xs text-gray-500 mt-1">{elapsedSeconds}s</p>
              </div>
            </div>
          {:else}
            <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <span class="text-gray-400">No generated image yet</span>
            </div>
          {/if}
        </Card>

        <!-- Action Buttons -->
        <div class="mt-4 flex gap-2">
          {#if fixGenerationStore.generatedImage}
            <Button onclick={handleDownload} variant="primary">
              Download
            </Button>
            <Button onclick={handleRegenerateWithPrompt} variant="secondary">
              Regenerate
            </Button>
          {:else}
            <Button
              onclick={handleGenerateImage}
              variant="primary"
              disabled={fixGenerationStore.isGenerating || fixGenerationStore.isGeneratingPrompt || !editablePrompt.trim()}
              loading={fixGenerationStore.isGenerating}
            >
              Generate Fixed Image
            </Button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Error Display -->
    {#if fixGenerationStore.error}
      <Card padding="md" hover={false} class="bg-negative/5 border-negative/20">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-negative mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-negative">Error</p>
            <p class="text-sm text-gray-700 mt-1">{fixGenerationStore.error}</p>
          </div>
          <button
            onclick={() => { fixGenerationStore.error = null; }}
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss error"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Card>
    {/if}

    <!-- History Section -->
    {#if fixGenerationStore.fixHistory.length > 0}
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-700">Recent Generations</h3>
          <span class="text-xs text-gray-500">{fixGenerationStore.fixHistory.length} item{fixGenerationStore.fixHistory.length === 1 ? '' : 's'}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {#each fixGenerationStore.fixHistory.slice(0, MAX_HISTORY_DISPLAY) as historyItem (historyItem.id)}
            <button
              onclick={() => {
                if (!historyItem.imageUrl || !historyItem.generatedPrompt) return;
                fixGenerationStore.generatedImage = historyItem.imageUrl;
                fixGenerationStore.generatedFixPrompt = historyItem.generatedPrompt;
                editablePrompt = historyItem.generatedPrompt;
              }}
              class="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-accent transition-all duration-200 hover:shadow-md"
              title={historyItem.generatedPrompt}
            >
              <img
                src={historyItem.imageUrl}
                alt="History item"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2">
                <p class="text-xs text-white truncate">{new Date(historyItem.timestamp).toLocaleTimeString()}</p>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</Modal>
