
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import type { AnalysisResult, AnalysisTableItem, ExcludedItem } from '../types';

// API_KEY related checks are now primarily handled in App.tsx
// The GoogleGenAI client instance will be passed into analyzeContent

const generatePrompt = (
    policyGuide: string, 
    isVideo: boolean, 
    hasDescription: boolean, 
    hasCta: boolean,
    selectedExclusionTags?: string[],
    customExclusions?: string,
    postIntent?: string
): string => {
  let mediaSection = "";
  if (isVideo) {
    mediaSection = "1.  Media: A video file. The entire video content will be analyzed with timestamp-based flagging for specific moments and on-screen text/captions.";
  } else if (hasDescription || hasCta) { 
     mediaSection = "1.  Media: An image file.";
  } else if (!isVideo && !hasDescription && !hasCta) { 
     mediaSection = "1.  Media: An image file.";
  }

  let textCounter = (isVideo || mediaSection.includes("image file")) ? 2 : 1;
  const descriptionSection = hasDescription ? `${textCounter++}. User-Provided Text: An accompanying description.` : "";
  const ctaSection = hasCta ? `${textCounter++}. User-Provided Call to Action (CTA): A call to action text.` : "";
  
  if (!isVideo && !mediaSection.includes("image file") && (hasDescription || hasCta)) {
      mediaSection = "1.  Media: No media provided. Analyze text only.";
      textCounter = 2;
  }

  const postIntentSection = postIntent?.trim() ? `${textCounter++}. Post Intent/Goal: The intended purpose or goal of this content.` : "";
  
  const providedMaterials = [
    mediaSection,
    descriptionSection,
    ctaSection,
    postIntentSection
  ].filter(Boolean).join("\\n");

  let exclusionRulesSection = "";
  if (selectedExclusionTags && selectedExclusionTags.length > 0) {
    exclusionRulesSection += `- Predefined Tags to Exclude: ${selectedExclusionTags.join(', ')}\n`;
  }
  if (customExclusions && customExclusions.trim().length > 0) {
    exclusionRulesSection += `- Custom Exclusions (one per line, treat each line as a separate rule/keyword):\n${customExclusions.trim()}\n`;
  }

  const exclusionPromptPart = exclusionRulesSection.length > 0 ? `
**Exclusion Rules for Separate Categorization:**
If any content matches the following rules, categorize it separately in an "excludedItemsTable".
Such items, even if they might also represent a policy violation, should ONLY appear in the "excludedItemsTable" and NOT in the "issuesTable".
The "issuesTable", "overallAssessment", and "overallSeverity" should ONLY reflect risks found in content NOT matching these exclusion rules.
The purpose of exclusion rules is to identify content that, according to these rules, should be handled or viewed separately.

${exclusionRulesSection}
For each item matching an exclusion rule, include it in "excludedItemsTable" with fields:
- "id": "string (e.g. excluded-item-1)"
- "sourceContext": "string ('primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText')"
- "identifiedContent": "string (same format as issuesTable)"
- "matchedRule": "string (e.g., 'Predefined: Religious Holidays' or 'Custom: [the matched custom line/phrase]')"
- "aiNote": "string (Briefly explain why this content matches the exclusion.)"
- "boundingBox": { "x_min": number, "y_min": number, "x_max": number, "y_max": number } | null (as per issuesTable rules)

If no content matches exclusion rules, "excludedItemsTable" MUST be an empty array.
` : `
**Exclusion Rules for Separate Categorization:**
No exclusion rules provided. The "excludedItemsTable" MUST be an empty array.
`;

  return `
You are an expert content policy analyst specializing in Meta's advertising guidelines.
Your task is to analyze the provided materials against the comprehensive "Meta Content Policy Detection Guide" below.
Your language MUST be **simple, clear, direct, and pithy**. It should be easily understood by anyone.
When identifying specific problematic content or suggesting keywords, **bold these keywords** using markdown (e.g., **keyword**).

**Provided Materials for Analysis:**
${providedMaterials}

**Meta Content Policy Detection Guide:**
---
${policyGuide}
---

${exclusionPromptPart}

**Analysis Request:**

Based on ALL provided materials (media, if any, AND any accompanying text) that DO NOT MATCH any exclusion rules:
1.  Provide an "overallAssessment" of its compliance. This MUST be a **concise summary (1-2 sentences)** using **simple, clear, and direct language**. ${postIntent?.trim() ? `Consider the stated post intent/goal when evaluating compliance and provide context-aware recommendations.` : ''}
2.  Assign an 'overallSeverity' to this assessment, using ONE of the following exact string values: 'Compliant', 'Low Risk', 'Medium Risk', 'High Risk'.
    - 'Compliant': No significant issues found in non-excluded content.
    - 'Low Risk': Minor issues or suggestions in non-excluded content, mostly compliant.
    - 'Medium Risk': Notable issues in non-excluded content that require attention and review.
    - 'High Risk': Serious policy violations in non-excluded content requiring immediate action.
    - If the "issuesTable" (defined below) is empty SOLELY because all identified content matched exclusion rules (and is thus in "excludedItemsTable"), the "overallAssessment" should clearly state this (e.g., "All potentially problematic content matched active exclusion rules. No other policy violations were found in the remaining content."), and "overallSeverity" should be 'Compliant'. If "issuesTable" is empty because no violations were found at all (even without exclusions), then "overallSeverity" is also 'Compliant'.
3.  Offer "recommendationsFeedback". This MUST be **succinct, clear, and actionable**, using **simple language**. ${postIntent?.trim() ? `Tailor recommendations to align with the stated intent while ensuring policy compliance.` : ''} If no issues in non-excluded content, state that it's compliant or that all issues were excluded.
4.  Generate a comparison table ('issuesTable'). Each item in the table MUST be an object with the following fields:
    - "id": A unique string identifier for this issue (e.g., "issue-1", "issue-2").
    - "sourceContext": A string indicating the origin of the content. Use ONE of: 'primaryImage', 'videoFrame', 'descriptionText', 'ctaText'.
    - "identifiedContent": Specific words, phrases, or visual elements. 
        - If sourceContext is 'primaryImage': "Visual (Image): [description of visual element or **text content of overlay** with **bolded keywords**]"
        - If sourceContext is 'videoFrame': "Visual (Video): [description of issue found in video at specific timestamp, including any on-screen text/captions, with **bolded keywords**]"
        - If sourceContext is 'descriptionText': "Text (Description): '[**problematic phrase**]'"
        - If sourceContext is 'ctaText': "Text (CTA): '[**problematic phrase**]'"
    - "issueDescription": SUCCINCTLY explain why this content is an issue according to the policy guide. KEEP THIS **VERY BRIEF AND SIMPLE**.
    - "recommendation": Suggest **CLEAR, SIMPLE, AND ACTIONABLE** changes to make the content compliant. KEEP THIS **VERY BRIEF AND ACTIONABLE**.
    - "severity": Assign a severity level to EACH issue, using ONE of the following exact string values: 'Low', 'Medium', 'High'.
    - "boundingBox": Optional. If "sourceContext" is 'primaryImage' AND the issue pertains to a specific, locatable visual element in THE UPLOADED IMAGE, provide **a single object** with normalized bounding box coordinates: { "x_min": number, "y_min": number, "x_max": number, "y_max": number }. Coordinates must be between 0.0 and 1.0. (0,0) is top-left. If not applicable for 'primaryImage' or for any other sourceContext, omit or set to null.
    - "timestamp": Optional. If "sourceContext" is 'videoFrame', provide the timestamp in seconds where the issue occurs (e.g., 23.5 for 23.5 seconds into the video). If not applicable, omit or set to null.
    - "captionText": Optional. If "sourceContext" is 'videoFrame' and there is on-screen text/captions at the timestamp, provide the exact text content. If no captions or not applicable, omit or set to null.
    - If no issues are found in content NOT matching exclusion rules, "issuesTable" MUST be an empty array.

**Output Format:**
Return your analysis as a single JSON object. Ensure the JSON is valid.
Do NOT use markdown code fences ('''json) in your response. Output raw JSON.
The JSON response MUST be a single, complete, and valid JSON object.
Example structure:
{
  "overallAssessment": "string",
  "overallSeverity": "string (Compliant | Low Risk | Medium Risk | High Risk)",
  "recommendationsFeedback": "string",
  "issuesTable": [
    {
      "id": "string",
      "sourceContext": "string ('primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText')",
      "identifiedContent": "string",
      "issueDescription": "string",
      "recommendation": "string",
      "severity": "string (High | Medium | Low)",
      "boundingBox": { "x_min": number, "y_min": number, "x_max": number, "y_max": number } | null,
      "timestamp": number | null,
      "captionText": "string" | null
    }
  ],
  "excludedItemsTable": [
    {
      "id": "string",
      "sourceContext": "string ('primaryImage' | 'videoFrame' | 'descriptionText' | 'ctaText')",
      "identifiedContent": "string",
      "matchedRule": "string",
      "aiNote": "string",
      "boundingBox": { "x_min": number, "y_min": number, "x_max": number, "y_max": number } | null,
      "timestamp": number | null,
      "captionText": "string" | null
    }
  ],
  "summaryForCopy": "string (plain language summary of issues and recommended changes for sharing with designers/developers)"
}

5.  Generate a "summaryForCopy" field containing a plain language summary of all issues and recommended changes. This should be written as clear, actionable instructions that can be copy-pasted and sent to designers, developers, or content creators. Format it as numbered steps or bullet points for easy implementation.

Important:
- "issuesTable" and "excludedItemsTable" MUST be empty arrays if no items fit their respective criteria.
- Ensure all string values for "overallSeverity", "issuesTable.severity", "issuesTable.sourceContext", "excludedItemsTable.sourceContext" strictly adhere to the specified categories.
- "boundingBox" should only be a single object or null for 'primaryImage' issues where it's relevant and locatable. For 'videoFrame' issues, it should generally be null.
- "timestamp" should be provided for 'videoFrame' issues with the exact time in seconds where the problem occurs.
- "captionText" should contain any on-screen text visible at the timestamp for 'videoFrame' issues.
- For all text fields, prioritize **brevity, clarity, and simple language**.
`;
}

