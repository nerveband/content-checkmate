# Intuitive Solutions Content Policy Analyzer

A comprehensive React-based web application that analyzes content against Meta's advertising policies using AI. The app helps content creators, marketers, and advertisers identify potential policy violations and provides AI-powered remediation solutions.

## ✨ Features

### 📊 Multi-Modal Content Analysis
- **Image Analysis**: Upload images and get detailed policy compliance reports with visual bounding boxes highlighting problem areas
- **Video Analysis**: Analyze video content with frame-by-frame policy checking
- **Text Analysis**: Analyze standalone text content, descriptions, and call-to-action copy
- **Combined Analysis**: Analyze media files with accompanying text descriptions and CTAs

### 🤖 AI-Powered Content Remediation
- **Smart Fix Generation**: Get AI-generated editing instructions to resolve policy violations
- **Visual Fix Preview**: See AI-generated corrected versions of your images using FLUX.1 Kontext
- **Batch Fixes**: Address multiple violations simultaneously with comprehensive remediation
- **Fix History**: Track and compare different fix attempts and variations

### 🎨 Advanced Image Editor
- **FLUX.1 Kontext Integration**: Professional-grade AI image editing with text instructions
- **Multiple Model Support**: Choose between Pro and Max models for different quality/speed needs
- **Generation History**: Keep track of all your edited images with prompts and settings
- **Creative Freedom**: Transform images with natural language instructions

### 🔧 Smart Exclusion System
- **Predefined Tags**: Quick exclusion of common legitimate content (holidays, cultural references, etc.)
- **Custom Rules**: Create your own exclusion criteria for specialized content
- **Separate Reporting**: Excluded content is analyzed separately, ensuring legitimate content isn't flagged

### 📋 Comprehensive Policy Coverage
- **Meta Advertising Policies**: Complete coverage of Facebook/Instagram advertising guidelines
- **Interactive Policy Guide**: Browse and search policy documentation with examples
- **Severity Levels**: Clear risk assessment with High/Medium/Low classifications
- **Actionable Recommendations**: Specific guidance on how to make content compliant

## 🚀 Live Demo

**Production URL**: [https://intuitive-solutions-content-policy-analyzer-cboiqoi2y.vercel.app](https://intuitive-solutions-content-policy-analyzer-cboiqoi2y.vercel.app)

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Services**: 
  - Google Gemini 2.x models for content analysis
  - FLUX.1 Kontext (Pro/Max) for image editing via Replicate API
- **Deployment**: Vercel with serverless functions
- **Build Tool**: Vite for fast development and optimized builds

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- API keys for Google Gemini and Replicate (for image editing features)

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/nerveband/is-content-analyzer.git
   cd intuitive-solutions-content-policy-analyzer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a \`.env.local\` file in the root directory:
   \`\`\`env
   GEMINI_API_KEY=your_gemini_api_key_here
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to \`http://localhost:5173\`

### Production Build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🎯 How to Use

### 1. Content Policy Analysis

#### Media & Text Tab
1. Upload an image or video file (drag & drop or click to browse)
2. Optionally add text description and call-to-action
3. Configure exclusion rules if needed (holidays, cultural content, etc.)
4. Click "Analyze Content" to get instant policy feedback
5. Review violations with visual highlights and actionable recommendations

#### Text Only Tab  
1. Enter your text content and CTA
2. Set up exclusion rules for legitimate content
3. Get rapid policy compliance analysis
4. Follow specific recommendations to ensure compliance

### 2. AI Content Remediation

When policy violations are detected in images:
1. Click "Suggest AI Fix" on individual violations OR "Suggest AI Fix for All Issues"
2. The AI will generate editing instructions and create corrected versions
3. Compare original vs. corrected images side-by-side
4. Download corrected images or generate alternative versions
5. View history of all remediation attempts

### 3. Creative Image Editing

#### Image Editor Tab
1. Upload any image you want to transform
2. Enter natural language editing instructions (e.g., "Make this look like a vintage poster", "Remove the background and add a sunset")
3. Choose between FLUX Kontext Pro (faster) or Max (higher quality)
4. Generate and compare multiple variations
5. Download your favorite results

### 4. Policy Reference

#### Policy Guide Tab
- Browse comprehensive Meta advertising policy documentation
- Search for specific policy areas or keywords
- Understand what content is allowed vs. restricted
- Get context for analysis results

## 🔧 Configuration

### Model Selection
- **Gemini Models**: Choose from various Gemini 2.x models based on your needs
- **FLUX Models**: 
  - **Pro**: Faster generation, good quality (10 credits/run)
  - **Max**: Premium quality, advanced typography (20 credits/run)

### API Key Management
- Built-in API keys for basic functionality
- Custom API key support for extended usage
- Automatic fallback between key sources

### Exclusion Rules
- **Predefined Tags**: Religious holidays, cultural events, educational content, etc.
- **Custom Rules**: Line-by-line custom exclusion criteria
- **Smart Categorization**: Excluded content is analyzed separately but still reported

## 🌟 Key Benefits

- **Save Time**: Instant policy analysis vs. manual review
- **Reduce Rejections**: Catch violations before submitting ads
- **Creative Solutions**: AI-powered fixes maintain your creative vision
- **Stay Compliant**: Up-to-date policy coverage with detailed guidance
- **Professional Quality**: Enterprise-grade AI models and analysis
- **User-Friendly**: Intuitive interface for all skill levels

## 🔒 Privacy & Security

- **No Data Storage**: Content is analyzed in real-time, not stored
- **Secure APIs**: All AI processing happens through official provider APIs
- **Client-Side Processing**: Image previews and UI state managed locally
- **Configurable Keys**: Use your own API keys for full control

## 📈 Use Cases

- **Digital Marketers**: Pre-screen ad creative before campaign launch
- **Content Creators**: Ensure social media content meets platform guidelines  
- **Advertising Agencies**: Streamline creative review and approval processes
- **E-commerce**: Validate product images and descriptions for compliance
- **Social Media Managers**: Check posts for policy violations before publishing
- **Designers**: Get AI assistance for creative problem-solving and policy compliance

## 🤝 Contributing

This project welcomes contributions\! Please see our contributing guidelines for details on how to:
- Report bugs and feature requests
- Submit pull requests
- Improve documentation
- Add new policy coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/nerveband/is-content-analyzer/issues)
- **Documentation**: See CLAUDE.md for detailed technical documentation
- **Updates**: Follow the repository for new features and policy updates

---

**Built with ❤️ by Intuitive Solutions**

*Empowering creators with AI-driven content compliance and creative solutions.*
EOF < /dev/null