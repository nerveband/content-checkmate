
import type { PredefinedExclusionTag } from './types';

// SVG Icons for Policy Guide (simplified, replace with actual good icons)
// Ideally, these would be proper React components in icons.tsx, but for simplicity in constants.ts HTML:
const ICON_STYLE = "w-8 h-8 mr-3 text-yellow-400 flex-shrink-0"; // Adjusted size for bento
const POLICY_WORD_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M12 12h.01M12 12v.01M12 12H9.75M12 12v3.75m0-3.75H9.75m2.25 0v3.75M3.27 15C2.238 15 1.5 14.262 1.5 13.23V10.5c0-1.03 0.738-1.77 1.77-1.77H5.25c1.032 0 1.77.74 1.77 1.77V13.23c0 1.032-0.738 1.77-1.77 1.77H3.27z" /></svg>`;
const POLICY_CATEGORY_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.116-1.003h2.58c.556 0 1.026.46 1.116 1.003l.153.922c.294.12.574.266.84.429l.846-.302c.52-.186 1.082.124 1.23.648l1.29 4.254c.148.523-.14 1.066-.66 1.23l-.846.302c-.036.16-.06.324-.068.49l.01.958c.007.166.03.33.066.49l.848.303c.52.184.808.726.66 1.248l-1.29 4.254c-.148.523-.71.834-1.23.648l-.846-.302a4.013 4.013 0 01-.839.43l-.153.922c-.09.542-.56 1.003-1.116-1.003h-2.58c-.556 0-1.026.46-1.116-1.003l-.153-.922a4.016 4.016 0 01-.84-.429l-.846.302c-.52.186-1.082-.124-1.23-.648l-1.29-4.254c-.148-.523.14-1.066.66-1.23l.846.302c.036-.16.06-.324.068.49l-.01-.958c-.007-.166-.03-.33-.066.49l-.848-.303c-.52-.184-.808-.726-.66-1.248l1.29-4.254c.148.523.71-.834 1.23.648l.846.302a4.013 4.013 0 01.839-.43l.153.922zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>`;
const POLICY_IMAGE_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>`;
const POLICY_GEO_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.356 0 2.673-.174 3.896-.512M12 21c-1.356 0-2.673-.174-3.896-.512M9 9.191A2.255 2.255 0 0112 7.5c.383 0 .738.097 1.04.264M12 7.5v6M15.04 11.736A2.255 2.255 0 0112 13.5c-.383 0-.738-.097-1.04-.264M12 3c2.755 0 5.198.935 7.071 2.429M4.929 5.429A9.962 9.962 0 0112 3m0 18c2.755 0 5.198-.935 7.071-2.429M4.929 18.571A9.962 9.962 0 0112 21M19.071 5.429c1.494 1.872 2.429 4.315 2.429 7.071s-.935 5.198-2.429 7.071M4.929 18.571c-1.494-1.872-2.429-4.315-2.429-7.071s.935 5.198 2.429-7.071" /></svg>`;
const POLICY_ALGORITHM_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15-3.75H3m18 0h-1.5M8.25 21v-1.5M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-.85 0-1.674.146-2.44.413m14.88 0A9.017 9.017 0 0012 3m0 18c.85 0 1.674-.146 2.44-.413M3.56 3.413A9.017 9.017 0 0012 3m0 18a9.017 9.017 0 00-8.44-2.587M20.44 18.587A9.017 9.017 0 0012 21.001M12 8.25v7.5" /></svg>`;
const POLICY_AUTH_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>`;
const POLICY_TIME_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const POLICY_AI_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188V12.001L18.25 12z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 5.25L14 3M12.75 5.25L11.5 3M12.75 21L14 18.75M12.75 21L11.5 18.75M5.25 12.75L3 14M5.25 12.75L3 11.5M21 12.75L18.75 14M21 12.75L18.75 11.5" /></svg>`;
const POLICY_HUMAN_RIGHTS_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.75c2.482 0 4.83-.734 6.796-2.082a10.463 10.463 0 000-15.336A11.91 11.91 0 0012 3c-2.482 0-4.83.734-6.796 2.082a10.463 10.463 0 000 15.336A11.91 11.91 0 0012 21.75zm0 0A9.004 9.004 0 005.284 4.932m13.432 0A9.004 9.004 0 0012 3.001M7.5 10.5a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zm8.25-.75a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H15.75zM7.5 15a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zm8.25-.75a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H15.75z" /></svg>`;
const POLICY_IMPLEMENTATION_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const POLICY_RISK_ICON = `<svg class="${ICON_STYLE}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3v1.5M20.25 3v1.5M3.75 14.25v1.5A2.25 2.25 0 006 18h12a2.25 2.25 0 002.25-2.25v-1.5M12 6.75h.008v.008H12V6.75zm0 3.75h.008v.008H12v-.008zm0 3.75h.008v.008H12V14.25z" /></svg>`;

