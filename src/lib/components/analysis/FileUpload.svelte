<script lang="ts">
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { formatFileSize, isValidMediaType, getAspectRatio, getFileTypeLabel } from '$lib/utils/fileUtils';
  import Button from '$lib/components/ui/Button.svelte';

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
    if (!isValidMediaType(file)) {
      analysisStore.error = 'Please upload a valid image file (JPEG, PNG, GIF, WebP)';
      return;
    }
    analysisStore.setFile(file);
  }

  function clearFile() {
    analysisStore.clearFile();
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  }
</script>

<div class="space-y-4">
  {#if !analysisStore.uploadedFile}
    <!-- Drop Zone -->
    <div
      class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer {isDragging ? 'border-accent bg-accent-light/50 scale-[1.01]' : 'border-gray-300 hover:border-accent hover:bg-accent-light/30'}"
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

      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p class="text-gray-900 font-medium">Drop your file here, or click to browse</p>
          <p class="text-sm text-gray-500 mt-1">Supports JPEG, PNG, GIF, and WebP images</p>
        </div>
      </div>

      {#if isDragging}
        <div class="absolute inset-0 bg-accent/10 rounded-xl flex items-center justify-center pointer-events-none">
          <p class="text-accent font-medium">Drop to upload</p>
        </div>
      {/if}
    </div>
  {:else}
    <!-- File Preview - Simple Thumbnail -->
    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div class="flex items-start gap-4">
        <!-- Preview Thumbnail -->
        <div class="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={analysisStore.uploadedFilePreview}
            alt="Preview"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{analysisStore.uploadedFile.name}</p>
          <div class="text-sm text-gray-500 mt-1 space-y-0.5">
            <p>
              {formatFileSize(analysisStore.uploadedFile.size)}
              <span class="mx-1.5">·</span>
              {getFileTypeLabel(analysisStore.uploadedFile.type)}
            </p>
            {#if analysisStore.imageDimensions}
              <p>
                {analysisStore.imageDimensions.width} × {analysisStore.imageDimensions.height}
                <span class="mx-1.5">·</span>
                {getAspectRatio(analysisStore.imageDimensions.width, analysisStore.imageDimensions.height)}
              </p>
            {/if}
          </div>
          <div class="flex items-center gap-2 mt-3">
            <Button variant="ghost" size="sm" onclick={clearFile}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </Button>
            <Button variant="ghost" size="sm" onclick={() => fileInputRef?.click()}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Replace
            </Button>
          </div>
        </div>
      </div>
    </div>

    <input
      bind:this={fileInputRef}
      type="file"
      accept="image/*"
      class="hidden"
      onchange={handleFileSelect}
    />
  {/if}
</div>
