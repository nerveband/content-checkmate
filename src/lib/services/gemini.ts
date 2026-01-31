import { GoogleGenAI, type Part } from '@google/genai';
import type { AnalysisResult, AnalysisTableItem } from '$lib/types';
import { POLICY_GUIDE } from '$lib/data/policies';
import { detectAIGeneration } from './aiDetection';
import { describeLocation } from '$lib/utils/boundingBox';
import {
  ANALYSIS_MODEL,
  IMAGE_GEN_MODEL,
  generatePrompt,
  processBoundingBox
} from '$lib/shared/prompts';
import { settingsStore } from '$lib/stores/settings.svelte';

// Re-export model constants for consumers
export { ANALYSIS_MODEL, IMAGE_GEN_MODEL };

let genAIClient: GoogleGenAI | null = null;

export function initializeClient(apiKey: string): GoogleGenAI {
  genAIClient = new GoogleGenAI({ apiKey });
  return genAIClient;
}

export function getClient(): GoogleGenAI | null {
  return genAIClient;
}

/**
 * Analyze content via server proxy (community mode)
 */
async function analyzeViaProxy(
  base64MediaData: string | null,
  mimeType: string | null,
  userDescription?: string,
  userCta?: string,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string,
  isSiepNotApplicable?: boolean
): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64MediaData,
      mimeType,
      userDescription,
      userCta,
      selectedExclusionTags,
      customExclusions,
      postIntent,
      isSiepNotApplicable
    })
  });

  const data = await res.json();

  // Update usage from response
  if (data._usage) {
    settingsStore.remainingChecks = data._usage.remaining;
  }

  if (!res.ok) {
    throw new Error(data.error || 'Analysis failed');
  }

  // Strip _usage from the result
  const { _usage, ...result } = data;
  return result as AnalysisResult;
}

/**
 * Analyze content directly via Gemini API (own-key mode)
 */
