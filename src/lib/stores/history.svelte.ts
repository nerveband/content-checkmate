import type { AnalysisHistoryEntry, GenerationHistoryEntry } from '$lib/types';
import { browser } from '$app/environment';

const HISTORY_KEY = 'content-checkmate-global-history';
const MAX_HISTORY_ITEMS = 100;

interface GlobalHistory {
  analyses: AnalysisHistoryEntry[];
  generations: GenerationHistoryEntry[];
}

function createHistoryStore() {
  let analyses = $state<AnalysisHistoryEntry[]>([]);
  let generations = $state<GenerationHistoryEntry[]>([]);

  // Load history from localStorage
  if (browser) {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed: GlobalHistory = JSON.parse(stored);
        analyses = parsed.analyses || [];
        generations = parsed.generations || [];
      } catch (e) {
        console.error('Failed to parse global history:', e);
      }
    }
  }

  function saveHistory() {
    if (browser) {
      // Keep only last MAX_HISTORY_ITEMS to prevent localStorage overflow
      const toSave: GlobalHistory = {
        analyses: analyses.slice(0, MAX_HISTORY_ITEMS),
        generations: generations.slice(0, MAX_HISTORY_ITEMS)
      };
      localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
    }
  }

  return {
    get analyses() {
      return analyses;
    },
    get generations() {
      return generations;
    },

    addAnalysis(entry: AnalysisHistoryEntry) {
      analyses = [entry, ...analyses];
      saveHistory();
    },

    addGeneration(entry: GenerationHistoryEntry) {
      generations = [entry, ...generations];
      saveHistory();
    },

    removeAnalysis(id: string) {
      analyses = analyses.filter((a) => a.id !== id);
      saveHistory();
    },

    removeGeneration(id: string) {
      generations = generations.filter((g) => g.id !== id);
      saveHistory();
    },

    clearAnalyses() {
      analyses = [];
      if (browser) {
        const toSave: GlobalHistory = { analyses: [], generations };
        localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
      }
    },

    clearGenerations() {
      generations = [];
      if (browser) {
        const toSave: GlobalHistory = { analyses, generations: [] };
        localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
      }
    },

    clearAll() {
      analyses = [];
      generations = [];
      if (browser) {
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  };
}

export const historyStore = createHistoryStore();