const SIEP_TOOLTIP = "Social Issues, Elections, or Politics: Content related to these topics often requires special authorization and disclaimers on platforms like Meta.";

// Feature flags
export const FEATURE_FLAGS = {
  // Set to false to disable image editing functionality and AI fix features to control costs
  ENABLE_IMAGE_EDITING: process.env.ENABLE_IMAGE_EDITING !== 'false', // Defaults to true unless explicitly disabled
} as const;

export const PREDEFINED_EXCLUSION_TAGS: PredefinedExclusionTag[] = [
  { id: 'religious_holidays', label: 'Religious Holidays/Events' },
  { id: 'cultural_events', label: 'Cultural Celebrations/Events' },
  { id: 'educational_content', label: 'Educational Content/Information' },
  { id: 'public_service_announcements', label: 'Public Service Announcements (PSAs)' },
  { id: 'news_reporting', label: 'News Reporting/Journalism' },
  { id: 'artistic_expression', label: 'Artistic Expression/Performance' },
  { id: 'internal_communications', label: 'Internal Company Communications' },
  { id: 'harmless_stock_imagery', label: 'Generic Stock Imagery (clearly non-problematic)' },
];

export const POLICY_GUIDE_HTML = `
<div class="policy-guide-content space-y-6">
  <div class="text-center mb-8">
    <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">Meta Content Policy Detection Guide</h2>
    <p class="text-neutral-400 mt-2">A visual breakdown of key policy areas for content analysis.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

    <div class="bento-box">
      <div class="bento-header">${POLICY_WORD_ICON}<span>Word-Level Restrictions</span></div>
      <div class="bento-content">
        <h4>Prohibited/High-Risk Words for Ads</h4>
        <p>Based on Meta's advertising policies, flag these categories:</p>
        <strong>Personal Attributes (Banned from targeting)</strong>
        <ul><li>Race, ethnicity, religion, sexual orientation</li><li>Specific terms: "Catholic Church", "Jewish holidays", "LGBT culture", "same-sex marriage"</li><li>Health conditions: "diabetes awareness", "lung cancer awareness", "chemotherapy"</li></ul>
        <strong>Financial/Scam Indicators</strong>
        <ul><li>"Get rich quick", "work from home", "scam", "pyramid scheme", "MLM"</li><li>"Quick cash", "debt relief", "bankruptcy", "easy money", "overnight success"</li><li>"Miracle", "cure", "illegal drugs", "steroids"</li></ul>
        <strong>Sensitive Content</strong>
        <ul><li>"Pandemic", "corona", "coronavirus", "infection", "disease"</li><li>"Cigarettes", "vaporizers", "guns", "ammunition", "explosives"</li><li>"Gambling", "betting", "casino", "loan sharks"</li></ul>
        <strong>Political/Social Issue Triggers</strong>
        <ul><li>"Politics", "election", "voting", "candidate"</li><li>"Immigration", "civil rights", "social justice"</li><li>"Palestine", "Israel", specific political movements</li><li>"Conspiracy theories", "feminism", "body positivity"</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_CATEGORY_ICON}<span>Content Category Classifications</span></div>
      <div class="bento-content">
        <h4><span title="${SIEP_TOOLTIP}" class="tooltip-trigger">Social Issues, Elections, Politics (SIEP)</span> - Requires <span title="${SIEP_TOOLTIP}" class="tooltip-trigger">Authorization</span></h4>
        <p>Auto-flag content containing these topics:</p>
        <strong>Civil and Social Rights</strong><ul><li>Voting rights advocacy</li><li>Civil rights movements</li><li>Discrimination issues</li><li>LGBTQ+ rights content</li></ul>
        <strong>Immigration</strong><ul><li>Immigration policy discussion</li><li>Border security content</li><li>Refugee/asylum content</li><li>Deportation policies</li></ul>
        <strong>Political Content</strong><ul><li>Electoral advocacy</li><li>Political candidate mentions</li><li>Government policy critique</li><li>Legislative action calls</li></ul>
        <strong>Health and Safety</strong><ul><li>Public health policy</li><li>Healthcare access advocacy</li><li>Environmental health issues</li><li>Drug policy reform</li></ul>
        <h4>Dangerous Organizations and Individuals (DOI)</h4>
        <p>Flag content that:</p>
        <ul><li>Mentions blacklisted political movements</li><li>Shows support for designated terrorist organizations</li><li>Discusses banned political parties (especially Palestinian political groups)</li><li>Contains praise for restricted individuals</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_IMAGE_ICON}<span>Image Detection Guidelines</span></div>
      <div class="bento-content">
        <h4>Prohibited Visual Content</h4>
        <ul><li>Violence or weapons imagery</li><li>Illegal settlement real estate (specific to Israel/Palestine)</li><li>Political rally footage without proper disclaimers</li><li>Misleading before/after images</li><li>AI-generated political content without disclosure</li></ul>
        <h4>Sensitive Visual Categories</h4>
        <ul><li>Protest imagery (may require <span title="${SIEP_TOOLTIP}" class="tooltip-trigger">SIEP authorization</span>)</li><li>Government buildings/officials</li><li>Military/police imagery in political context</li><li>Religious symbols in advertising context</li><li>Flag imagery in political messaging</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_GEO_ICON}<span>Geographic Restrictions</span></div>
      <div class="bento-content">
        <h4>Special Regional Rules</h4>
        <ul><li><strong>Washington State:</strong> No ads about local elections, officials, or Seattle legislation</li><li><strong>Palestine/Israel:</strong> Enhanced scrutiny for all related content</li><li><strong>Election periods:</strong> Blanket restrictions on new political ads during final week</li></ul>
        <h4>Country-Specific Policies</h4>
        <ul><li>EU: Enhanced transparency requirements under DSA</li><li>US: Strict election interference policies</li><li>Brazil/India: Regional political ad restrictions during elections</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_ALGORITHM_ICON}<span>Automated Detection Algorithms</span></div>
      <div class="bento-content">
        <h4>Language-Specific Issues</h4>
        <strong>Arabic Content</strong><ul><li>Higher false positive rates for policy violations</li><li>Over-censorship of Palestinian content</li><li>Mistranslation issues leading to incorrect flags</li></ul>
        <strong>Hebrew Content</strong><ul><li>Under-detection of hostile speech</li><li>Lower enforcement rates for policy violations</li><li>Bias in algorithmic moderation</li></ul>
        <h4>Content Patterns to Flag</h4>
        <ul><li>Calls to action with political messaging</li><li>Fundraising for political causes</li><li>Voter mobilization content</li><li>Social issue advocacy</li></ul>
      </div>
    </div>
    
    <div class="bento-box">
      <div class="bento-header">${POLICY_AUTH_ICON}<span>Authorization Requirements</span></div>
      <div class="bento-content">
        <h4>Mandatory <span title="${SIEP_TOOLTIP}" class="tooltip-trigger">Authorization</span> Triggers</h4>
        <p>Content requiring verified "Paid for by" disclaimers:</p>
        <ul><li>Any political candidate mentions</li><li>Social issue advocacy</li><li>Election-related content</li><li>Civil rights messaging</li><li>Immigration policy discussion</li><li>Health policy advocacy</li></ul>
        <h4>Verification Process Elements</h4>
        <ul><li>Identity verification for advertisers</li><li>Business documentation requirements</li><li>Geographic verification</li><li>Disclaimer placement requirements</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_TIME_ICON}<span>Temporal Restrictions</span></div>
      <div class="bento-content">
        <h4>Election Period Limitations (US)</h4>
        <strong>Pre-Election Week Restrictions</strong>
        <ul><li>No new political ad creative</li><li>No targeting changes</li><li>No bid adjustments</li><li>No campaign objective changes</li></ul>
        <strong>Ongoing Monitoring</strong>
        <ul><li>Real-time fact-checking requirements</li><li>Rapid response for misinformation claims</li><li>Enhanced human review for political content</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_AI_ICON}<span>AI and Synthetic Media Policies</span></div>
      <div class="bento-content">
        <h4>Mandatory Disclosure Requirements</h4>
        <p>Flag content that uses AI/digital manipulation for:</p>
        <ul><li>Realistic depictions of people saying/doing things they didn't</li><li>Realistic-looking people who don't exist</li><li>Realistic events that didn't happen</li><li>Altered footage of real events</li></ul>
        <h4>Detection Priorities</h4>
        <ul><li>Deepfake political content</li><li>Synthetic audio in political ads</li><li>Manipulated images in social issue content</li><li>AI-generated protest/rally footage</li></ul>
      </div>
    </div>
    
    <div class="bento-box">
      <div class="bento-header">${POLICY_HUMAN_RIGHTS_ICON}<span>Human Rights and Conflict Content</span></div>
      <div class="bento-content">
        <h4>Palestine/Israel Specific Rules</h4>
        <ul><li>Enhanced scrutiny for Palestinian political movements</li><li>Automatic flagging of content supporting designated organizations</li><li>Government request compliance tracking (especially Israeli Cyber Unit)</li><li>Newsworthy content exceptions (applied inconsistently)</li></ul>
        <h4>Bias Mitigation Targets</h4>
        <ul><li>Equal enforcement across languages</li><li>Transparent government request handling</li><li>Consistent application of newsworthy exceptions</li><li>Regular audit of automated translation accuracy</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_IMPLEMENTATION_ICON}<span>Implementation Recommendations</span></div>
      <div class="bento-content">
        <h4>Multi-Tier Detection System</h4>
        <ol><li><strong>Keyword scanning</strong> for prohibited terms</li><li><strong>Context analysis</strong> for <span title="${SIEP_TOOLTIP}" class="tooltip-trigger">SIEP</span> categorization</li><li><strong>Image recognition</strong> for sensitive visual content</li><li><strong>Geographic filtering</strong> for regional restrictions</li><li><strong>Temporal monitoring</strong> for election periods</li></ol>
        <h4>Appeal and Review Process</h4>
        <ul><li>Clear reason codes for content restrictions</li><li>Accessible appeal mechanisms</li><li>Human review escalation paths</li><li>Transparency in decision-making</li></ul>
        <h4>Compliance Monitoring</h4>
        <ul><li>Regular policy update integration</li><li>Government request tracking</li><li>Bias detection and mitigation</li><li>User feedback incorporation</li></ul>
      </div>
    </div>

    <div class="bento-box">
      <div class="bento-header">${POLICY_RISK_ICON}<span>Risk Scoring Framework</span></div>
      <div class="bento-content">
        <h4>High Risk (Immediate Flag)</h4>
        <ul><li>Direct political candidate mentions</li><li>Fundraising for political causes</li><li>Voting procedure instructions</li><li>Sensitive geopolitical content</li></ul>
        <h4>Medium Risk (Enhanced Review)</h4>
        <ul><li>Social issue advocacy</li><li>Health policy discussion</li><li>Immigration-related content</li><li>Religious messaging in ads</li></ul>
        <h4>Low Risk (Monitor)</h4>
        <ul><li>General educational content</li><li>Non-political organizational messaging</li><li>Cultural celebration content</li><li>Generic health information</li></ul>
        <p class="mt-4">This framework should be regularly updated as Meta's policies evolve, with particular attention to election periods and emerging geopolitical conflicts.</p>
      </div>
    </div>

  </div>
</div>
<style>
  .policy-guide-content .bento-box {
    @apply bg-neutral-800 p-5 rounded-xl shadow-lg border border-neutral-700 hover:border-yellow-500/70 transition-all duration-300 flex flex-col;
  }
  .policy-guide-content .bento-header {
    @apply flex items-center text-xl font-semibold text-yellow-400 mb-3 pb-2 border-b border-neutral-700;
  }
  .policy-guide-content .bento-content {
    @apply text-neutral-300 text-sm space-y-3 flex-grow;
  }
  .policy-guide-content .bento-content h4 {
    @apply text-base font-semibold text-yellow-300 mt-2 mb-1;
  }
  .policy-guide-content .bento-content strong {
    @apply font-semibold text-amber-400 block mt-2 mb-1; /* Tailwind prose 'strong' might override this, ensure specificity or direct styling */
  }
  .policy-guide-content .bento-content ul, .policy-guide-content .bento-content ol {
    @apply list-inside list-disc pl-4 space-y-1;
  }
  .policy-guide-content .bento-content ol {
    @apply list-decimal;
  }
  .policy-guide-content .bento-content li {
    @apply text-neutral-300;
  }
  .policy-guide-content .bento-content p {
    @apply leading-relaxed;
  }
  .tooltip-trigger {
    text-decoration: underline dotted;
    text-decoration-color: #D4AF37; /* Gold color */
    cursor: help;
  }
</style>
`;

