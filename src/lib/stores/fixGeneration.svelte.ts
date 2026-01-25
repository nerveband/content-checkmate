import type { AnalysisTableItem, GeneratedFixImage } from '$lib/types';

interface FixGenerationStore {
  isModalOpen: boolean;
  targetIssue: AnalysisTableItem | null;
  isComprehensiveFix: boolean;
  generatedFixPrompt: string;
  generatedImage: string | null;
  isGenerating: boolean;
  isGeneratingPrompt: boolean;
  error: string | null;
  fixHistory: GeneratedFixImage[];
}

export const fixGenerationStore = $state<FixGenerationStore>({
  isModalOpen: false,
  targetIssue: null,
  isComprehensiveFix: false,
  generatedFixPrompt: '',
  generatedImage: null,
  isGenerating: false,
  isGeneratingPrompt: false,
  error: null,
  fixHistory: []
});

// Actions
export function openFixModal(issue: AnalysisTableItem | null, isComprehensive: boolean = false) {
  fixGenerationStore.isModalOpen = true;
  fixGenerationStore.targetIssue = issue;
  fixGenerationStore.isComprehensiveFix = isComprehensive;
  fixGenerationStore.generatedFixPrompt = '';
  fixGenerationStore.generatedImage = null;
  fixGenerationStore.error = null;
}

export function closeFixModal() {
  fixGenerationStore.isModalOpen = false;
  fixGenerationStore.targetIssue = null;
  fixGenerationStore.isComprehensiveFix = false;
  fixGenerationStore.error = null;
}

export function addToHistory(fix: GeneratedFixImage) {
  fixGenerationStore.fixHistory = [fix, ...fixGenerationStore.fixHistory];
}

export function clearHistory() {
  fixGenerationStore.fixHistory = [];
}

export function setGeneratedPrompt(prompt: string) {
  fixGenerationStore.generatedFixPrompt = prompt;
}

export function setGeneratedImage(imageUrl: string | null) {
  fixGenerationStore.generatedImage = imageUrl;
}

export function setIsGenerating(value: boolean) {
  fixGenerationStore.isGenerating = value;
}

export function setIsGeneratingPrompt(value: boolean) {
  fixGenerationStore.isGeneratingPrompt = value;
}

export function setError(error: string | null) {
  fixGenerationStore.error = error;
}
