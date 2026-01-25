import { browser } from '$app/environment';
import type { AnalysisTableItem, GeneratedFixImage } from '$lib/types';

const HISTORY_KEY = 'content-checkmate-fix-history';

function createFixGenerationStore() {
  // Individual $state variables
  let isModalOpen = $state(false);
  let targetIssue = $state<AnalysisTableItem | null>(null);
  let isComprehensiveFix = $state(false);
  let generatedFixPrompt = $state('');
  let generatedImage = $state<string | null>(null);
  let isGenerating = $state(false);
  let isGeneratingPrompt = $state(false);
  let error = $state<string | null>(null);
  let fixHistory = $state<GeneratedFixImage[]>([]);

  // Load history from localStorage
  if (browser) {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        fixHistory = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse fix history:', e);
      }
    }
  }

  function saveHistory() {
    if (browser) {
      // Keep only last 20 items to prevent localStorage overflow
      const toSave = fixHistory.slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
    }
  }

  return {
    // Getters (read-only properties)
    get isModalOpen() {
      return isModalOpen;
    },
    get targetIssue() {
      return targetIssue;
    },
    get isComprehensiveFix() {
      return isComprehensiveFix;
    },
    get fixHistory() {
      return fixHistory;
    },

    // Getters + Setters (read-write properties)
    get generatedFixPrompt() {
      return generatedFixPrompt;
    },
    set generatedFixPrompt(value: string) {
      generatedFixPrompt = value;
    },

    get generatedImage() {
      return generatedImage;
    },
    set generatedImage(value: string | null) {
      generatedImage = value;
    },

    get isGenerating() {
      return isGenerating;
    },
    set isGenerating(value: boolean) {
      isGenerating = value;
    },

    get isGeneratingPrompt() {
      return isGeneratingPrompt;
    },
    set isGeneratingPrompt(value: boolean) {
      isGeneratingPrompt = value;
    },

    get error() {
      return error;
    },
    set error(value: string | null) {
      error = value;
    },

    // Methods
    openModal(issue: AnalysisTableItem | null, isComprehensive = false) {
      isModalOpen = true;
      targetIssue = issue;
      isComprehensiveFix = isComprehensive;
      generatedFixPrompt = '';
      generatedImage = null;
      error = null;
    },

    closeModal() {
      isModalOpen = false;
      targetIssue = null;
      isComprehensiveFix = false;
      generatedFixPrompt = '';
      generatedImage = null;
      error = null;
    },

    addToHistory(fix: GeneratedFixImage) {
      fixHistory = [fix, ...fixHistory];
      saveHistory();
    },

    removeFromHistory(id: string) {
      fixHistory = fixHistory.filter((f) => f.id !== id);
      saveHistory();
    },

    clearHistory() {
      fixHistory = [];
      saveHistory();
    },

    reset() {
      this.closeModal();
      isGenerating = false;
      isGeneratingPrompt = false;
    }
  };
}

export const fixGenerationStore = createFixGenerationStore();
