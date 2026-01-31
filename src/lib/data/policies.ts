import type { PredefinedExclusionTag } from '$lib/types';

export const PREDEFINED_EXCLUSION_TAGS: PredefinedExclusionTag[] = [
  { id: 'religious_holidays', label: 'Religious Holidays & Events' },
  { id: 'cultural_events', label: 'Cultural Celebrations & Events' },
  { id: 'educational_content', label: 'Educational Content & Information' },
  { id: 'public_service_announcements', label: 'Public Service Announcements (PSAs)' },
  { id: 'news_reporting', label: 'News Reporting & Journalism' },
  { id: 'artistic_expression', label: 'Artistic Expression & Performance' },
  { id: 'internal_communications', label: 'Internal Company Communications' },
  { id: 'harmless_stock_imagery', label: 'Generic Stock Imagery (clearly non-problematic)' },
];

export const POLICY_GUIDE = `
# Social Media Content Policy Detection Guide

## Word-Level Restrictions

### Prohibited/High-Risk Words for Ads
Based on major social media advertising policies, flag these categories:

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

This framework should be regularly updated as platform policies evolve, with particular attention to election periods and emerging geopolitical conflicts.
`;

export const POLICY_CATEGORIES = [
  {
    id: 'word-restrictions',
    title: 'Word-Level Restrictions',
    icon: 'type',
    description: 'Prohibited and high-risk words for ads'
  },
  {
    id: 'content-categories',
    title: 'Content Categories',
    icon: 'layers',
    description: 'SIEP and DOI classifications'
  },
  {
    id: 'image-detection',
    title: 'Image Detection',
    icon: 'image',
    description: 'Visual content guidelines'
  },
  {
    id: 'geographic',
    title: 'Geographic Restrictions',
    icon: 'globe',
    description: 'Regional and country-specific rules'
  },
  {
    id: 'authorization',
    title: 'Authorization',
    icon: 'key',
    description: 'Verification and disclaimer requirements'
  },
  {
    id: 'ai-synthetic',
    title: 'AI & Synthetic Media',
    icon: 'sparkles',
    description: 'AI disclosure and deepfake policies'
  },
  {
    id: 'risk-scoring',
    title: 'Risk Scoring',
    icon: 'alert-triangle',
    description: 'High, medium, and low risk classifications'
  }
];
