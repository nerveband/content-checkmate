# Advanced Features Port: AI Detection, Fix Generation, and Design System

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port advanced features from React version including AI detection, automated fix generation with comprehensive modal workflow, fix design issues (bold text rendering, policy guide layout), and implement squared design system with CSS variables.

**Architecture:** Add prompt engineering service for generating fix instructions, integrate AI detection into main analysis flow, create fix generation modal with history management, update design system to use CSS variables for border radius control, fix markdown rendering, and redesign policy guide with two-column layout.

**Tech Stack:** SvelteKit, Svelte 5, Gemini API (gemini-3-flash-preview for detection/prompts, gemini-3-pro-image-preview for generation), TypeScript, Tailwind CSS

---

## Task 1: Design System - CSS Variables for Border Radius

**Files:**
- Modify: `src/app.css`
- Modify: `tailwind.config.js`

**Step 1: Add CSS variables for border radius control**

Add to `:root` in `src/app.css` after line 28:

```css
    /* Border Radius - Change all to non-zero values for rounded design */
    --radius-none: 0px;
    --radius-sm: 0px;   /* 0.25rem for rounded */
    --radius-md: 0px;   /* 0.375rem for rounded */
    --radius-lg: 0px;   /* 0.5rem for rounded */
    --radius-xl: 0px;   /* 0.75rem for rounded */
    --radius-2xl: 0px;  /* 1rem for rounded */
    --radius-3xl: 0px;  /* 1.5rem for rounded */
    --radius-full: 9999px; /* Keep for circular elements */
```

**Step 2: Update Tailwind config to use CSS variables**

In `tailwind.config.js`, add to `theme.extend`:

```javascript
borderRadius: {
  'none': '0',
  'sm': 'var(--radius-sm)',
  'DEFAULT': 'var(--radius-md)',
  'md': 'var(--radius-md)',
  'lg': 'var(--radius-lg)',
  'xl': 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  '3xl': 'var(--radius-3xl)',
  'full': 'var(--radius-full)',
},
```

**Step 3: Update component styles in app.css**

Replace all hardcoded rounded classes in `@layer components` section:

```css
/* Card styles */
.card {
  @apply bg-white border border-gray-200 shadow-card transition-all duration-200;
  border-radius: var(--radius-xl);
}

/* Button base */
.btn {
  @apply inline-flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  border-radius: var(--radius-lg);
}

/* Input styles */
.input {
  @apply w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200;
  border-radius: var(--radius-lg);
}

/* Badge styles */
.badge {
  @apply inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium;
  border-radius: var(--radius-full);
}

/* Tab indicator */
.tab-indicator {
  @apply absolute bottom-0 left-0 right-0 h-0.5 bg-accent;
  border-radius: var(--radius-full);
}

/* File drop zone */
.drop-zone {
  @apply relative border-2 border-dashed border-gray-300 p-8 text-center transition-all duration-200 cursor-pointer;
  border-radius: var(--radius-xl);
}
```

**Step 4: Update scrollbar styles**

In `::-webkit-scrollbar-track` and `::-webkit-scrollbar-thumb`:

```css
::-webkit-scrollbar-track {
  @apply bg-gray-100;
  border-radius: var(--radius-md);
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 hover:bg-gray-400 transition-colors;
  border-radius: var(--radius-md);
}
```

**Step 5: Commit design system foundation**

```bash
git add src/app.css tailwind.config.js
git commit -m "feat: add CSS variables for border radius control

- Add --radius-* CSS variables for easy design switching
- Update Tailwind config to use variables
- Replace hardcoded rounded classes with variables
- Set to square design (0px) by default"
```

---

## Task 2: Fix Markdown Bold Text Rendering

**Files:**
- Create: `src/lib/components/ui/Markdown.svelte`
- Modify: `src/lib/components/guide/PolicyGuide.svelte`

**Step 1: Create proper markdown component**

Create `src/lib/components/ui/Markdown.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let { content = '', class: className = '' }: { content: string; class?: string } = $props();

  // Simple markdown parser for our needs
  function parseMarkdown(text: string): string {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-10 mb-6">$1</h1>')
      // Bold - CRITICAL: Must render as font-weight, not background
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 text-gray-700">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mt-3 text-gray-700">')
      // Line breaks
      .replace(/\n/g, '<br />');
  }

  let html = $derived(parseMarkdown(content));
</script>

<div class={`prose prose-sm max-w-none ${className}`}>
  {@html html}
</div>

<style>
  .prose :global(strong) {
    font-weight: 700;
    color: rgb(26 26 26);
  }

  .prose :global(h1),
  .prose :global(h2),
  .prose :global(h3) {
    font-weight: 600;
  }

  .prose :global(li) {
    list-style-type: disc;
    margin-left: 1.5rem;
  }
</style>
```

**Step 2: Update PolicyGuide to use new component**

In `src/lib/components/guide/PolicyGuide.svelte`, replace any markdown rendering with:

```svelte
<script lang="ts">
  import Markdown from '$lib/components/ui/Markdown.svelte';
  // ... existing imports
</script>

<!-- Use instead of raw content rendering -->
<Markdown content={policyText} />
```

**Step 3: Commit markdown fix**

