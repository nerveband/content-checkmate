import type { AnalysisTableItem } from '$lib/types';

// Model constants
export const ANALYSIS_MODEL = 'gemini-3-flash-preview';
export const IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';
export const AI_DETECTION_MODEL = 'gemini-2.0-flash-exp';

export function generatePrompt(
  policyGuide: string,
  hasDescription: boolean,
  hasCta: boolean,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string,
  isSiepNotApplicable?: boolean
): string {
  const mediaSection = '1. Media: An image file.';

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
${policyGuide}
---

${siepPromptPart}

${exclusionPromptPart}

**Analysis Request:**

1. Provide "overallAssessment" (1-2 concise sentences).
2. Assign "overallSeverity": 'Compliant' | 'Low Risk' | 'Medium Risk' | 'High Risk'.
3. Provide "recommendationsFeedback" (succinct, actionable).
4. Generate "issuesTable" array with objects containing:
   - "id": string (unique identifier like "issue-1", "issue-2", etc.)
   - "sourceContext": 'primaryImage' | 'descriptionText' | 'ctaText'
   - "identifiedContent": string
   - "issueDescription": string (brief)
   - "recommendation": string (actionable)
   - "severity": 'High' | 'Medium' | 'Low'
   - "boundingBox": For image issues, provide the bounding box coordinates. Use NORMALIZED coordinates where (0,0) is top-left and (1,1) is bottom-right. Format: { "x_min": 0.0-1.0, "y_min": 0.0-1.0, "x_max": 0.0-1.0, "y_max": 0.0-1.0 }. Set to null for text-only issues.
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

export function isValidBoundingBox(box: unknown): box is { x_min: number; y_min: number; x_max: number; y_max: number } {
  if (typeof box !== 'object' || box === null) return false;
  const b = box as Record<string, unknown>;
  const keys = ['x_min', 'y_min', 'x_max', 'y_max'];
  for (const key of keys) {
    if (typeof b[key] !== 'number' || (b[key] as number) < 0 || (b[key] as number) > 1) return false;
  }
  return (b.x_min as number) < (b.x_max as number) && (b.y_min as number) < (b.y_max as number);
}

export function processBoundingBox(item: Record<string, unknown>): AnalysisTableItem['boundingBox'] {
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
