<script lang="ts">
  import { editorStore } from '$lib/stores/editor.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { generateImage, initializeClient, getClient } from '$lib/services/gemini';
  import { generateId, downloadImage, formatFileSize, isValidImageType } from '$lib/utils/fileUtils';
  import Button from '$lib/components/ui/Button.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  let isDragging = $state(false);
  let fileInputRef = $state<HTMLInputElement>();

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      handleFile(input.files[0]);
    }
  }

  function handleFile(file: File) {
    if (!isValidImageType(file)) {
      editorStore.error = 'Please upload a valid image file (JPEG, PNG, GIF, WebP)';
      return;
    }
    editorStore.setFile(file);
  }

  async function handleGenerate() {
    if (!editorStore.prompt.trim()) {
      editorStore.error = 'Please enter an editing prompt';
      return;
    }

    if (!settingsStore.hasValidApiKey) {
      editorStore.error = 'Please add your Gemini API key first';
      return;
    }

    editorStore.isGenerating = true;
    editorStore.error = null;

    try {
      if (!getClient()) {
        initializeClient(settingsStore.apiKey);
      }

      // Get MIME type from uploaded file if available
      const mimeType = editorStore.uploadedFile?.type || 'image/png';

      const result = await generateImage(
        editorStore.uploadedFileBase64 || '',
        editorStore.prompt,
        mimeType
      );
      editorStore.generatedImage = result;

      // Add to history
      editorStore.addToHistory({
        id: generateId(),
        prompt: editorStore.prompt,
        imageUrl: result,
        timestamp: Date.now()
      });
    } catch (err) {
      editorStore.error = err instanceof Error ? err.message : 'Failed to generate image';
    } finally {
      editorStore.isGenerating = false;
    }
  }

  function handleDownload() {
    if (editorStore.generatedImage) {
      downloadImage(editorStore.generatedImage, `generated-${Date.now()}.png`);
    }
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left: Input -->
    <div class="space-y-4">
      <!-- Source Image Upload -->
      <Card>
        <h3 class="font-medium text-gray-900 mb-3">Source Image (Optional)</h3>

        {#if !editorStore.uploadedFile}
          <div
            class="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer {isDragging ? 'border-accent bg-accent-light/50' : 'border-gray-300 hover:border-accent hover:bg-accent-light/30'}"
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            ondrop={handleDrop}
            onclick={() => fileInputRef?.click()}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && fileInputRef?.click()}
          >
            <input
              bind:this={fileInputRef}
              type="file"
              accept="image/*"
              class="hidden"
              onchange={handleFileSelect}
            />
            <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-gray-600">Drop an image to edit, or generate from scratch</p>
          </div>
        {:else}
          <div class="relative group">
            <img
              src={editorStore.uploadedFilePreview}
              alt="Source"
              class="w-full rounded-lg"
            />
            <button
              type="button"
              class="absolute top-2 right-2 p-2 bg-white/90 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onclick={() => editorStore.clearFile()}
              aria-label="Remove image"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/if}
      </Card>

      <!-- Prompt Input -->
      <Card>
        <Textarea
          bind:value={editorStore.prompt}
          label="Editing Instructions"
          placeholder="Describe how you want to transform the image... e.g., 'Make it look like a vintage poster' or 'Add a sunset background'"
          rows={4}
        />

        {#if editorStore.error}
          <p class="text-sm text-negative mt-2">{editorStore.error}</p>
        {/if}

        <div class="mt-4">
          <Button
            variant="primary"
            loading={editorStore.isGenerating}
            disabled={!editorStore.prompt.trim() || !settingsStore.hasValidApiKey}
            onclick={handleGenerate}
            class="w-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {editorStore.isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>
      </Card>
    </div>

    <!-- Right: Result -->
    <div>
      <Card class="h-full">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-900">Result</h3>
          {#if editorStore.generatedImage}
            <Button variant="ghost" size="sm" onclick={handleDownload}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Button>
          {/if}
        </div>

        {#if editorStore.isGenerating}
          <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-sm text-gray-600">Generating image...</p>
              <p class="text-xs text-gray-400 mt-1">This may take a moment</p>
            </div>
          </div>
        {:else if editorStore.generatedImage}
          <img
            src={editorStore.generatedImage}
            alt="Generated"
            class="w-full rounded-lg"
          />
        {:else}
          <div class="aspect-square bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
            <div class="text-center">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-400">Generated image will appear here</p>
            </div>
          </div>
        {/if}
      </Card>
    </div>
  </div>

  <!-- History -->
  {#if editorStore.history.length > 0}
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-gray-900">Generation History</h3>
        <Button variant="ghost" size="sm" onclick={() => editorStore.clearHistory()}>
          Clear All
        </Button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {#each editorStore.history as item}
          <button
            type="button"
            class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-accent transition-all"
            onclick={() => editorStore.generatedImage = item.imageUrl}
          >
            <img
              src={item.imageUrl}
              alt={item.prompt}
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p class="text-xs text-white line-clamp-2">{item.prompt}</p>
            </div>
          </button>
        {/each}
      </div>
    </Card>
  {/if}
</div>