```bash
git add src/lib/components/ui/Markdown.svelte src/lib/components/guide/PolicyGuide.svelte
git commit -m "fix: render markdown bold text with font-weight instead of background

- Create dedicated Markdown component
- Parse **text** as <strong> with font-weight: 700
- Remove yellow background highlighting
- Update PolicyGuide to use new component"
```

---

## Task 3: Redesign Policy Guide with Two-Column Layout

**Files:**
- Modify: `src/lib/components/guide/PolicyGuide.svelte`
- Modify: `src/lib/data/policies.ts`

**Step 1: Update policy categories data structure**

In `src/lib/data/policies.ts`, add category metadata:

```typescript
export const POLICY_CATEGORIES = [
  { id: 'word-restrictions', label: 'Word-Level Restrictions', icon: '📝' },
  { id: 'content-categories', label: 'Content Categories', icon: '📋' },
  { id: 'image-detection', label: 'Image Detection', icon: '🖼️' },
  { id: 'geographic', label: 'Geographic Rules', icon: '🌍' },
  { id: 'detection-methods', label: 'Detection Methods', icon: '🔍' }
] as const;
```

**Step 2: Rewrite PolicyGuide component with two-column layout**

Replace `src/lib/components/guide/PolicyGuide.svelte` content:

```svelte
<script lang="ts">
  import { POLICY_CATEGORIES, POLICY_GUIDE } from '$lib/data/policies';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Markdown from '$lib/components/ui/Markdown.svelte';

  let searchQuery = $state('');
  let activeCategory = $state<string>('word-restrictions');

  // Parse policy guide into sections
  const policySections = $derived(() => {
    const sections: Record<string, string> = {};
    const lines = POLICY_GUIDE.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = line.replace('## ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  });

  const filteredContent = $derived(() => {
    if (!searchQuery.trim()) {
      return policySections()[activeCategory] || '';
    }

    // Filter content by search query
    const query = searchQuery.toLowerCase();
    const allContent = Object.values(policySections()).join('\n');
    const lines = allContent.split('\n').filter(line =>
      line.toLowerCase().includes(query)
    );
    return lines.join('\n');
  });
</script>

<div class="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
  <!-- Left Sidebar - Categories -->
  <aside class="md:w-64 flex-shrink-0">
    <Card class="sticky top-4 h-fit">
      <h3 class="font-semibold text-gray-900 mb-4">Policy Sections</h3>

      <Input
        bind:value={searchQuery}
        placeholder="Search policies..."
        class="mb-4"
      />

      <nav class="space-y-1">
        {#each POLICY_CATEGORIES as category}
          <button
            type="button"
            class="w-full text-left px-3 py-2 text-sm transition-colors {activeCategory === category.id ? 'bg-accent-light text-accent font-medium' : 'text-gray-700 hover:bg-gray-100'}"
            style="border-radius: var(--radius-md)"
            onclick={() => {
              activeCategory = category.id;
              searchQuery = '';
            }}
          >
            <span class="mr-2">{category.icon}</span>
            {category.label}
          </button>
        {/each}
      </nav>
    </Card>
  </aside>

  <!-- Right Content Area -->
  <main class="flex-1 overflow-auto">
    <Card>
      {#if searchQuery.trim()}
        <div class="mb-4">
          <p class="text-sm text-gray-600">
            Search results for: <strong class="font-semibold text-gray-900">"{searchQuery}"</strong>
          </p>
        </div>
      {/if}

      <div class="prose prose-sm max-w-none">
        <Markdown content={filteredContent()} />
      </div>

      {#if searchQuery.trim() && filteredContent().length === 0}
        <div class="text-center py-12">
          <p class="text-gray-500">No matching policies found.</p>
          <button
            type="button"
            class="mt-4 text-accent hover:underline text-sm"
            onclick={() => searchQuery = ''}
          >
            Clear search
          </button>
        </div>
      {/if}
    </Card>
  </main>
</div>
```

**Step 3: Commit policy guide redesign**

```bash
git add src/lib/components/guide/PolicyGuide.svelte src/lib/data/policies.ts
git commit -m "feat: redesign policy guide with two-column sticky navigation

- Add policy category metadata with icons
- Implement two-column layout: categories left, content right
- Add sticky navigation sidebar
- Integrate search functionality
- Use proper Markdown component for rendering"
```

---

## Task 4: Add AI Detection Service

**Files:**
- Create: `src/lib/services/aiDetection.ts`
- Modify: `src/lib/types/index.ts`

**Step 1: Update types for AI detection**

Add to `src/lib/types/index.ts`:

```typescript
export interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export interface AnalysisResult {
  overallAssessment: string;
  recommendationsFeedback: string;
  issuesTable: AnalysisTableItem[];
  overallSeverity?: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Compliant' | string;
  excludedItemsTable?: ExcludedItem[];
  summaryForCopy?: string;
  suggestedFixes?: string;
  aiDetection?: AIDetectionResult; // NEW
}
```

**Step 2: Create AI detection service**

Create `src/lib/services/aiDetection.ts`:

