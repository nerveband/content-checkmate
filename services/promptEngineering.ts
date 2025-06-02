import { GoogleGenAI } from '@google/genai';
import type { AnalysisTableItem } from '../types';

async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 503 overloaded error
      const isOverloadedError = error.message?.includes('503') || 
                              error.message?.includes('overloaded') ||
                              error.message?.includes('UNAVAILABLE');
      
      if (isOverloadedError && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Model overloaded, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not a retryable error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}

export async function generateFixPrompt(
  genAIClient: GoogleGenAI,
  issue: AnalysisTableItem
): Promise<string> {
  if (!genAIClient) {
    throw new Error('AI client not initialized');
  }

  const prompt = `You are an expert at converting content policy violations into strategic image editing instructions for FLUX.1 Kontext that maintain the original message while ensuring compliance.

Given the following content policy violation, generate a specific editing instruction that REPLACES problematic content with compliant alternatives that preserve the post's original intent and effectiveness:

**Identified Content:** ${issue.identifiedContent}
**Issue Description:** ${issue.issueDescription}
**Recommendation:** ${issue.recommendation}
**Source:** ${issue.sourceContext}
${issue.boundingBox ? `**Location:** ${describeLocation(issue.boundingBox)}` : ''}

Guidelines for your response:
1. Always suggest REPLACEMENT content, not just removal
2. Preserve the original message and marketing intent
3. Suggest visually appealing, brand-appropriate alternatives
4. Consider the target audience and content purpose
5. If location is provided, include it naturally
6. Keep instruction under 200 characters when possible
7. Use constructive language ("Replace with", "Transform into", "Change to")

Focus on solutions that:
- Maintain visual impact and engagement
- Keep the core message intact
- Suggest specific, creative alternatives
- Consider brand consistency and aesthetic appeal

Examples:
- "Replace the graphic violence with dynamic action poses and energy effects to maintain excitement"
- "Transform the inappropriate text into bold, inspiring messaging that conveys the same energy"
- "Change the controversial symbol to a modern, abstract logo that represents the same values"
- "Replace the restricted content with vibrant lifestyle imagery that appeals to the same audience"

Your strategic editing instruction:`;

  try {
    const fixPrompt = await retryApiCall(async () => {
      const response = await genAIClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
          temperature: 0.1,
          topP: 0.8,
          topK: 30,
        }
      });
      
      const result = response.text.trim();
      if (!result) {
        throw new Error('No fix prompt generated');
      }
      return result;
    });

    return fixPrompt;
  } catch (error: any) {
    console.error('Error generating fix prompt:', error);
    throw new Error(`Failed to generate fix prompt: ${error.message}`);
  }
}

export async function generateComprehensiveFixPrompt(
  genAIClient: GoogleGenAI,
  issues: AnalysisTableItem[]
): Promise<string> {
  if (!genAIClient) {
    throw new Error('AI client not initialized');
  }

  const issuesText = issues.map((issue, index) => 
    `${index + 1}. **${issue.identifiedContent}**: ${issue.issueDescription} | Recommendation: ${issue.recommendation}${issue.boundingBox ? ` | Location: ${describeLocation(issue.boundingBox)}` : ''}`
  ).join('\n');

  const prompt = `You are an expert at converting multiple content policy violations into strategic, comprehensive image editing instructions for FLUX.1 Kontext that preserve the original message while ensuring full compliance.

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

Ensure the result would be:
- Policy-compliant across all violations
- Visually appealing and professionally crafted
- True to the original brand message and intent
- Engaging for the target audience

Example: "Transform the controversial symbol in the center into a modern geometric logo that represents the same brand values, while replacing the inappropriate text in the top-right with bold, inspiring messaging that conveys the same energy and appeal"

Your comprehensive strategic editing instruction:`;

  try {
    const fixPrompt = await retryApiCall(async () => {
      const response = await genAIClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
          temperature: 0.1,
          topP: 0.8,
          topK: 30,
        }
      });
      
      const result = response.text.trim();
      if (!result) {
        throw new Error('No comprehensive fix prompt generated');
      }
      return result;
    });

    return fixPrompt;
  } catch (error: any) {
    console.error('Error generating comprehensive fix prompt:', error);
    throw new Error(`Failed to generate comprehensive fix prompt: ${error.message}`);
  }
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
  } else {
    return `${vertical}-${horizontal} corner of the image`;
  }
}