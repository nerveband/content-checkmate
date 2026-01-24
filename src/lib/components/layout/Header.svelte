<script lang="ts">
  import { settingsStore } from '$lib/stores/settings.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let showApiKeyInput = $state(false);
  let apiKeyInput = $state('');

  function toggleApiKeyInput() {
    showApiKeyInput = !showApiKeyInput;
    if (showApiKeyInput) {
      apiKeyInput = settingsStore.apiKey;
    }
  }

  function saveApiKey() {
    settingsStore.apiKey = apiKeyInput;
    showApiKeyInput = false;
  }
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-30">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-subtle">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 class="font-display text-xl text-gray-900">Content Checkmate</h1>
          <p class="text-xs text-gray-500">AI Policy Analyzer</p>
        </div>
      </div>

      <!-- API Key Status -->
      <div class="flex items-center gap-4">
        {#if settingsStore.hasValidApiKey}
          <div class="flex items-center gap-2 text-sm text-positive">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>API Connected</span>
          </div>
        {/if}

        <Button variant="ghost" size="sm" onclick={toggleApiKeyInput}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          API Key
        </Button>
      </div>
    </div>

    <!-- API Key Input Panel -->
    {#if showApiKeyInput}
      <div class="py-4 border-t border-gray-100 animate-slide-up">
        <div class="flex items-end gap-4 max-w-xl">
          <div class="flex-1">
            <Input
              bind:value={apiKeyInput}
              type="password"
              label="Gemini API Key"
              placeholder="Enter your Gemini API key"
            />
          </div>
          <Button variant="primary" onclick={saveApiKey}>Save</Button>
          <Button variant="ghost" onclick={() => showApiKeyInput = false}>Cancel</Button>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener" class="text-accent hover:underline">Google AI Studio</a>
        </p>
      </div>
    {/if}
  </div>
</header>