const isValidSingleBoundingBoxObject = (box: any): boolean => {
  if (typeof box !== 'object' || box === null) return false;
  const keys = ['x_min', 'y_min', 'x_max', 'y_max'];
  for (const key of keys) {
    if (typeof box[key] !== 'number' || box[key] < 0 || box[key] > 1) return false;
  }
  return box.x_min < box.x_max && box.y_min < box.y_max;
};

const processBoundingBoxField = (item: any): AnalysisTableItem['boundingBox'] => {
  if (!item.hasOwnProperty('boundingBox')) {
    return undefined; 
  }
  const boxField = item.boundingBox;
  if (boxField === null) {
    return null; 
  }
  if (isValidSingleBoundingBoxObject(boxField)) {
    return boxField as AnalysisTableItem['boundingBox']; 
  }
  if (Array.isArray(boxField)) {
    console.warn(`Warning: Received an array for boundingBox for item ID "${item.id}", but expected a single object or null. Attempting to use the first valid box.`);
    for (const box of boxField) {
      if (isValidSingleBoundingBoxObject(box)) {
        return box as AnalysisTableItem['boundingBox']; 
      }
    }
    console.warn(`Warning: Array for boundingBox for item ID "${item.id}" contained no valid box objects. Treating as null.`);
    return null; 
  }
  
  console.warn(`Warning: Invalid boundingBox structure for item ID "${item.id}". Expected object, array, or null. Received:`, boxField, ". Treating as null.");
  return null;
};