async function analyzeDirect(
  base64MediaData: string | null,
  mimeType: string | null,
  userDescription?: string,
  userCta?: string,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string,
  isSiepNotApplicable?: boolean
): Promise<AnalysisResult> {
  if (!genAIClient) {
    throw new Error('Gemini API client not initialized. Please provide an API key.');
  }

  const hasMedia = base64MediaData && base64MediaData.length > 0;
  if (!hasMedia && !userDescription && !userCta) {
    throw new Error('No media or text provided for analysis.');
  }

  const promptContent = generatePrompt(
    POLICY_GUIDE,
    !!userDescription,
    !!userCta,
    selectedExclusionTags,
    customExclusions,
    postIntent,
    isSiepNotApplicable
  );

  const parts: Part[] = [{ text: promptContent }];

  if (hasMedia && mimeType && base64MediaData) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64MediaData
      }
    });
  }

  if (userDescription) {
    parts.push({ text: `User-provided Description: ${userDescription}` });
  }
  if (userCta) {
    parts.push({ text: `User-provided Call to Action: ${userCta}` });
  }
  if (postIntent?.trim()) {
    parts.push({ text: `Post Intent/Goal: ${postIntent}` });
  }

  try {
    const shouldRunAIDetection = hasMedia && mimeType && mimeType.startsWith('image/');

    const [response, aiDetectionResult] = await Promise.all([
      genAIClient.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          topP: 0.8,
          topK: 30
        }
      }),
      shouldRunAIDetection && base64MediaData
        ? detectAIGeneration(base64MediaData, mimeType).catch(err => {
            console.warn('AI detection failed, continuing with policy analysis:', err);
            return null;
          })
        : Promise.resolve(null)
    ]);

    if (!response.text) {
      throw new Error('Empty response from Gemini API');
    }

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const rawData = JSON.parse(jsonStr);

    const processedIssues = (rawData.issuesTable || []).map((item: Record<string, unknown>) => ({
      ...item,
      boundingBox: processBoundingBox(item)
    }));

    const processedExcluded = (rawData.excludedItemsTable || []).map((item: Record<string, unknown>) => ({
      ...item,
      boundingBox: processBoundingBox(item)
    }));

    const result: AnalysisResult = {
      ...rawData,
      issuesTable: processedIssues,
      excludedItemsTable: processedExcluded
    };

    if (aiDetectionResult) {
      result.aiDetection = aiDetectionResult;
    }

    return result;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error calling Gemini API:', err);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key.');
    }
    if (err.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    if (err.message?.includes('payload size exceeds')) {
      throw new Error('File too large. Please use a smaller file.');
    }

    throw new Error(`Analysis failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Main entry point: routes to proxy or direct based on settings mode
 */
export async function analyzeContent(
  base64MediaData: string | null,
  mimeType: string | null,
  userDescription?: string,
  userCta?: string,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string,
  isSiepNotApplicable?: boolean
): Promise<AnalysisResult> {
  if (settingsStore.isCommunityMode) {
    return analyzeViaProxy(
      base64MediaData,
      mimeType,
      userDescription,
      userCta,
      selectedExclusionTags,
      customExclusions,
      postIntent,
      isSiepNotApplicable
    );
  }

  return analyzeDirect(
    base64MediaData,
    mimeType,
    userDescription,
    userCta,
    selectedExclusionTags,
    customExclusions,
    postIntent,
    isSiepNotApplicable
  );
}

export async function generateFixPrompt(issue: AnalysisTableItem): Promise<string> {
  if (!genAIClient) {
    throw new Error('Gemini API client not initialized');
  }

  const locationDesc = issue.boundingBox ? describeLocation(issue.boundingBox) : '';

  const prompt = `Generate a strategic image editing instruction for this content policy violation:

**Identified Content:** ${issue.identifiedContent}
**Issue:** ${issue.issueDescription}
**Recommendation:** ${issue.recommendation}
${locationDesc ? `**Location:** ${locationDesc}` : ''}

Create a specific editing instruction that REPLACES problematic content with compliant alternatives.
Keep instruction under 200 characters. Use constructive language ("Replace with", "Transform into").

Your editing instruction:`;

  const response = await genAIClient.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: { parts: [{ text: prompt }] },
    config: {
      temperature: 0.1,
      topP: 0.8
    }
  });

  if (!response.text) {
    throw new Error('Empty response from Gemini API');
  }

  return response.text.trim();
}

export async function generateImage(
  base64Image: string,
  prompt: string,
  mimeType: string
): Promise<string> {
  if (!genAIClient) {
    throw new Error('Gemini API client not initialized. Please provide an API key.');
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt is required for image generation');
  }

  try {
    const parts: Part[] = [{ text: prompt }];

    if (base64Image && base64Image.trim().length > 0) {
      let base64Data = base64Image;
      if (base64Image.includes(',')) {
        base64Data = base64Image.split(',')[1];
      }

      if (!base64Data || base64Data.length === 0) {
        throw new Error('Invalid source image data');
      }

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    const response = await genAIClient.models.generateContent({
      model: IMAGE_GEN_MODEL,
      contents: { parts },
      config: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
        responseModalities: ['IMAGE']
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('Invalid response structure from image generation API');
    }

    for (const part of candidate.content.parts) {
      if ('inlineData' in part && part.inlineData && part.inlineData.data) {
        const generatedMimeType = part.inlineData.mimeType || 'image/png';
        return `data:${generatedMimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('No image data found in response. The model may have returned only text.');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating image:', err);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key.');
    }
    if (err.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    if (err.message?.includes('payload size exceeds') || err.message?.includes('too large')) {
      throw new Error('Image too large. Please use a smaller image.');
    }
    if (err.message?.includes('safety')) {
      throw new Error('Image generation blocked due to safety settings. Please try a different prompt or image.');
    }

    if (err.message?.includes('Gemini API') ||
        err.message?.includes('Invalid') ||
        err.message?.includes('required')) {
      throw err;
    }

    throw new Error(`Failed to generate image: ${err.message || 'Unknown error'}`);
  }
}
