import { GoogleGenAI, type Part } from '@google/genai';
import type { AnalysisResult, AnalysisTableItem, ExcludedItem } from '$lib/types';
import { POLICY_GUIDE } from '$lib/data/policies';
import { detectAIGeneration } from './aiDetection';
import { describeLocation } from '$lib/utils/boundingBox';

// Model constants
export const ANALYSIS_MODEL = 'gemini-3-flash-preview';
export const IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';

let genAIClient: GoogleGenAI | null = null;

export function initializeClient(apiKey: string): GoogleGenAI {
  genAIClient = new GoogleGenAI({ apiKey });
  return genAIClient;
}

export function getClient(): GoogleGenAI | null {
  return genAIClient;
}

function generatePrompt(
  isVideo: boolean,
  hasDescription: boolean,
  hasCta: boolean,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string,
  isSiepNotApplicable?: boolean
): string {
  let mediaSection = '';
  if (isVideo) {
    mediaSection = '1. Media: A video file. The entire video content will be analyzed including BOTH video and audio components.';
  } else if (hasDescription || hasCta) {
    mediaSection = '1. Media: An image file.';
  } else {
    mediaSection = '1. Media: An image file.';
  }

  let textCounter = 2;
  const descriptionSection = hasDescription ? `${textCounter++}. User-Provided Text: An accompanying description.` : '';
  const ctaSection = hasCta ? `${textCounter++}. User-Provided Call to Action (CTA): A call to action text.` : '';
  const postIntentSection = postIntent?.trim() ? `${textCounter++}. Post Intent/Goal: The intended purpose or goal of this content.` : '';

  const providedMaterials = [mediaSection, descriptionSection, ctaSection, postIntentSection].filter(Boolean).join('\n');

  let exclusionRulesSection = '';
  if (selectedExclusionTags && selectedExclusionTags.length > 0) {
    exclusionRulesSection += `- Predefined Tags to Exclude: ${selectedExclusionTags.join(', ')}\n`;
  }
  if (customExclusions && customExclusions.trim().length > 0) {
    exclusionRulesSection += `- Custom Exclusions:\n${customExclusions.trim()}\n`;
  }

  const siepPromptPart = isSiepNotApplicable
    ? `
**SIEP Content Handling:**
The user has indicated that SIEP content is not applicable. Categorize SIEP content in "excludedItemsTable" with matchedRule: "SIEP - Not Applicable".
`
    : '';

  const exclusionPromptPart =
    exclusionRulesSection.length > 0
      ? `
**Exclusion Rules:**
${exclusionRulesSection}
Items matching exclusion rules go ONLY in "excludedItemsTable", NOT in "issuesTable".
`
      : `
**Exclusion Rules:** None provided. "excludedItemsTable" MUST be an empty array.
`;

  return `
You are an expert content policy analyst specializing in social media advertising guidelines.
Analyze the provided materials against the Social Media Content Policy Detection Guide.
Use **simple, clear, direct language**. **Bold problematic keywords**.

**Provided Materials:**
${providedMaterials}

**Social Media Content Policy Detection Guide:**
---
${POLICY_GUIDE}
---

${siepPromptPart}

${exclusionPromptPart}

**Analysis Request:**

1. Provide "overallAssessment" (1-2 concise sentences).
2. Assign "overallSeverity": 'Compliant' | 'Low Risk' | 'Medium Risk' | 'High Risk'.
3. Provide "recommendationsFeedback" (succinct, actionable).
4. Generate "issuesTable" array with objects containing:
   - "id": string (unique identifier like "issue-1", "issue-2", etc.)
   - "sourceContext": 'primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText'
   - "identifiedContent": string
   - "issueDescription": string (brief)
   - "recommendation": string (actionable)
   - "severity": 'High' | 'Medium' | 'Low'
   - "boundingBox": For image/video issues, provide the bounding box coordinates. Use NORMALIZED coordinates where (0,0) is top-left and (1,1) is bottom-right. Format: { "x_min": 0.0-1.0, "y_min": 0.0-1.0, "x_max": 0.0-1.0, "y_max": 0.0-1.0 }. Set to null for text-only issues.
   - "timestamp": number | null (for video, in seconds)
   - "captionText": string | null

**CRITICAL - Bounding Box Instructions:**
For ANY policy violation visible in the image, you MUST provide accurate bounding box coordinates that visually locate the problematic content. This includes:
- Visual elements (people, products, objects, symbols, gestures)
- Text visible IN the image (overlays, captions, watermarks, logos, headlines, body copy)
- Any graphical elements that violate policy

Use your spatial understanding to identify exactly where in the image each violation appears. The coordinates must be normalized (0-1 scale) where (0,0) is top-left and (1,1) is bottom-right.

ALWAYS provide bounding boxes for anything visible in the image. Only set boundingBox to null for issues found in the user-provided description/CTA text fields (not visible in the image itself).

5. Generate "excludedItemsTable" for content matching exclusion rules.
6. Generate "summaryForCopy" - plain language summary for designers.
7. Generate "suggestedFixes" - specific actionable suggestions.

**Output Format:** Return valid JSON only. No markdown code fences.

{
  "overallAssessment": "string",
  "overallSeverity": "string",
  "recommendationsFeedback": "string",
  "issuesTable": [...],
  "excludedItemsTable": [...],
  "summaryForCopy": "string",
  "suggestedFixes": "string"
}
`;
}

