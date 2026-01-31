<script lang="ts">
  import { settingsStore } from '$lib/stores/settings.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let showApiKeyInput = $state(false);
  let showHelp = $state(false);
  let apiKeyInput = $state('');

  function toggleApiKeyInput() {
    showApiKeyInput = !showApiKeyInput;
    if (showApiKeyInput) {
      apiKeyInput = settingsStore.hasValidApiKey ? settingsStore.apiKey : '';
    }
  }

  function saveApiKey() {
    settingsStore.apiKey = apiKeyInput.trim();
    showApiKeyInput = false;
  }

  function removeApiKey() {
    settingsStore.removeApiKey();
    apiKeyInput = '';
    showApiKeyInput = false;
    settingsStore.fetchUsage();
  }
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-30" style="box-shadow: 0 1px 6px rgba(0,0,0,0.05);">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <img src="/mascot.png" alt="Content Checkmate" class="h-8 sm:h-10 w-auto flex-shrink-0" />
        <div class="min-w-0">
          <span class="font-display text-base sm:text-lg text-gray-900 truncate block" style="letter-spacing: -0.3px;">Content Checkmate</span>
          <p class="text-[10px] text-gray-400 font-medium tracking-widest uppercase hidden sm:block">AI Policy Analyzer</p>
        </div>
      </div>

      <!-- Right side: Usage + Help + Key status -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {#if settingsStore.hasValidApiKey}
          <!-- Own-key mode -->
          <div class="flex items-center gap-1.5 bg-positive-light text-positive-dark px-2 sm:px-3 py-1.5 text-xs font-medium" style="border-radius: var(--radius-sm);">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span class="hidden sm:inline">Unlimited</span>
          </div>
          <button
            onclick={toggleApiKeyInput}
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 hidden sm:block"
          >
            Change key
          </button>
        {:else}
          <!-- Community mode -->
          {#if settingsStore.usageFetched}
            <div class="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1.5 font-mono" style="border-radius: var(--radius-sm);">
              <span class="font-semibold text-gray-700">{settingsStore.remainingChecks}</span>/{settingsStore.checksLimit}
            </div>
          {/if}
          <Button variant="ghost" size="sm" onclick={toggleApiKeyInput}>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span class="hidden sm:inline">Unlimited</span>
          </Button>
        {/if}

        <!-- Divider -->
        <div class="w-px h-6 bg-gray-200 hidden sm:block"></div>

        <!-- Help button -->
        <button
          onclick={() => showHelp = !showHelp}
          class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          style="border-radius: var(--radius-sm);"
          aria-label="Help and about"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- API Key Input Panel -->
    {#if showApiKeyInput}
      <div class="py-4 border-t border-gray-100 animate-slide-up">
        <div class="flex items-end gap-3 max-w-xl">
          <div class="flex-1">
            <Input
              bind:value={apiKeyInput}
              type="password"
              label="Gemini API Key"
              placeholder="Enter your Gemini API key"
            />
          </div>
          <Button variant="primary" onclick={saveApiKey}>Save</Button>
          {#if settingsStore.hasValidApiKey}
            <Button variant="ghost" onclick={removeApiKey}>Remove</Button>
          {/if}
          <Button variant="ghost" onclick={() => showApiKeyInput = false}>Cancel</Button>
        </div>
        <p class="mt-2 text-xs text-gray-400">
          Add your Gemini API key for unlimited checks. Get one free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="text-accent hover:underline">Google AI Studio</a>.
          Your key stays in your browser — never sent to our servers.
        </p>
      </div>
    {/if}

    <!-- Help Panel -->
    {#if showHelp}
      <div class="py-5 border-t border-gray-100 animate-slide-up">
        <div class="max-w-4xl">
          <h3 class="font-display text-lg text-gray-900 mb-3">How it works</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Policy Analysis</h4>
              <p class="text-gray-500 text-xs leading-relaxed">Upload an image and optional text — AI analyzes it against social media advertising policies and highlights violations with bounding boxes.</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Community Mode</h4>
              <p class="text-gray-500 text-xs leading-relaxed">{settingsStore.checksLimit} free checks per day, no API key needed. Analysis runs through our server.</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Own Key Mode</h4>
              <p class="text-gray-500 text-xs leading-relaxed">Add your Gemini API key for unlimited checks plus fix generation and image editing. Key stays in your browser.</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Fix Generation</h4>
              <p class="text-gray-500 text-xs leading-relaxed">With your own key, AI generates fixed versions of flagged images and provides editing instructions.</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
            <a href="https://wavedepth.com" target="_blank" rel="noopener" class="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
              <span>A wavedepth project</span>
              <img src="/wavedepth-logo.png" alt="wavedepth" class="h-3.5 w-auto" />
            </a>
            <span class="text-gray-300">|</span>
            <a href="https://github.com/nerveband/content-checkmate" target="_blank" rel="noopener" class="hover:text-gray-600 transition-colors flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</header>