export const analyzeContent = async (
  client: GoogleGenAI | null,
  modelName: string, 
  base64MediaDataArray: string[] | null, 
  mimeType: string | null,
  policyGuide: string,
  userDescription?: string,
  userCta?: string,
  isVideo: boolean = false,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string
): Promise<AnalysisResult> => {
  if (!client) {
    throw new Error("Gemini API client is not initialized. API Key might be missing or invalid.");
  }
  
  const hasMedia = base64MediaDataArray && base64MediaDataArray.length > 0 && base64MediaDataArray[0].length > 0;
  
  if (!hasMedia && !userDescription && !userCta) {
    throw new Error("No media or text provided for analysis.");
  }

  const promptIsVideo = hasMedia && isVideo;
  const promptHasImage = hasMedia && !isVideo;


  const promptContent = generatePrompt(
    policyGuide, 
    promptIsVideo, 
    !!userDescription, 
    !!userCta,
    selectedExclusionTags,
    customExclusions,
    postIntent
  );
  
  const parts: Part[] = [{ text: promptContent }];

  if (hasMedia && mimeType && base64MediaDataArray) { 
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64MediaDataArray[0], 
      },
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
    const response: GenerateContentResponse = await client.models.generateContent({
      model: modelName, 
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        topP: 0.8,        
        topK: 30,
      }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) { 
      jsonStr = match[1].trim();
    }

    try {
      const rawParsedData = JSON.parse(jsonStr);
      
      const processedIssuesTable = (rawParsedData.issuesTable || []).map((item: any) => ({
        ...item,
        boundingBox: processBoundingBoxField(item)
      }));
      
      const processedExcludedItemsTable = (rawParsedData.excludedItemsTable || []).map((item: any) => ({
        ...item,
        boundingBox: processBoundingBoxField(item)
      }));


      const parsedData: AnalysisResult = {
        ...rawParsedData,
        issuesTable: processedIssuesTable,
        excludedItemsTable: processedExcludedItemsTable
      };

      // Validation
      if (typeof parsedData.overallAssessment !== 'string' || 
          typeof parsedData.recommendationsFeedback !== 'string' ||
          (parsedData.overallSeverity && !['Compliant', 'Low Risk', 'Medium Risk', 'High Risk'].includes(parsedData.overallSeverity)) || 
          !Array.isArray(parsedData.issuesTable) ||
          !parsedData.issuesTable.every((item: AnalysisTableItem) => 
            typeof item.id === 'string' &&
            (item.sourceContext ? ['primaryImage', 'videoFrame', 'descriptionText', 'ctaText'].includes(item.sourceContext) : true) &&
            typeof item.identifiedContent === 'string' &&
            typeof item.issueDescription === 'string' &&
            typeof item.recommendation === 'string' &&
            (item.severity ? ['High', 'Medium', 'Low'].includes(item.severity) : true) &&
            (item.boundingBox === null || item.boundingBox === undefined || isValidSingleBoundingBoxObject(item.boundingBox))
          ) ||
          !Array.isArray(parsedData.excludedItemsTable) ||
           !parsedData.excludedItemsTable.every((item: ExcludedItem) => 
            typeof item.id === 'string' &&
            (item.sourceContext ? ['primaryImage', 'videoFrame', 'descriptionText', 'ctaText'].includes(item.sourceContext) : true) &&
            typeof item.identifiedContent === 'string' &&
            typeof item.matchedRule === 'string' &&
            typeof item.aiNote === 'string' &&
            (item.boundingBox === null || item.boundingBox === undefined || isValidSingleBoundingBoxObject(item.boundingBox))
          )
         ) {
            console.error("Gemini response JSON structure, severity, sourceContext, or other critical values are not as expected after processing:", parsedData);
            throw new Error("Gemini response is not in the expected JSON format or uses invalid values for critical fields. Check console for the received structure.");
          }
      return parsedData;
    } catch (e: any) {
      console.error("Failed to parse JSON response from Gemini:", jsonStr, e);
      const snippet = jsonStr.length > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr;
      throw new Error(`Failed to parse analysis from Gemini. Raw response snippet: ${snippet}. Error: ${e.message}`);
    }

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message) {
      if (error.message.includes("API_KEY_INVALID") || 
          error.message.includes("API key not valid") ||
          error.message.includes("permission denied") ||
          error.message.includes("User location is not supported")) {
           throw new Error("The Gemini API Key is invalid, not authorized for this model, missing required permissions, or your location is not supported. Please check your API key configuration, project settings, and ensure you are in a supported region.");
      }
      if (error.message.includes("quota")) {
          throw new Error("Gemini API quota exceeded. Please try again later or check your Google Cloud project quota limits.");
      }
       if (error.message.includes("Request payload size exceeds the limit")) {
        throw new Error("The content (image/video file) is too large for the Gemini API. Please try a smaller file.");
      }
      if (error.message.includes("Invalid JSON payload") || error.message.includes("Invalid argument")) {
          throw new Error("There was an issue with the data sent to Gemini (e.g., malformed request or invalid media data). This might be an internal issue or related to the uploaded file.");
      }
       if (error.message.includes("Deadline exceeded") || error.message.includes("timed out")) {
          throw new Error("The request to Gemini API timed out. This could be due to network issues or the model taking too long to respond. Try a smaller file or try again later.");
      }
       if (error.message.includes("Could not find model")) {
        throw new Error(`The specified model "${modelName}" could not be found or is not available for use with your API key or project.`);
       }
       if (error.message.includes("must be compatible with the model")) { 
        throw new Error(`The request (e.g. expected response type) is not compatible with the selected model '${modelName}'. This model may not support JSON output for this type of request.`);
       }
       if (error.message.includes("500") && error.message.includes("UNKNOWN")) {
         throw new Error("The Gemini API returned an internal server error (500). This might be a temporary issue with the API, or the request might be too complex. Please try again later. If the problem persists, consider simplifying the input (e.g., smaller image/video, less text).");
       }
    }
    throw new Error(`An error occurred while communicating with the Gemini API: ${error.message || 'Unknown error. Check browser console for more details.'}`);
  }
};