function isValidBoundingBox(box: unknown): box is { x_min: number; y_min: number; x_max: number; y_max: number } {
  if (typeof box !== 'object' || box === null) return false;
  const b = box as Record<string, unknown>;
  const keys = ['x_min', 'y_min', 'x_max', 'y_max'];
  for (const key of keys) {
    if (typeof b[key] !== 'number' || (b[key] as number) < 0 || (b[key] as number) > 1) return false;
  }
  return (b.x_min as number) < (b.x_max as number) && (b.y_min as number) < (b.y_max as number);
}

function processBoundingBox(item: Record<string, unknown>): AnalysisTableItem['boundingBox'] {
  if (!('boundingBox' in item)) return undefined;
  const boxField = item.boundingBox;
  if (boxField === null) return null;
  if (isValidBoundingBox(boxField)) return boxField;
  if (Array.isArray(boxField)) {
    for (const box of boxField) {
      if (isValidBoundingBox(box)) return box;
    }
  }
  return null;
}

export async function analyzeContent(
  base64MediaData: string | null,
  mimeType: string | null,
  userDescription?: string,
  userCta?: string,
  isVideo: boolean = false,
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
    isVideo,
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
    // Determine if we should run AI detection (only for images, not videos or text-only)
    const shouldRunAIDetection = hasMedia && mimeType && !isVideo && mimeType.startsWith('image/');

    // Run policy analysis and AI detection in parallel (if applicable)
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
      // Only run AI detection for images (not videos or text-only)
      shouldRunAIDetection && base64MediaData
        ? detectAIGeneration(base64MediaData, mimeType).catch(err => {
            console.warn('AI detection failed, continuing with policy analysis:', err);
            return null; // Don't fail entire analysis if AI detection fails
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

    // Add AI detection result if available
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

/**
 * Generates an image using Gemini's image generation model
 * Uses gemini-3-pro-image-preview for high-quality image generation
 *
 * @param base64Image - Base64 image data (with or without data URL prefix) for image-to-image editing
 * @param prompt - Text prompt describing the desired image or edit instructions
 * @param mimeType - MIME type of the source image (e.g., 'image/png', 'image/jpeg')
 * @returns Promise resolving to base64 data URL of the generated image
 */
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

    // Add source image (for image editing/image-to-image generation)
    if (base64Image && base64Image.trim().length > 0) {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      let base64Data = base64Image;
      if (base64Image.includes(',')) {
        base64Data = base64Image.split(',')[1];
      }

      // Validate base64 data
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

    // Generate image using Gemini's image generation model
    const response = await genAIClient.models.generateContent({
      model: IMAGE_GEN_MODEL, // gemini-3-pro-image-preview
      contents: { parts },
      config: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
        responseModalities: ['IMAGE'] // Specify we want image output
      }
    });

    // Extract the generated image from the response
    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('Invalid response structure from image generation API');
    }

    // Find the image part in the response
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

    // Provide user-friendly error messages
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

    // Re-throw with context if it's already a formatted error
    if (err.message?.includes('Gemini API') ||
        err.message?.includes('Invalid') ||
        err.message?.includes('required')) {
      throw err;
    }

    // Generic error fallback
    throw new Error(`Failed to generate image: ${err.message || 'Unknown error'}`);
  }
}