```typescript
import { getClient } from './gemini';

export interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

/**
 * Detects if an image appears to be AI-generated
 * Uses gemini-3-flash-preview for fast, cost-effective detection
 */
export async function detectAIGenerated(
  imageBase64: string,
  mimeType: string
): Promise<AIDetectionResult> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini client not initialized');
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
- 86-100: Almost certainly AI-generated`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64.split(',')[1] || imageBase64
            }
          }
        ]
      },
      config: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20
      }
    });

    const text = response.text.trim();

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI detection response');
    }

    const result = JSON.parse(jsonMatch[1]) as AIDetectionResult;

    // Validate response
    if (typeof result.isAIGenerated !== 'boolean' ||
        typeof result.confidence !== 'number' ||
        typeof result.reasoning !== 'string') {
      throw new Error('Invalid AI detection response format');
    }

    return result;
  } catch (error) {
    console.error('AI detection error:', error);
    throw new Error(`Failed to detect AI generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**Step 3: Commit AI detection service**

```bash
git add src/lib/services/aiDetection.ts src/lib/types/index.ts
git commit -m "feat: add AI-generated image detection service

- Create aiDetection.ts service
- Use gemini-3-flash-preview for cost-effective detection
- Return confidence percentage (0-100) and reasoning
- Add AIDetectionResult to AnalysisResult type"
```

---

## Task 5: Integrate AI Detection into Analysis Flow

**Files:**
- Modify: `src/lib/services/gemini.ts`
- Modify: `src/lib/stores/analysis.svelte.ts`

**Step 1: Update analyzeContent to include AI detection**

In `src/lib/services/gemini.ts`, modify the `analyzeContent` function to run AI detection in parallel:

```typescript
import { detectAIGenerated, type AIDetectionResult } from './aiDetection';

export async function analyzeContent(
  mediaBase64: string | null,
  mediaMimeType: string | null,
  description?: string,
  ctaText?: string,
  isVideo: boolean = false,
  selectedExclusionTags?: string[],
  customExclusions?: string,
  postIntent?: string,
  isSiepNotApplicable: boolean = false
): Promise<AnalysisResult> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini client not initialized. Please add your API key.');
  }

  // ... existing prompt building code ...

  try {
    // Run analysis and AI detection in parallel (if image provided)
    const [analysisResponse, aiDetectionResult] = await Promise.all([
      client.models.generateContent({
        model: settingsStore.selectedModel,
        contents: { parts: contentParts },
        config: {
          temperature: 0.1,
          topP: 0.95,
          topK: 40
        }
      }),
      // Only detect AI if we have an image (not video, not text-only)
      mediaBase64 && mediaMimeType?.startsWith('image/') && !isVideo
        ? detectAIGenerated(mediaBase64, mediaMimeType).catch(err => {
            console.warn('AI detection failed:', err);
            return null; // Don't fail entire analysis if AI detection fails
          })
        : Promise.resolve(null)
    ]);

    const text = analysisResponse.text.trim();

    // ... existing JSON parsing code ...

    const result = JSON.parse(jsonMatch[1]) as AnalysisResult;

    // Add AI detection result if available
    if (aiDetectionResult) {
      result.aiDetection = aiDetectionResult;
    }

    return result;
  } catch (error) {
    // ... existing error handling ...
  }
}
```

**Step 2: Update analysis store to handle AI detection**

In `src/lib/stores/analysis.svelte.ts`, ensure the store properly holds AI detection data:

```typescript
export const analysisStore = $state({
  // ... existing state ...
  analysisResult: null as AnalysisResult | null,
  showBoundingBoxes: true, // NEW: Toggle for bounding box overlays
});
```

**Step 3: Commit AI detection integration**

```bash
git add src/lib/services/gemini.ts src/lib/stores/analysis.svelte.ts
git commit -m "feat: integrate AI detection into analysis flow

- Run AI detection in parallel with policy analysis
- Only detect for images (not videos or text-only)
- Gracefully handle AI detection failures
- Add showBoundingBoxes toggle to analysis store"
```

---

## Task 6: Create Prompt Engineering Service

**Files:**
- Create: `src/lib/services/promptEngineering.ts`

**Step 1: Create prompt engineering service**

Create `src/lib/services/promptEngineering.ts`:

```typescript
import { getClient } from './gemini';
import type { AnalysisTableItem } from '$lib/types';

/**
 * Converts a bounding box to natural language location description
 */
function describeLocation(boundingBox: {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}): string {
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

/**
 * Generates a fix prompt for a single policy violation
 * Uses gemini-3-flash-preview for fast, cost-effective prompt generation
 */
export async function generateFixPrompt(issue: AnalysisTableItem): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini client not initialized');
  }

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

Your strategic editing instruction (plain text, no JSON):`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 30
      }
    });

    const result = response.text.trim();
    if (!result) {
      throw new Error('No fix prompt generated');
    }

    return result;
  } catch (error) {
    console.error('Error generating fix prompt:', error);
    throw new Error(`Failed to generate fix prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a comprehensive fix prompt for multiple violations
 * Combines all issues into one strategic editing instruction
 */
export async function generateComprehensiveFixPrompt(
  issues: AnalysisTableItem[]
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini client not initialized');
  }

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

