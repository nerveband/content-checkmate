# Content Checkmate

AI-powered content policy analyzer for Meta advertising compliance. Analyze your content before you publish to catch policy violations and get actionable recommendations.

## Demo

<p align="center">
  <img src="promo-preview.gif" alt="Content Checkmate Demo" width="640">
</p>

<p align="center">
  <a href="promo.mp4">📺 Watch Full Demo Video</a>
</p>

## Features

### Content Analysis
- **Image Analysis**: Upload images and get detailed policy compliance reports
- **Video Analysis**: Analyze video content with timestamp-based flagging
- **Text Analysis**: Analyze descriptions, CTAs, and ad copy
- **Combined Analysis**: Analyze media with accompanying text

### AI-Powered Features
- **Smart Fix Suggestions**: Get AI-generated editing instructions
- **Image Generation**: Create compliant alternative images
- **Risk Scoring**: High/Medium/Low severity classifications
- **Exclusion Rules**: Exclude legitimate content from flagging

### Policy Guide
- Browse Meta advertising policy documentation
- Search for specific policy areas
- Understand what content is allowed vs. restricted

## Tech Stack

- **Framework**: Svelte 5 with SvelteKit
- **Styling**: Tailwind CSS
- **AI Models**:
  - `gemini-3-flash-preview` - Content analysis
  - `gemini-3-pro-image-preview` - Image generation
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/content-checkmate.git
cd content-checkmate

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. Click the **API Key** button in the header
2. Enter your Gemini API key
3. Start analyzing content!

Alternatively, create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

### Analyzing Content

1. **Upload Media**: Drag & drop or click to upload an image/video
2. **Add Context**: Enter description, CTA, and post intent
3. **Set Exclusions**: Select any content to exclude from flagging
4. **Analyze**: Click "Analyze Content" to get results

### Understanding Results

- **Compliant**: No issues found
- **Low Risk**: Minor issues, mostly compliant
- **Medium Risk**: Notable issues requiring attention
- **High Risk**: Serious violations requiring immediate action

### Image Editor

1. Upload a source image (optional)
2. Enter editing instructions in natural language
3. Generate AI-modified images
4. Download results

## Deployment

Build for production:

```bash
npm run build
```

The output will be in the `build/` directory. Deploy to any static hosting:

- **Netlify**: Drag & drop the build folder
- **GitHub Pages**: Push build to gh-pages branch
- **AWS S3**: Upload to S3 bucket with static hosting
- **Cloudflare Pages**: Connect your repo

## Development

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/          # Base UI components
│   │   ├── layout/      # Header, Footer
│   │   ├── analysis/    # Analysis-related components
│   │   ├── editor/      # Image editor components
│   │   └── guide/       # Policy guide components
│   ├── services/        # API integrations
│   ├── stores/          # Svelte 5 runes stores
│   ├── types/           # TypeScript types
│   ├── data/            # Policy data
│   └── utils/           # Utility functions
├── routes/
│   ├── +layout.svelte   # App layout
│   └── +page.svelte     # Main page
└── app.css              # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Built with Svelte 5 and Gemini AI**
