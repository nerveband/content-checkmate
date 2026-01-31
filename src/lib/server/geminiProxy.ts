import { GoogleGenAI, type Part } from '@google/genai';
import { env } from '$env/dynamic/private';
import { ANALYSIS_MODEL, AI_DETECTION_MODEL, generatePrompt, processBoundingBox } from '$lib/shared/prompts';
import { POLICY_GUIDE } from '$lib/data/policies';
import type { AnalysisResult, AIDetectionResult } from '$lib/types';

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
