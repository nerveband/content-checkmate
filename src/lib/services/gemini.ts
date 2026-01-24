import { GoogleGenAI, type Part } from '@google/genai';
import type { AnalysisResult, AnalysisTableItem, ExcludedItem } from '$lib/types';
import { POLICY_GUIDE } from '$lib/data/policies';

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
You are an expert content policy analyst specializing in Meta's advertising guidelines.
Analyze the provided materials against the Meta Content Policy Detection Guide.
Use **simple, clear, direct language**. **Bold problematic keywords**.

**Provided Materials:**
${providedMaterials}

**Meta Content Policy Detection Guide:**
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
   - "id": string
   - "sourceContext": 'primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText'
   - "identifiedContent": string
   - "issueDescription": string (brief)
   - "recommendation": string (actionable)
   - "severity": 'High' | 'Medium' | 'Low'
   - "boundingBox": { x_min, y_min, x_max, y_max } | null
   - "timestamp": number | null (for video)
   - "captionText": string | null
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
    const response = await genAIClient.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        topP: 0.8,
        topK: 30
      }
    });

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

    return {
      ...rawData,
      issuesTable: processedIssues,
      excludedItemsTable: processedExcluded
    };
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

  return response.text.trim();
}

export async function generateImage(prompt: string, sourceImageBase64?: string): Promise<string> {
  if (!genAIClient) {
    throw new Error('Gemini API client not initialized');
  }

  const parts: Part[] = [{ text: prompt }];

  if (sourceImageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: sourceImageBase64
      }
    });
  }

  const response = await genAIClient.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      temperature: 0.7
    }
  });

  // The response should contain an image - extract it
  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if ('inlineData' in part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error('No image generated in response');
}

function describeLocation(boundingBox: { x_min: number; y_min: number; x_max: number; y_max: number }): string {
  const centerX = (boundingBox.x_min + boundingBox.x_max) / 2;
  const centerY = (boundingBox.y_min + boundingBox.y_max) / 2;

  let vertical = '';
  let horizontal = '';

  if (centerY < 0.33) vertical = 'top';
  else if (centerY > 0.67) vertical = 'bottom';
  else vertical = 'center';

  if (centerX < 0.33) horizontal = 'left';
  else if (centerX > 0.67) horizontal = 'right';
  else horizontal = 'center';

  if (vertical === 'center' && horizontal === 'center') {
    return 'center of the image';
  } else if (vertical === 'center') {
    return `${horizontal} side of the image`;
  } else if (horizontal === 'center') {
    return `${vertical} of the image`;
  }
  return `${vertical}-${horizontal} corner of the image`;
}
