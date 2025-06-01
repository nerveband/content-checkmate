import { GoogleGenAI } from '@google/genai';
import type { AnalysisTableItem } from '../types';

export async function generateFixPrompt(
  genAIClient: GoogleGenAI,
  issue: AnalysisTableItem
): Promise<string> {
  if (!genAIClient) {
    throw new Error('AI client not initialized');
  }

  const prompt = `You are an expert at converting content policy violation descriptions into clear, actionable image editing instructions for FLUX.1 Kontext, an AI image editing model.

Given the following content policy violation, generate a concise and specific editing instruction that would resolve the issue:

**Identified Content:** ${issue.identifiedContent}
**Issue Description:** ${issue.issueDescription}
**Recommendation:** ${issue.recommendation}
**Source:** ${issue.sourceContext}
${issue.boundingBox ? `**Location:** ${describeLocation(issue.boundingBox)}` : ''}

Guidelines for your response:
1. Be specific and actionable
2. Focus on what needs to be changed, removed, or modified
3. If a location is provided, include it in natural language
4. Keep the instruction under 200 characters when possible
5. Use imperative language (e.g., "Remove", "Replace", "Change")
6. Consider the context and provide realistic alternatives

Output only the editing instruction, nothing else.

Examples:
- "Remove the swastika symbol from the center of the image and replace it with a neutral geometric pattern"
- "Cover the inappropriate text in the top-right corner with a solid color or pattern"
- "Replace the violent imagery with peaceful nature scenery"
- "Remove the branded logo from the bottom-left and fill with background texture"

Your editing instruction:`;

  try {
    const response = await genAIClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.1,
        topP: 0.8,
        topK: 30,
      }
    });
    
    const fixPrompt = response.text.trim();
    
    if (!fixPrompt) {
      throw new Error('No fix prompt generated');
    }

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

  const prompt = `You are an expert at converting multiple content policy violations into a single, coherent image editing instruction for FLUX.1 Kontext.

Given these multiple violations found in one image, create a single comprehensive editing instruction that addresses all issues:

${issuesText}

Guidelines:
1. Combine all fixes into one logical instruction
2. Prioritize the most critical violations first
3. Be specific about locations when provided
4. Keep the instruction clear and actionable
5. Ensure the result would be a clean, policy-compliant image
6. Use connecting words like "and", "while", "also" to flow naturally

Output only the comprehensive editing instruction, nothing else.

Example: "Remove the offensive symbol from the center of the image and replace with a neutral pattern, while also covering the inappropriate text in the top-right corner with a solid color overlay"

Your comprehensive editing instruction:`;

  try {
    const response = await genAIClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.1,
        topP: 0.8,
        topK: 30,
      }
    });
    
    const fixPrompt = response.text.trim();
    
    if (!fixPrompt) {
      throw new Error('No comprehensive fix prompt generated');
    }

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