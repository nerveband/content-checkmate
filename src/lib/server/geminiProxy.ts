import { GoogleGenAI, type Part } from '@google/genai';
import { env } from '$env/dynamic/private';
import { ANALYSIS_MODEL, AI_DETECTION_MODEL, IMAGE_GEN_MODEL, generatePrompt, processBoundingBox } from '$lib/shared/prompts';
import { POLICY_GUIDE } from '$lib/data/policies';
import type { AnalysisResult, AIDetectionResult, AnalysisTableItem } from '$lib/types';
import { describeLocation } from '$lib/utils/boundingBox';

let serverClient: GoogleGenAI | null = null;

function getServerClient(): GoogleGenAI {
  if (!serverClient) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    serverClient = new GoogleGenAI({ apiKey });
  }
  return serverClient;
}

async function detectAIGenerationServer(
  base64Image: string,
  mimeType: string
): Promise<AIDetectionResult | null> {
  const client = getServerClient();

  const prompt = `Analyze this image and determine if it appears to be AI-generated.

Consider these indicators:
- Unnatural textures, especially in skin, hair, or fabric
- Inconsistent lighting or shadows
- Anatomical impossibilities or distortions (extra fingers, merged limbs, etc.)
- Unnatural symmetry or patterns
- Telltale AI artifacts (blurring, warping, odd reflections)
- Text that is garbled or nonsensical
- Background inconsistencies or impossible perspectives
- Overly smooth or plastic-looking surfaces
- Uncanny valley effects in human faces

Respond in this exact JSON format:
{
  "isAIGenerated": true/false,
  "confidence": 0-100,
  "reasoning": "Brief explanation of key indicators"
}

Confidence scale:
- 0-30: Likely real/photographed
- 31-60: Uncertain, could be either
- 61-85: Likely AI-generated
- 86-100: Almost certainly AI-generated

Be specific about which indicators you observe.`;

  try {
    const cleanBase64 = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const response = await client.models.generateContent({
      model: AI_DETECTION_MODEL,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        topP: 0.8,
        topK: 20
      }
    });

    if (!response.text) return null;

    const text = response.text.trim();
    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) return null;
      parsedResult = JSON.parse(jsonMatch[1]);
    }

    const result = parsedResult as Record<string, unknown>;
    if (typeof result.isAIGenerated !== 'boolean') return null;
    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) return null;
    if (typeof result.reasoning !== 'string') return null;

    return {
      isAIGenerated: result.isAIGenerated,
      confidence: Math.round(result.confidence),
      reasoning: result.reasoning
    };
  } catch (err) {
    console.warn('Server AI detection failed:', err);
    return null;
  }
}

export interface ProxyAnalyzeParams {
  base64MediaData: string | null;
  mimeType: string | null;
  userDescription?: string;
  userCta?: string;
  selectedExclusionTags?: string[];
  customExclusions?: string;
  postIntent?: string;
  isSiepNotApplicable?: boolean;
}

export async function analyzeViaServer(params: ProxyAnalyzeParams): Promise<AnalysisResult> {
  const client = getServerClient();

  const {
    base64MediaData,
    mimeType,
    userDescription,
    userCta,
    selectedExclusionTags,
    customExclusions,
    postIntent,
    isSiepNotApplicable
  } = params;

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
        mimeType,
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

  const shouldRunAIDetection = hasMedia && mimeType && mimeType.startsWith('image/');

  const [response, aiDetectionResult] = await Promise.all([
    client.models.generateContent({
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
      ? detectAIGenerationServer(base64MediaData, mimeType!).catch(() => null)
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
}

export async function generateImageViaServer(
  base64Image: string,
  prompt: string,
  mimeType: string
): Promise<string> {
  const client = getServerClient();

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt is required for image generation');
  }

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
        mimeType,
        data: base64Data
      }
    });
  }

  const response = await client.models.generateContent({
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
}

export async function generateFixPromptViaServer(issue: AnalysisTableItem): Promise<string> {
  const client = getServerClient();

  const prompt = `You are an expert at converting content policy violations into strategic image editing instructions for Gemini image generation that maintain the original message while ensuring compliance.

Given the following content policy violation, generate a specific editing instruction that REPLACES problematic content with compliant alternatives that preserve the post's original intent and effectiveness:

**Identified Content:** ${issue.identifiedContent}
**Issue Description:** ${issue.issueDescription}
**Recommendation:** ${issue.recommendation}
**Source:** ${issue.sourceContext || 'Unknown'}
${issue.boundingBox ? `**Location:** ${describeLocation(issue.boundingBox)}` : ''}

Guidelines for your response:
1. Always suggest REPLACEMENT content, not just removal
2. Preserve the original message and marketing intent
3. Suggest visually appealing, brand-appropriate alternatives
4. Consider the target audience and content purpose
5. If location is provided, include it naturally in the instruction
6. Keep instruction under 200 characters when possible
7. Use constructive language ("Replace with", "Transform into", "Change to")

Your strategic editing instruction (plain text, no JSON):`;

  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: { parts: [{ text: prompt }] },
    config: {
      temperature: 0.2,
      topP: 0.8,
      topK: 30
    }
  });

  const result = response.text?.trim();
  if (!result) {
    throw new Error('No fix prompt generated');
  }

  return result;
}

export async function generateComprehensiveFixPromptViaServer(
  issues: AnalysisTableItem[]
): Promise<string> {
  const client = getServerClient();

  const issuesText = issues
    .map(
      (issue, index) =>
        `${index + 1}. **${issue.identifiedContent}**: ${issue.issueDescription} | Recommendation: ${issue.recommendation}${issue.boundingBox ? ` | Location: ${describeLocation(issue.boundingBox)}` : ''}`
    )
    .join('\n');

  const prompt = `You are an expert at converting multiple content policy violations into strategic, comprehensive image editing instructions for Gemini image generation that preserve the original message while ensuring full compliance.

Given these multiple violations found in one image, create a single comprehensive editing instruction that transforms ALL issues into compliant alternatives while maintaining visual impact and marketing effectiveness:

${issuesText}

Guidelines:
1. Suggest REPLACEMENT content for each violation, not just removal
2. Maintain the original message, brand identity, and audience appeal
3. Prioritize the most critical violations first
4. Combine all fixes into one logical, flowing instruction
5. Be specific about locations when provided
6. Suggest creative, engaging alternatives that serve the same purpose
7. Use connecting words like "and", "while", "also" to flow naturally
8. Focus on preserving visual impact and engagement

Your comprehensive strategic editing instruction (plain text, no JSON):`;

  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: { parts: [{ text: prompt }] },
    config: {
      temperature: 0.2,
      topP: 0.8,
      topK: 30
    }
  });

  const result = response.text?.trim();
  if (!result) {
    throw new Error('No comprehensive fix prompt generated');
  }

  return result;
}