Ensure the result would be:
- Policy-compliant across all violations
- Visually appealing and professionally crafted
- True to the original brand message and intent
- Engaging for the target audience

Example: "Transform the controversial symbol in the center into a modern geometric logo that represents the same brand values, while replacing the inappropriate text in the top-right with bold, inspiring messaging that conveys the same energy and appeal"

Your comprehensive strategic editing instruction (plain text, no JSON):`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 30
      }
    });

    const result = response.text.trim();
    if (!result) {
      throw new Error('No comprehensive fix prompt generated');
    }

    return result;
  } catch (error) {
    console.error('Error generating comprehensive fix prompt:', error);
    throw new Error(
      `Failed to generate comprehensive fix prompt: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

**Step 2: Commit prompt engineering service**

```bash
git add src/lib/services/promptEngineering.ts
git commit -m "feat: add prompt engineering service for fix generation

- Create generateFixPrompt for single violation fixes
- Create generateComprehensiveFixPrompt for multiple violations
- Add describeLocation helper for bounding box descriptions
- Use gemini-3-flash-preview for cost-effective prompt generation"
```

---

## Task 7: Add Image Generation to Gemini Service

**Files:**
- Modify: `src/lib/services/gemini.ts`

**Step 1: Add generateImage function**

Add to `src/lib/services/gemini.ts`:

```typescript
/**
 * Generates an image using Gemini's image generation model
 * Uses gemini-3-pro-image-preview for high-quality image generation
 */
export async function generateImage(
  prompt: string,
  sourceImageBase64?: string,
  sourceImageMimeType?: string
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini client not initialized');
  }

  try {
    const parts: any[] = [{ text: prompt }];

    // Add source image if provided (for image editing)
    if (sourceImageBase64 && sourceImageMimeType) {
      parts.push({
        inlineData: {
          mimeType: sourceImageMimeType,
          data: sourceImageBase64.split(',')[1] || sourceImageBase64
        }
      });
    }

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40
      }
    });

    // Gemini image generation returns image data in the response
    // Extract the generated image URL or base64 data
    const generatedImage = response.candidates?.[0]?.content?.parts?.[0];

    if (!generatedImage || !generatedImage.inlineData) {
      throw new Error('No image generated in response');
    }

    // Convert to data URL for display
    const imageData = generatedImage.inlineData.data;
    const mimeType = generatedImage.inlineData.mimeType || 'image/png';

    return `data:${mimeType};base64,${imageData}`;
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**Step 2: Export generateImage from service**

Ensure it's exported from the service file.

**Step 3: Commit image generation**

```bash
git add src/lib/services/gemini.ts
git commit -m "feat: add image generation using gemini-3-pro-image-preview

- Create generateImage function
- Support source image for editing workflow
- Return base64 data URL for immediate display"
```

---

## Task 8: Create Fix Generation Store

**Files:**
- Create: `src/lib/stores/fixGeneration.svelte.ts`
- Modify: `src/lib/types/index.ts`

**Step 1: Add types for fix generation**

Add to `src/lib/types/index.ts`:

```typescript
export interface GeneratedFixImage {
  id: string;
  generatedPrompt: string;
  imageUrl: string;
  originalAnalysisIssueId?: string;
  timestamp: number;
}
```

**Step 2: Create fix generation store**

Create `src/lib/stores/fixGeneration.svelte.ts`:

```typescript
import type { AnalysisTableItem, GeneratedFixImage } from '$lib/types';

interface FixGenerationStore {
  isModalOpen: boolean;
  targetIssue: AnalysisTableItem | null;
  isComprehensiveFix: boolean;
  generatedFixPrompt: string;
  generatedImage: string | null;
  isGenerating: boolean;
  isGeneratingPrompt: boolean;
  error: string | null;
  fixHistory: GeneratedFixImage[];
}

export const fixGenerationStore = $state<FixGenerationStore>({
  isModalOpen: false,
  targetIssue: null,
  isComprehensiveFix: false,
  generatedFixPrompt: '',
  generatedImage: null,
  isGenerating: false,
  isGeneratingPrompt: false,
  error: null,
  fixHistory: []
});

// Actions
export function openFixModal(issue: AnalysisTableItem | null, isComprehensive: boolean = false) {
  fixGenerationStore.isModalOpen = true;
  fixGenerationStore.targetIssue = issue;
  fixGenerationStore.isComprehensiveFix = isComprehensive;
  fixGenerationStore.generatedFixPrompt = '';
  fixGenerationStore.generatedImage = null;
  fixGenerationStore.error = null;
}

export function closeFixModal() {
  fixGenerationStore.isModalOpen = false;
  fixGenerationStore.targetIssue = null;
  fixGenerationStore.isComprehensiveFix = false;
  fixGenerationStore.error = null;
}

export function addToHistory(fix: GeneratedFixImage) {
  fixGenerationStore.fixHistory = [fix, ...fixGenerationStore.fixHistory];
}

export function clearHistory() {
  fixGenerationStore.fixHistory = [];
}

export function setGeneratedPrompt(prompt: string) {
  fixGenerationStore.generatedFixPrompt = prompt;
}

export function setGeneratedImage(imageUrl: string) {
  fixGenerationStore.generatedImage = imageUrl;
}

