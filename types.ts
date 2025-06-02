
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
  timestamp?: number; // For video content: timestamp in seconds where issue occurs
  captionText?: string; // For video content: on-screen text/captions at this timestamp
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
  timestamp?: number; // For video content: timestamp in seconds where exclusion occurs
  captionText?: string; // For video content: on-screen text/captions at this timestamp
}

export interface AnalysisResult {
  overallAssessment: string;
  recommendationsFeedback: string;
  issuesTable: AnalysisTableItem[];
  overallSeverity?: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Compliant' | string;
  excludedItemsTable?: ExcludedItem[];
  summaryForCopy?: string; // Plain language summary for copying to designers/developers
  suggestedFixes?: string; // AI-generated actionable suggestions for compliance while respecting intent
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