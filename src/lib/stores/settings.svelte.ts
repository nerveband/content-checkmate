import { browser } from '$app/environment';

const STORAGE_KEY = 'content-checkmate-settings';

interface Settings {
  apiKey: string;
  useCustomApiKey: boolean;
}

function loadInitialSettings(): Settings {
  const defaults: Settings = {
    apiKey: '',
    useCustomApiKey: false
  };

  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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
      save();
    },
    get useCustomApiKey() {
      return settings.useCustomApiKey;
    },
    set useCustomApiKey(value: boolean) {
      settings.useCustomApiKey = value;
      save();
    },
    get hasValidApiKey() {
      return settings.apiKey.length > 0;
    }
  };
}

export const settingsStore = createSettingsStore();
