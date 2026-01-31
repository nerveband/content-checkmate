import { browser } from '$app/environment';

const STORAGE_KEY = 'content-checkmate-settings';

type Mode = 'community' | 'own-key';

interface Settings {
  apiKey: string;
  mode: Mode;
}

function loadInitialSettings(): Settings {
  const defaults: Settings = {
    apiKey: '',
    mode: 'community'
  };

  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrate from old format: if they had an apiKey, they're in own-key mode
        if (parsed.apiKey && parsed.apiKey.length > 0) {
          return {
            apiKey: parsed.apiKey,
            mode: 'own-key'
          };
        }
        return { ...defaults, ...parsed };
      } catch (e) {
        console.error('Failed to parse stored settings:', e);
      }
    }
  }

  return defaults;
}

function createSettingsStore() {
  let settings = $state<Settings>(loadInitialSettings());
  let remainingChecks = $state<number>(5);
  let checksLimit = $state<number>(5);
  let usageFetched = $state(false);

  function save() {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }

  return {
    get apiKey() {
      return settings.apiKey;
    },
    set apiKey(value: string) {
      settings.apiKey = value;
      if (value.length > 0) {
        settings.mode = 'own-key';
      } else {
        settings.mode = 'community';
      }
      save();
    },

    get mode(): Mode {
      return settings.mode;
    },

    get hasValidApiKey() {
      return settings.mode === 'own-key' && settings.apiKey.length > 0;
    },

    get isCommunityMode() {
      return settings.mode === 'community';
    },

    get remainingChecks() {
      return remainingChecks;
    },
    set remainingChecks(value: number) {
      remainingChecks = value;
    },

    get checksLimit() {
      return checksLimit;
    },

    get usageFetched() {
      return usageFetched;
    },

    get canAnalyze() {
      if (settings.mode === 'own-key') return true;
      return remainingChecks > 0;
    },

    removeApiKey() {
      settings.apiKey = '';
      settings.mode = 'community';
      save();
    },

    async fetchUsage() {
      if (settings.mode === 'own-key') {
        usageFetched = true;
        return;
      }
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          remainingChecks = data.remaining;
          checksLimit = data.limit;
        }
      } catch (e) {
        console.error('Failed to fetch usage:', e);
      } finally {
        usageFetched = true;
      }
    }
  };
}

export const settingsStore = createSettingsStore();
