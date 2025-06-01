# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Intuitive Solutions Content Policy Analyzer**, a React-based web application that analyzes content (images, videos, and text) against Meta's advertising content policies using Google's Gemini AI. The app helps identify potential policy violations and provides recommendations for compliance.

## Development Commands

- `npm run dev` - Start the development server (Vite)
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Environment Setup

The app requires a Gemini API key to function:
1. Create a `.env.local` file in the root
2. Set `GEMINI_API_KEY=your_api_key_here`
3. The app can also accept custom API keys through the settings UI

## Architecture Overview

### Core Application Flow
1. **App.tsx** - Main application component managing:
   - Tab navigation (Media & Text, Text Only, Policy Guide)
   - API key management (built-in vs custom)
   - File upload handling for images/videos
   - Analysis orchestration and state management
   - Real-time bounding box overlays for image analysis

2. **Analysis Pipeline**:
   - User uploads media and/or enters text content
   - Optional exclusion rules can be defined to categorize certain content separately
   - Content is sent to Gemini AI via `geminiService.ts` with comprehensive policy prompts
   - Results include policy violations table and excluded items table
   - For images, bounding boxes can highlight specific problem areas visually

3. **Key State Management**:
   - Model selection (various Gemini 2.x models supported)
   - Exclusion rules (predefined tags + custom text rules)
   - Analysis results with visual highlighting for images
   - File processing state (preview generation, base64 conversion)

### Component Architecture

**Core Components**:
- `FileUpload.tsx` - Drag-and-drop file upload with paste support
- `AnalysisDisplay.tsx` - Results visualization with tables and recommendations
- `ExclusionRulesInputs.tsx` - UI for defining content exclusion rules
- `PolicyGuide.tsx` - Interactive policy reference guide
- `MarkdownRenderer.tsx` - Safe markdown rendering for dynamic content

**Services**:
- `geminiService.ts` - Handles all AI communication, prompt generation, and response parsing
- Manages different content types (image, video, text-only) with appropriate prompting

**Configuration**:
- `constants.ts` - Contains the comprehensive Meta content policy guide and predefined exclusion tags
- `types.ts` - TypeScript interfaces for analysis results, bounding boxes, and exclusion items
- `vite.config.ts` - Handles environment variable injection for API keys

### Key Features

1. **Multi-Modal Analysis**: Supports images, videos, and text-only content analysis
2. **Visual Bounding Boxes**: For images, problematic content can be highlighted with clickable overlays
3. **Exclusion System**: Users can define rules to categorize certain content separately from violations
4. **Model Selection**: Supports multiple Gemini models with different capabilities
5. **Real-time Processing**: Live file processing with progress indicators
6. **Responsive Design**: Works across desktop and mobile devices

### Data Flow

1. User selects content type (Media & Text vs Text Only)
2. Uploads file and/or enters text descriptions/CTAs
3. Optionally configures exclusion rules (predefined tags or custom rules)
4. App converts media to base64, generates prompts based on content type
5. Gemini analyzes against comprehensive policy guide in `constants.ts`
6. Results parsed into structured format with separate violation and exclusion tables
7. For images, bounding boxes enable visual highlighting of specific problem areas
8. User can re-run analysis with modified exclusion rules

### Important Implementation Notes

- **API Key Management**: App supports both built-in keys (via environment) and user-provided custom keys
- **File Processing**: Images generate immediate previews; videos extract first frame for thumbnail
- **Bounding Box System**: Coordinates are normalized (0-1) and can be clicked for highlighting
- **Error Handling**: Comprehensive error messages for API failures, invalid content, etc.
- **State Persistence**: Model selection persists in localStorage; exclusion rules are session-based

The app is built with modern React patterns, TypeScript for type safety, and Tailwind CSS for styling. The policy guide in `constants.ts` contains the comprehensive Meta content policy rules that drive the AI analysis.