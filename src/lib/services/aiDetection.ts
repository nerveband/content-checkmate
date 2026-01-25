import { getClient } from './gemini';
import type { AIDetectionResult } from '$lib/types';

/**
 * Detects if an image appears to be AI-generated
 * Uses gemini-2.0-flash-exp for fast, cost-effective detection
 *
 * @param base64Image - Base64 encoded image data (with or without data URL prefix)
 * @param mimeType - MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @returns Promise<AIDetectionResult> - Detection result with confidence and reasoning
 * @throws Error if Gemini client not initialized or detection fails
 */
export async function detectAIGeneration(
  base64Image: string,
  mimeType: string
): Promise<AIDetectionResult> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini client not initialized. Please provide an API key.');
  }

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
    // Strip data URL prefix if present
    const cleanBase64 = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
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

    if (!response.text) {
      throw new Error('Empty response from Gemini API');
    }

    const text = response.text.trim();

    // Try to parse as JSON directly
    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      // If direct parse fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/(\{[\s\S]*\})/);

      if (!jsonMatch) {
        throw new Error('Failed to parse AI detection response: No valid JSON found');
      }

      parsedResult = JSON.parse(jsonMatch[1]);
    }

    // Validate response structure
    const result = parsedResult as Record<string, unknown>;

    if (typeof result.isAIGenerated !== 'boolean') {
      throw new Error('Invalid AI detection response: isAIGenerated must be boolean');
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) {
      throw new Error('Invalid AI detection response: confidence must be number between 0-100');
    }

    if (typeof result.reasoning !== 'string' || result.reasoning.trim().length === 0) {
      throw new Error('Invalid AI detection response: reasoning must be non-empty string');
    }

    return {
      isAIGenerated: result.isAIGenerated,
      confidence: Math.round(result.confidence), // Ensure integer
      reasoning: result.reasoning
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('AI detection error:', err);

    // Handle specific error types
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key.');
    }
    if (err.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    if (err.message?.includes('payload size exceeds')) {
      throw new Error('Image too large for AI detection. Please use a smaller file.');
    }

    // Re-throw validation errors as-is
    if (err.message?.includes('Invalid AI detection response')) {
      throw err;
    }

    throw new Error(`Failed to detect AI generation: ${err.message || 'Unknown error'}`);
  }
}
