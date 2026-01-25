export interface AnalysisTableItem {
  id: string;
  identifiedContent: string;
  issueDescription: string;
  recommendation: string;
  severity?: 'High' | 'Medium' | 'Low' | string;
  sourceContext?: 'primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText';
  boundingBox?: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  } | null;
  imageSnippet?: string;
  timestamp?: number;
  captionText?: string;
}

export interface ExcludedItem {
  id: string;
  sourceContext?: 'primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText';
  identifiedContent: string;
  matchedRule: string;
  aiNote: string;
  boundingBox?: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  } | null;
  imageSnippet?: string;
  timestamp?: number;
  captionText?: string;
}

export interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export interface AnalysisResult {
  overallAssessment: string;
  recommendationsFeedback: string;
  issuesTable: AnalysisTableItem[];
  overallSeverity?: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Compliant' | string;
  excludedItemsTable?: ExcludedItem[];
  summaryForCopy?: string;
  suggestedFixes?: string;
  aiDetection?: AIDetectionResult;
}

export type FileType = 'image' | 'video';

export interface PredefinedExclusionTag {
  id: string;
  label: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  originalImageId?: string;
  timestamp: number;
}

export interface GeneratedFixImage {
  id: string;
  generatedPrompt: string;
  imageUrl: string;
  originalAnalysisIssueId?: string;
  timestamp: number;
}

export type ActiveTab = 'mediaAndText' | 'textOnly' | 'policyGuide' | 'imageEditor';

export interface AppState {
  activeTab: ActiveTab;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;
}