export function setError(error: string | null) {
  fixGenerationStore.error = error;
}
```

**Step 3: Commit fix generation store**

```bash
git add src/lib/stores/fixGeneration.svelte.ts src/lib/types/index.ts
git commit -m "feat: create fix generation store

- Add fixGenerationStore with modal state
- Track single vs comprehensive fix mode
- Manage generation state and history
- Add helper actions for modal lifecycle"
```

---

## Task 9: Update UI Components for Square Design

**Files:**
- Modify: `src/lib/components/ui/Card.svelte`
- Modify: `src/lib/components/ui/Button.svelte`
- Modify: `src/lib/components/ui/Input.svelte`
- Modify: `src/lib/components/ui/Textarea.svelte`
- Modify: `src/lib/components/ui/Checkbox.svelte`
- Modify: `src/lib/components/ui/Modal.svelte`
- Modify: `src/lib/components/ui/Badge.svelte`

**Step 1: Update Card component**

In `src/lib/components/ui/Card.svelte`, replace `rounded-xl` with CSS variable:

```svelte
<div class="bg-white border border-gray-200 shadow-card transition-all duration-200 hover:shadow-elevated hover:border-gray-300 {className}" style="border-radius: var(--radius-xl)">
  <slot />
</div>
```

**Step 2: Update Button component**

Replace rounded classes with CSS variable usage throughout.

**Step 3: Update all other UI components**

Go through each UI component and replace hardcoded `rounded-*` classes with CSS variable usage via inline styles or utility classes that reference variables.

**Step 4: Commit UI component updates**

```bash
git add src/lib/components/ui/*.svelte
git commit -m "refactor: update UI components to use CSS variable border radius

- Replace all hardcoded rounded-* classes
- Use var(--radius-*) throughout components
- Ensure consistent square design system"
```

---

## Task 10: Create Bounding Box Toggle Component

**Files:**
- Create: `src/lib/components/analysis/BoundingBoxOverlay.svelte`
- Modify: `src/lib/components/analysis/AnalysisResults.svelte`

**Step 1: Create BoundingBoxOverlay component**

Create `src/lib/components/analysis/BoundingBoxOverlay.svelte`:

```svelte
<script lang="ts">
  import type { AnalysisTableItem } from '$lib/types';

  let {
    imageUrl,
    issues,
    visible = true,
    highlightedIssueId = null,
    onIssueClick
  }: {
    imageUrl: string;
    issues: AnalysisTableItem[];
    visible?: boolean;
    highlightedIssueId?: string | null;
    onIssueClick?: (issueId: string) => void;
  } = $props();

  let imageElement: HTMLImageElement;
  let containerElement: HTMLDivElement;
  let imageDimensions = $state({ width: 0, height: 0 });

  function handleImageLoad() {
    if (imageElement && containerElement) {
      imageDimensions = {
        width: imageElement.clientWidth,
        height: imageElement.clientHeight
      };
    }
  }

  function getBoxStyle(box: { x_min: number; y_min: number; x_max: number; y_max: number }) {
    const left = box.x_min * 100;
    const top = box.y_min * 100;
    const width = (box.x_max - box.x_min) * 100;
    const height = (box.y_max - box.y_min) * 100;

    return `left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;`;
  }

  const issuesWithBoxes = $derived(issues.filter(issue => issue.boundingBox));
</script>

<div bind:this={containerElement} class="relative inline-block">
  <img
    bind:this={imageElement}
    src={imageUrl}
    alt="Analysis preview"
    class="max-w-full h-auto"
    onload={handleImageLoad}
  />

  {#if visible && issuesWithBoxes.length > 0}
    {#each issuesWithBoxes as issue}
      {#if issue.boundingBox}
        <button
          type="button"
          class="absolute border-2 transition-all cursor-pointer {highlightedIssueId === issue.id ? 'border-negative bg-negative/20 border-4' : 'border-accent bg-accent/10 hover:bg-accent/20'}"
          style={getBoxStyle(issue.boundingBox)}
          onclick={() => onIssueClick?.(issue.id)}
          aria-label="Bounding box for {issue.identifiedContent}"
        />
      {/if}
    {/each}
  {/if}
</div>
```

**Step 2: Add toggle to AnalysisResults**

In `src/lib/components/analysis/AnalysisResults.svelte`, add toggle button and use BoundingBoxOverlay:

```svelte
<script lang="ts">
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import BoundingBoxOverlay from './BoundingBoxOverlay.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let highlightedIssueId = $state<string | null>(null);
</script>

<!-- Toggle Button -->
{#if analysisStore.uploadedFilePreview && analysisStore.analysisResult?.issuesTable.some(i => i.boundingBox)}
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-semibold text-gray-900">Image Preview</h3>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => analysisStore.showBoundingBoxes = !analysisStore.showBoundingBoxes}
    >
      {analysisStore.showBoundingBoxes ? 'Hide' : 'Show'} Bounding Boxes
    </Button>
  </div>
{/if}

<!-- Image with Overlays -->
{#if analysisStore.uploadedFilePreview}
  <div class="flex justify-center mb-6">
    <BoundingBoxOverlay
      imageUrl={analysisStore.uploadedFilePreview}
      issues={analysisStore.analysisResult?.issuesTable || []}
      visible={analysisStore.showBoundingBoxes}
      highlightedIssueId={highlightedIssueId}
      onIssueClick={(id) => highlightedIssueId = id}
    />
  </div>
{/if}
```

**Step 3: Commit bounding box overlay**

```bash
git add src/lib/components/analysis/BoundingBoxOverlay.svelte src/lib/components/analysis/AnalysisResults.svelte
git commit -m "feat: add bounding box overlay with toggle

- Create BoundingBoxOverlay component
- Support highlighting on click
- Add show/hide toggle button
- Display boxes over analysis image preview"
```

---

## Task 11: Create Fix Generation Modal

**Files:**
- Create: `src/lib/components/analysis/FixGenerationModal.svelte`

**Step 1: Create comprehensive fix generation modal**

Create `src/lib/components/analysis/FixGenerationModal.svelte`:

```svelte
<script lang="ts">
  import { fixGenerationStore, closeFixModal, setError, setGeneratedPrompt, setGeneratedImage, addToHistory } from '$lib/stores/fixGeneration.svelte';
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { generateFixPrompt, generateComprehensiveFixPrompt } from '$lib/services/promptEngineering';
  import { generateImage } from '$lib/services/gemini';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import { generateId, downloadImage } from '$lib/utils/fileUtils';

  let editablePrompt = $state('');
  let isEditingPrompt = $state(false);
  let generationStartTime = $state<number | null>(null);
  let elapsedSeconds = $state(0);
  let timerInterval: number | undefined;

  // Auto-generate prompt when modal opens
  $effect(() => {
    if (fixGenerationStore.isModalOpen && !fixGenerationStore.generatedFixPrompt) {
      handleGeneratePrompt();
    }
  });

  // Sync editable prompt with generated prompt
  $effect(() => {
    if (fixGenerationStore.generatedFixPrompt && !isEditingPrompt) {
      editablePrompt = fixGenerationStore.generatedFixPrompt;
    }
  });

  // Timer for image generation
  $effect(() => {
    if (fixGenerationStore.isGenerating && generationStartTime === null) {
      generationStartTime = Date.now();
      elapsedSeconds = 0;

      timerInterval = window.setInterval(() => {
        if (generationStartTime) {
          elapsedSeconds = Math.floor((Date.now() - generationStartTime) / 1000);
        }
      }, 1000);
    } else if (!fixGenerationStore.isGenerating && timerInterval) {
      clearInterval(timerInterval);
      timerInterval = undefined;
      generationStartTime = null;
      elapsedSeconds = 0;
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  async function handleGeneratePrompt() {
    fixGenerationStore.isGeneratingPrompt = true;
    setError(null);

    try {
      let prompt: string;

      if (fixGenerationStore.isComprehensiveFix && analysisStore.analysisResult) {
        prompt = await generateComprehensiveFixPrompt(analysisStore.analysisResult.issuesTable);
      } else if (fixGenerationStore.targetIssue) {
        prompt = await generateFixPrompt(fixGenerationStore.targetIssue);
      } else {
        throw new Error('No issue selected for fix generation');
      }

      setGeneratedPrompt(prompt);
      editablePrompt = prompt;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate fix prompt');
    } finally {
      fixGenerationStore.isGeneratingPrompt = false;
    }
  }

  async function handleGenerateImage() {
    if (!editablePrompt.trim()) {
      setError('Please provide an editing prompt');
      return;
    }

    fixGenerationStore.isGenerating = true;
    setError(null);

    try {
      const imageUrl = await generateImage(
        editablePrompt,
        analysisStore.uploadedFileBase64 || undefined,
        analysisStore.uploadedFileMimeType || undefined
      );

      setGeneratedImage(imageUrl);

      // Add to history
      addToHistory({
        id: generateId(),
        generatedPrompt: editablePrompt,
        imageUrl,
        originalAnalysisIssueId: fixGenerationStore.targetIssue?.id,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      fixGenerationStore.isGenerating = false;
    }
  }

  function handleDownload() {
    if (fixGenerationStore.generatedImage) {
      downloadImage(fixGenerationStore.generatedImage, `fixed-${Date.now()}.png`);
    }
  }

  function handleRegenerateWithPrompt() {
    setGeneratedImage(null);
    handleGenerateImage();
  }

  function handleClose() {
    if (timerInterval) clearInterval(timerInterval);
    closeFixModal();
    editablePrompt = '';
    isEditingPrompt = false;
  }
</script>

<Modal isOpen={fixGenerationStore.isModalOpen} onClose={handleClose} size="xl">
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          {fixGenerationStore.isComprehensiveFix ? 'Fix All Issues' : 'Suggest Fix'}
        </h2>
        {#if fixGenerationStore.targetIssue}
          <p class="text-sm text-gray-600 mt-1">
            Addressing: {fixGenerationStore.targetIssue.identifiedContent}
          </p>
        {/if}
      </div>
      <Button variant="ghost" size="sm" onclick={handleClose}>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Original Image & Prompt -->
      <div class="space-y-4">
        {#if analysisStore.uploadedFilePreview}
          <Card>
            <h3 class="font-semibold text-gray-900 mb-3">Original Image</h3>
            <img
              src={analysisStore.uploadedFilePreview}
              alt="Original"
              class="w-full h-auto"
            />
          </Card>
        {/if}

        <Card>
          <h3 class="font-semibold text-gray-900 mb-3">Fix Instructions</h3>

          {#if fixGenerationStore.isGeneratingPrompt}
            <div class="flex items-center justify-center py-8">
              <div class="w-8 h-8 border-4 border-accent border-t-transparent animate-spin" style="border-radius: var(--radius-full)"></div>
              <p class="ml-3 text-gray-600">Generating fix prompt...</p>
            </div>
          {:else}
            <Textarea
              bind:value={editablePrompt}
              rows={6}
              placeholder="Edit the AI-generated fix instruction..."
              onfocus={() => isEditingPrompt = true}
              onblur={() => isEditingPrompt = false}
            />

            {#if fixGenerationStore.error}
              <p class="text-sm text-negative mt-2">{fixGenerationStore.error}</p>
            {/if}

            <div class="flex gap-2 mt-4">
              <Button
                variant="primary"
                onclick={handleGenerateImage}
                disabled={fixGenerationStore.isGenerating || !editablePrompt.trim()}
                class="flex-1"
              >
                {fixGenerationStore.isGenerating ? 'Generating...' : 'Generate Fixed Image'}
              </Button>

              <Button variant="secondary" onclick={handleGeneratePrompt}>
                Regenerate Prompt
              </Button>
            </div>
          {/if}
        </Card>
      </div>

      <!-- Right: Generated Image -->
      <div>
        <Card class="h-full">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">Generated Fix</h3>
            {#if fixGenerationStore.generatedImage}
              <Button variant="ghost" size="sm" onclick={handleDownload}>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </Button>
            {/if}
          </div>

          {#if fixGenerationStore.isGenerating}
            <div class="aspect-square bg-gray-100 flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" style="border-radius: var(--radius-full)"></div>
                <p class="text-gray-900 font-medium">Generating fixed image...</p>
                <p class="text-sm text-gray-600 mt-2">Elapsed: {elapsedSeconds}s</p>
                <p class="text-xs text-gray-500 mt-1">This may take 30-60 seconds</p>
              </div>
            </div>
          {:else if fixGenerationStore.generatedImage}
            <div class="space-y-4">
              <img
                src={fixGenerationStore.generatedImage}
                alt="Generated fix"
                class="w-full h-auto"
              />
              <Button variant="secondary" onclick={handleRegenerateWithPrompt} class="w-full">
                Regenerate with Current Prompt
              </Button>
            </div>
          {:else}
            <div class="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <p class="text-gray-400">Generated image will appear here</p>
            </div>
          {/if}
        </Card>
      </div>
    </div>

    <!-- History -->
    {#if fixGenerationStore.fixHistory.length > 0}
      <Card class="mt-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Generation History</h3>
          <Button variant="ghost" size="sm" onclick={() => fixGenerationStore.fixHistory = []}>
            Clear All
          </Button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {#each fixGenerationStore.fixHistory as item}
            <button
              type="button"
              class="group relative aspect-square overflow-hidden bg-gray-100 hover:ring-2 hover:ring-accent transition-all"
              onclick={() => setGeneratedImage(item.imageUrl)}
            >
              <img
                src={item.imageUrl}
                alt={item.generatedPrompt}
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p class="text-xs text-white line-clamp-2">{item.generatedPrompt}</p>
              </div>
            </button>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
</Modal>
```

**Step 2: Commit fix generation modal**

```bash
git add src/lib/components/analysis/FixGenerationModal.svelte
git commit -m "feat: create fix generation modal with comprehensive workflow

- Side-by-side original and generated images
- Editable AI-generated fix prompts
- Generation timer with elapsed seconds
- History grid with thumbnails
- Download generated images
- Support single issue and comprehensive fixes"
```

---

## Task 12: Integrate Fix Generation into Analysis Results

**Files:**
- Modify: `src/lib/components/analysis/AnalysisResults.svelte`
- Modify: `src/lib/components/analysis/ViolationCard.svelte`

**Step 1: Add fix buttons to AnalysisResults**

In `src/lib/components/analysis/AnalysisResults.svelte`, add buttons and modal:

```svelte
<script lang="ts">
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { openFixModal } from '$lib/stores/fixGeneration.svelte';
  import FixGenerationModal from './FixGenerationModal.svelte';
  import ViolationCard from './ViolationCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';

  // ... existing code ...
</script>

<!-- AI Detection Badge -->
{#if analysisStore.analysisResult?.aiDetection}
  <Card class="mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-900">AI Generation Detection</h3>
        <p class="text-sm text-gray-600 mt-1">
          {analysisStore.analysisResult.aiDetection.reasoning}
        </p>
      </div>
      <Badge variant={analysisStore.analysisResult.aiDetection.confidence > 60 ? 'warning' : 'success'}>
        {analysisStore.analysisResult.aiDetection.confidence}% AI Confidence
      </Badge>
    </div>
  </Card>
{/if}

<!-- Fix All Button -->
{#if analysisStore.analysisResult?.issuesTable && analysisStore.analysisResult.issuesTable.length > 0}
  <div class="mb-4">
    <Button
      variant="primary"
      onclick={() => openFixModal(null, true)}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Fix All Issues
    </Button>
  </div>
{/if}

<!-- Violation Cards with Suggest Fix -->
{#each analysisStore.analysisResult?.issuesTable || [] as issue}
  <ViolationCard
    {issue}
    onSuggestFix={() => openFixModal(issue, false)}
  />
{/each}

<!-- Fix Generation Modal -->
<FixGenerationModal />
```

**Step 2: Update ViolationCard with Suggest Fix button**

In `src/lib/components/analysis/ViolationCard.svelte`, add button:

```svelte
<script lang="ts">
  import type { AnalysisTableItem } from '$lib/types';
  import Button from '$lib/components/ui/Button.svelte';

  let { issue, onSuggestFix }: { issue: AnalysisTableItem; onSuggestFix?: () => void } = $props();
</script>

<Card>
  <!-- ... existing content ... -->

  {#if onSuggestFix}
    <div class="mt-4 pt-4 border-t border-gray-200">
      <Button variant="secondary" size="sm" onclick={onSuggestFix}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Suggest Fix
      </Button>
    </div>
  {/if}
</Card>
```

**Step 3: Commit integration**

```bash
git add src/lib/components/analysis/AnalysisResults.svelte src/lib/components/analysis/ViolationCard.svelte
git commit -m "feat: integrate fix generation into analysis results

- Add 'Fix All Issues' button at top
- Add 'Suggest Fix' button to each violation card
- Display AI detection results with confidence badge
- Connect to fix generation modal"
```

---

## Task 13: Update Image Editor to Use Gemini

**Files:**
- Modify: `src/lib/components/editor/ImageEditor.svelte`
- Modify: `src/lib/stores/editor.svelte.ts`

**Step 1: Update editor store to remove FLUX references**

In `src/lib/stores/editor.svelte.ts`, simplify to use Gemini:

```typescript
// Remove any FLUX-specific code
// Keep history management
// Update generateImage call to use Gemini service
```

**Step 2: Update ImageEditor component**

In `src/lib/components/editor/ImageEditor.svelte`, update to use `generateImage` from gemini service instead of any FLUX references.

**Step 3: Commit editor updates**

```bash
git add src/lib/components/editor/ImageEditor.svelte src/lib/stores/editor.svelte.ts
git commit -m "refactor: update image editor to use Gemini instead of FLUX

- Remove FLUX model selection
- Use gemini-3-pro-image-preview for generation
- Simplify editor workflow
- Keep history management"
```

---

## Task 14: Final Testing & Polish

**Files:**
- Test all features
- Fix any bugs
- Update documentation

**Step 1: Test all features**

Manual testing checklist:
- [ ] Upload image → Analysis includes AI detection
- [ ] Click "Fix All Issues" → Modal opens with comprehensive fix
- [ ] Click "Suggest Fix" on violation → Modal opens with single fix
- [ ] Toggle bounding boxes on/off
- [ ] Edit fix prompt → Regenerate image
- [ ] Download generated image
- [ ] View generation history
- [ ] Policy Guide: two-column layout, search, navigation
- [ ] Bold text renders correctly (no yellow background)
- [ ] All UI elements are square (no rounded corners)

**Step 2: Test CSS variable toggle**

Change CSS variables to non-zero values and verify rounded design works:

```css
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
/* etc */
```

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete advanced features port

- AI detection integrated into analysis
- Automated fix generation with modal workflow
- Square design system with CSS variable control
- Fixed markdown bold rendering
- Two-column policy guide layout
- Bounding box toggle
- Comprehensive and single-issue fix modes
- Generation history management

All features from React version successfully ported to Svelte"
```

