import type { GeneratedImage } from '$lib/types';
import { browser } from '$app/environment';

const HISTORY_KEY = 'content-checkmate-image-history';

function createEditorStore() {
  let uploadedFile = $state<File | null>(null);
  let uploadedFilePreview = $state<string | null>(null);
  let uploadedFileBase64 = $state<string | null>(null);
  let prompt = $state('');
  let isGenerating = $state(false);
  let generatedImage = $state<string | null>(null);
  let error = $state<string | null>(null);
  let history = $state<GeneratedImage[]>([]);

  // Load history from localStorage
  if (browser) {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse image history:', e);
      }
    }
  }

  function saveHistory() {
    if (browser) {
      // Keep only last 20 items to prevent localStorage overflow
      const toSave = history.slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
    }
  }

  return {
    get uploadedFile() {
      return uploadedFile;
    },
    get uploadedFilePreview() {
      return uploadedFilePreview;
    },
    get uploadedFileBase64() {
      return uploadedFileBase64;
    },
    get prompt() {
      return prompt;
    },
    set prompt(value: string) {
      prompt = value;
    },
    get isGenerating() {
      return isGenerating;
    },
    set isGenerating(value: boolean) {
      isGenerating = value;
    },
    get generatedImage() {
      return generatedImage;
    },
    set generatedImage(value: string | null) {
      generatedImage = value;
    },
    get error() {
      return error;
    },
    set error(value: string | null) {
      error = value;
    },
    get history() {
      return history;
    },

    setFile(file: File | null) {
      uploadedFile = file;
      if (file) {
        uploadedFilePreview = URL.createObjectURL(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          uploadedFileBase64 = result.split(',')[1];
        };
        reader.readAsDataURL(file);
      } else {
        if (uploadedFilePreview) {
          URL.revokeObjectURL(uploadedFilePreview);
        }
        uploadedFilePreview = null;
        uploadedFileBase64 = null;
      }
    },

    clearFile() {
      this.setFile(null);
    },

    addToHistory(image: GeneratedImage) {
      history = [image, ...history];
      saveHistory();
    },

    removeFromHistory(id: string) {
      history = history.filter((img) => img.id !== id);
      saveHistory();
    },

    clearHistory() {
      history = [];
      saveHistory();
    },

    reset() {
      this.clearFile();
      prompt = '';
      generatedImage = null;
      error = null;
      isGenerating = false;
    }
  };
}

export const editorStore = createEditorStore();