// Keep the old export for any part of the system that might still expect plain text (e.g. the prompt to Gemini)
// The prompt itself needs the raw text, not HTML.
export const POLICY_GUIDE = `
# Meta Content Policy Detection Guide

## Word-Level Restrictions

### Prohibited/High-Risk Words for Ads
Based on Meta's advertising policies, flag these categories:

**Personal Attributes (Banned from targeting)**
- Race, ethnicity, religion, sexual orientation
- Specific terms: "Catholic Church", "Jewish holidays", "LGBT culture", "same-sex marriage"
- Health conditions: "diabetes awareness", "lung cancer awareness", "chemotherapy"

**Financial/Scam Indicators**
- "Get rich quick", "work from home", "scam", "pyramid scheme", "MLM"
- "Quick cash", "debt relief", "bankruptcy", "easy money", "overnight success"
- "Miracle", "cure", "illegal drugs", "steroids"

**Sensitive Content**
- "Pandemic", "corona", "coronavirus", "infection", "disease"
- "Cigarettes", "vaporizers", "guns", "ammunition", "explosives"
- "Gambling", "betting", "casino", "loan sharks"

**Political/Social Issue Triggers**
- "Politics", "election", "voting", "candidate"
- "Immigration", "civil rights", "social justice"
- "Palestine", "Israel", specific political movements
- "Conspiracy theories", "feminism", "body positivity"

## Content Category Classifications

### Social Issues, Elections, Politics (SIEP) - Requires Authorization
Auto-flag content containing these topics:

**Civil and Social Rights**
- Voting rights advocacy
- Civil rights movements
- Discrimination issues
- LGBTQ+ rights content

**Immigration**
- Immigration policy discussion
- Border security content
- Refugee/asylum content
- Deportation policies

**Political Content**
- Electoral advocacy
- Political candidate mentions
- Government policy critique
- Legislative action calls

**Health and Safety**
- Public health policy
- Healthcare access advocacy
- Environmental health issues
- Drug policy reform

### Dangerous Organizations and Individuals (DOI)
Flag content that:
- Mentions blacklisted political movements
- Shows support for designated terrorist organizations
- Discusses banned political parties (especially Palestinian political groups)
- Contains praise for restricted individuals

## Image Detection Guidelines

### Prohibited Visual Content
- Violence or weapons imagery
- Illegal settlement real estate (specific to Israel/Palestine)
- Political rally footage without proper disclaimers
- Misleading before/after images
- AI-generated political content without disclosure

### Sensitive Visual Categories
- Protest imagery (may require SIEP authorization)
- Government buildings/officials
- Military/police imagery in political context
- Religious symbols in advertising context
- Flag imagery in political messaging

## Geographic Restrictions

### Special Regional Rules
- **Washington State**: No ads about local elections, officials, or Seattle legislation
- **Palestine/Israel**: Enhanced scrutiny for all related content
- **Election periods**: Blanket restrictions on new political ads during final week

### Country-Specific Policies
- EU: Enhanced transparency requirements under DSA
- US: Strict election interference policies
- Brazil/India: Regional political ad restrictions during elections

## Automated Detection Algorithms

### Language-Specific Issues
**Arabic Content**
- Higher false positive rates for policy violations
- Over-censorship of Palestinian content
- Mistranslation issues leading to incorrect flags

**Hebrew Content**
- Under-detection of hostile speech
- Lower enforcement rates for policy violations
- Bias in algorithmic moderation

### Content Patterns to Flag
- Calls to action with political messaging
- Fundraising for political causes
- Voter mobilization content
- Social issue advocacy

## Authorization Requirements

### Mandatory Authorization Triggers
Content requiring verified "Paid for by" disclaimers:
- Any political candidate mentions
- Social issue advocacy
- Election-related content
- Civil rights messaging
- Immigration policy discussion
- Health policy advocacy

### Verification Process Elements
- Identity verification for advertisers
- Business documentation requirements
- Geographic verification
- Disclaimer placement requirements

## Temporal Restrictions

### Election Period Limitations (US)
**Pre-Election Week Restrictions**
- No new political ad creative
- No targeting changes
- No bid adjustments
- No campaign objective changes

**Ongoing Monitoring**
- Real-time fact-checking requirements
- Rapid response for misinformation claims
- Enhanced human review for political content

## AI and Synthetic Media Policies

### Mandatory Disclosure Requirements
Flag content that uses AI/digital manipulation for:
- Realistic depictions of people saying/doing things they didn't
- Realistic-looking people who don't exist
- Realistic events that didn't happen
- Altered footage of real events

### Detection Priorities
- Deepfake political content
- Synthetic audio in political ads
- Manipulated images in social issue content
- AI-generated protest/rally footage

## Human Rights and Conflict Content

### Palestine/Israel Specific Rules
- Enhanced scrutiny for Palestinian political movements
- Automatic flagging of content supporting designated organizations
- Government request compliance tracking (especially Israeli Cyber Unit)
- Newsworthy content exceptions (applied inconsistently)

### Bias Mitigation Targets
- Equal enforcement across languages
- Transparent government request handling
- Consistent application of newsworthy exceptions
- Regular audit of automated translation accuracy

## Implementation Recommendations

### Multi-Tier Detection System
1. **Keyword scanning** for prohibited terms
2. **Context analysis** for SIEP categorization  
3. **Image recognition** for sensitive visual content
4. **Geographic filtering** for regional restrictions
5. **Temporal monitoring** for election periods

### Appeal and Review Process
- Clear reason codes for content restrictions
- Accessible appeal mechanisms
- Human review escalation paths
- Transparency in decision-making

### Compliance Monitoring
- Regular policy update integration
- Government request tracking
- Bias detection and mitigation
- User feedback incorporation

## Risk Scoring Framework

### High Risk (Immediate Flag)
- Direct political candidate mentions
- Fundraising for political causes
- Voting procedure instructions
- Sensitive geopolitical content

### Medium Risk (Enhanced Review)
- Social issue advocacy
- Health policy discussion
- Immigration-related content
- Religious messaging in ads

### Low Risk (Monitor)
- General educational content
- Non-political organizational messaging
- Cultural celebration content
- Generic health information

This framework should be regularly updated as Meta's policies evolve, with particular attention to election periods and emerging geopolitical conflicts.
`;