---

## Plan Complete

**Files Created:**
- `src/lib/services/aiDetection.ts`
- `src/lib/services/promptEngineering.ts`
- `src/lib/stores/fixGeneration.svelte.ts`
- `src/lib/components/ui/Markdown.svelte`
- `src/lib/components/analysis/BoundingBoxOverlay.svelte`
- `src/lib/components/analysis/FixGenerationModal.svelte`

**Files Modified:**
- `src/app.css` - CSS variables for border radius
- `tailwind.config.js` - Radius configuration
- `src/lib/services/gemini.ts` - AI detection integration, image generation
- `src/lib/types/index.ts` - New types
- `src/lib/stores/analysis.svelte.ts` - Bounding box toggle
- `src/lib/components/guide/PolicyGuide.svelte` - Two-column layout
- `src/lib/components/analysis/AnalysisResults.svelte` - Fix buttons, AI badge
- `src/lib/components/analysis/ViolationCard.svelte` - Suggest Fix button
- `src/lib/components/editor/ImageEditor.svelte` - Use Gemini
- All UI components - CSS variable border radius

**Key Features:**
✅ AI detection (gemini-3-flash-preview)
✅ Automated fix generation (single + comprehensive)
✅ Fix generation modal with history
✅ Square design system (easy toggle)
✅ Fixed markdown bold rendering
✅ Two-column policy guide
✅ Bounding box overlay with toggle
✅ Image generation (gemini-3-pro-image-preview)
