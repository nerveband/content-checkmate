
export interface AnalysisTableItem {
  id: string; // Unique identifier for the issue
  identifiedContent: string;
  issueDescription: string;
  recommendation: string;
  severity?: 'High' | 'Medium' | 'Low' | string;
  sourceContext?: 'primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText'; // Origin of the content
  boundingBox?: { // Normalized coordinates (0-1)
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  } | null;
  imageSnippet?: string; // Base64 data URL of the cropped image snippet
}

export interface ExcludedItem {
  id: string;
  sourceContext?: 'primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText';
  identifiedContent: string;
  matchedRule: string; // e.g., "Predefined: Religious Holidays" or "Custom: Company Anniversary"
  aiNote: string; // AI's reasoning for why it matched the exclusion
  boundingBox?: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  } | null;
  imageSnippet?: string;
}

export interface AnalysisResult {
  overallAssessment: string;
  recommendationsFeedback: string;
  issuesTable: AnalysisTableItem[];
  overallSeverity?: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Compliant' | string;
  excludedItemsTable?: ExcludedItem[];
}

export type FileType = 'image' | 'video';

export interface PredefinedExclusionTag {
  id: string;
  label: string;
}

// FLUX Image Generation Types
export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  originalImageId?: string;
  timestamp: number;
  modelUsed: FluxModelName;
}

export interface GeneratedFixImage {
  id: string;
  generatedPrompt: string;
  imageUrl: string;
  originalAnalysisIssueId?: string;
  timestamp: number;
  modelUsed: FluxModelName;
}

export type FluxModelName = 'flux-kontext-pro' | 'flux-kontext-max';

export type ActiveTab = 'mediaAndText' | 'textOnly' | 'policyGuide' | 'imageEditor';