import type { AnalysisResult, ActiveTab } from '$lib/types';

function createAnalysisStore() {
  let activeTab = $state<ActiveTab>('mediaAndText');
  let isAnalyzing = $state(false);
  let analysisResult = $state<AnalysisResult | null>(null);
  let error = $state<string | null>(null);

  // Media state
  let uploadedFile = $state<File | null>(null);
  let uploadedFilePreview = $state<string | null>(null);
  let uploadedFileBase64 = $state<string | null>(null);
  let uploadedFileMimeType = $state<string | null>(null);
  let isVideo = $state(false);

  // Text inputs
  let description = $state('');
  let ctaText = $state('');
  let postIntent = $state('');

  // Exclusions
  let selectedExclusionTags = $state<string[]>([]);
  let customExclusions = $state('');
  let isSiepNotApplicable = $state(false);

  return {
    // Tab management
    get activeTab() {
      return activeTab;
    },
    set activeTab(value: ActiveTab) {
      activeTab = value;
    },

    // Analysis state
    get isAnalyzing() {
      return isAnalyzing;
    },
    set isAnalyzing(value: boolean) {
      isAnalyzing = value;
    },
    get analysisResult() {
      return analysisResult;
    },
    set analysisResult(value: AnalysisResult | null) {
      analysisResult = value;
    },
    get error() {
      return error;
    },
    set error(value: string | null) {
      error = value;
    },

    // File state
    get uploadedFile() {
      return uploadedFile;
    },
    get uploadedFilePreview() {
      return uploadedFilePreview;
    },
    get uploadedFileBase64() {
      return uploadedFileBase64;
    },
    get uploadedFileMimeType() {
      return uploadedFileMimeType;
    },
    get isVideo() {
      return isVideo;
    },

    // Text inputs
    get description() {
      return description;
    },
    set description(value: string) {
      description = value;
    },
    get ctaText() {
      return ctaText;
    },
    set ctaText(value: string) {
      ctaText = value;
    },
    get postIntent() {
      return postIntent;
    },
    set postIntent(value: string) {
      postIntent = value;
    },

    // Exclusions
    get selectedExclusionTags() {
      return selectedExclusionTags;
    },
    set selectedExclusionTags(value: string[]) {
      selectedExclusionTags = value;
    },
    get customExclusions() {
      return customExclusions;
    },
    set customExclusions(value: string) {
      customExclusions = value;
    },
    get isSiepNotApplicable() {
      return isSiepNotApplicable;
    },
    set isSiepNotApplicable(value: boolean) {
      isSiepNotApplicable = value;
    },

    // Methods
    setFile(file: File | null) {
      uploadedFile = file;
      if (file) {
        isVideo = file.type.startsWith('video/');
        uploadedFileMimeType = file.type;

        // Create preview URL
        uploadedFilePreview = URL.createObjectURL(file);

        // Read as base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          // Remove data URL prefix to get pure base64
          uploadedFileBase64 = result.split(',')[1];
        };
        reader.readAsDataURL(file);
      } else {
        if (uploadedFilePreview) {
          URL.revokeObjectURL(uploadedFilePreview);
        }
        uploadedFilePreview = null;
        uploadedFileBase64 = null;
        uploadedFileMimeType = null;
        isVideo = false;
      }
    },

    clearFile() {
      this.setFile(null);
    },

    reset() {
      this.clearFile();
      description = '';
      ctaText = '';
      postIntent = '';
      selectedExclusionTags = [];
      customExclusions = '';
      isSiepNotApplicable = false;
      analysisResult = null;
      error = null;
      isAnalyzing = false;
    },

    toggleExclusionTag(tagId: string) {
      const index = selectedExclusionTags.indexOf(tagId);
      if (index === -1) {
        selectedExclusionTags = [...selectedExclusionTags, tagId];
      } else {
        selectedExclusionTags = selectedExclusionTags.filter((t) => t !== tagId);
      }
    }
  };
}

export const analysisStore = createAnalysisStore();
