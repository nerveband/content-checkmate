import { browser } from '$app/environment';

const STORAGE_KEY = 'content-checkmate-settings';

// Check for environment variable API key
const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const HAS_ENV_API_KEY = ENV_API_KEY.length > 0;

interface Settings {
  apiKey: string;
  useCustomApiKey: boolean;
}

function loadInitialSettings(): Settings {
  const defaults: Settings = {
    apiKey: HAS_ENV_API_KEY ? ENV_API_KEY : '',
    useCustomApiKey: false
  };

  // If we have an env API key, use it and skip localStorage
  if (HAS_ENV_API_KEY) {
    return defaults;
  }

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
    },
    get isUsingEnvApiKey() {
      return HAS_ENV_API_KEY;
    }
  };
}

export const settingsStore = createSettingsStore();
