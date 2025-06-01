
import React, { useState } from 'react';
import { AlertTriangle, Shield, Eye, Globe, Clock, Bot, Target, ExternalLink, ChevronDown, ChevronRight, Search, ThumbsUp, ThumbsDown, Info, ChevronUp } from 'lucide-react';

// Define severity icons using lucide-react
const severityIconsLucide = {
  high: <ThumbsDown className="w-4 h-4 text-red-400" />,
  medium: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  low: <Info className="w-4 h-4 text-yellow-400" />
};

interface BannedWordItem {
  word: string;
  category: string;
  severity: "high" | "medium" | "low";
  recommendation?: string;
}


const PolicyGuide: React.FC = () => {
  const sectionIds = ['banned', 'siep', 'visual', 'geo', 'ai', 'pipeline', 'riskAssessment'];
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    // Initially expand some key sections for better UX
    banned: true,
    riskAssessment: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    sectionIds.forEach(id => allExpanded[id] = true);
    setExpandedSections(allExpanded);
  };
  
  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    sectionIds.forEach(id => allCollapsed[id] = false);
    setExpandedSections(allCollapsed);
  };

  const bannedWords: BannedWordItem[] = [
    // Personal targeting
    { word: "You/Your (direct addressing)", category: "personal", severity: "medium", recommendation: "Rephrase to avoid directly addressing the user's personal attributes." },
    { word: "Race (e.g., 'Black community')", category: "discrimination", severity: "high", recommendation: "Remove specific mentions of race, especially in targeting." },
    { word: "Religion (e.g., 'Christian singles')", category: "discrimination", severity: "high", recommendation: "Avoid targeting or referencing specific religions." },
    { word: "Age (e.g., 'for seniors')", category: "discrimination", severity: "high", recommendation: "Remove age-based targeting or direct callouts unless compliant with policies." },
    { word: "Gender identification", category: "discrimination", severity: "high", recommendation: "Avoid targeting based on gender identity." },
    { word: "Sexual orientation (e.g., 'LGBTQ+ events')", category: "discrimination", severity: "high", recommendation: "Do not target or make assumptions about sexual orientation." },
    
    // Health & Body
    { word: "Diet (e.g., 'keto diet plan')", category: "health", severity: "medium", recommendation: "Focus on healthy lifestyle rather than specific diets; avoid guarantees." },
    { word: "Weight loss (e.g., 'lose belly fat')", category: "health", severity: "medium", recommendation: "Avoid unrealistic claims or focusing on negative self-perception." },
    { word: "Fat (as descriptor for people)", category: "health", severity: "medium", recommendation: "Refrain from using 'fat' to describe body types in a negative way." },
    { word: "Depression (medical claims)", category: "health", severity: "high", recommendation: "Do not make medical claims or imply treatment for depression." },
    { word: "Anxiety (medical claims)", category: "health", severity: "high", recommendation: "Avoid claims of curing or treating anxiety disorders." },
    { word: "Stress (as medical condition)", category: "health", severity: "medium", recommendation: "Be cautious with 'stress'; avoid implying medical treatment." },
    { word: "Miracle (health claims)", category: "health", severity: "high", recommendation: "Remove words like 'miracle' for health or product claims." },
    { word: "Cure (for diseases)", category: "health", severity: "high", recommendation: "Do not claim to 'cure' diseases or conditions." },
    { word: "Body positivity (if linked to unrealistic claims)", category: "health", severity: "low", recommendation: "Ensure 'body positivity' messages are not tied to misleading product claims." },
    
    // Financial scams
    { word: "Earn (unrealistic amounts)", category: "financial", severity: "medium", recommendation: "Provide realistic earning potentials; avoid guarantees of high income." },
    { word: "Get rich quick", category: "financial", severity: "high", recommendation: "Remove 'get rich quick' and similar phrases implying easy wealth." },
    { word: "Work from home (if promising high income)", category: "financial", severity: "medium", recommendation: "Be transparent about 'work from home' opportunities; avoid overpromising income." },
    { word: "Scam", category: "financial", severity: "high", recommendation: "Avoid any language that could be perceived as promoting a 'scam'." },
    { word: "Pyramid scheme", category: "financial", severity: "high", recommendation: "Do not promote 'pyramid schemes' or similar business models." },
    { word: "MLM (Multi-Level Marketing, if deceptive)", category: "financial", severity: "high", recommendation: "Ensure 'MLM' ads are transparent and not deceptive." },
    { word: "Easy money", category: "financial", severity: "high", recommendation: "Remove claims of 'easy money' or effortless financial gain." },
    { word: "Overnight success", category: "financial", severity: "high", recommendation: "Avoid promises of 'overnight success'." },
    { word: "Ponzi scheme", category: "financial", severity: "high", recommendation: "Do not promote 'Ponzi schemes'." },
    { word: "Quick cash", category: "financial", severity: "high", recommendation: "Remove offers of 'quick cash' if misleading or predatory." },
    { word: "Debt relief (if predatory)", category: "financial", severity: "medium", recommendation: "Ensure 'debt relief' services are not predatory and are clearly explained." },
    { word: "Bankruptcy (if exploitative)", category: "financial", severity: "medium", recommendation: "Handle mentions of 'bankruptcy' sensitively and non-exploitatively." },
    { word: "Loan sharks", category: "financial", severity: "high", recommendation: "Do not promote or associate with 'loan sharks' or predatory lending." },
    { word: "High-risk investment (without disclaimers)", category: "financial", severity: "medium", recommendation: "Provide clear disclaimers for 'high-risk investments'." },
    
    // Prohibited products
    { word: "Cigarettes", category: "products", severity: "high", recommendation: "Remove all mentions and imagery of 'cigarettes'." },
    { word: "Vaporizers / Vapes", category: "products", severity: "high", recommendation: "Remove all mentions and imagery of 'vaporizers' and e-cigarettes." },
    { word: "Guns / Firearms", category: "products", severity: "high", recommendation: "Remove promotion of 'guns' and firearms unless for permitted accessories with strict targeting." },
    { word: "Ammunition", category: "products", severity: "high", recommendation: "Remove promotion of 'ammunition'." },
    { word: "Explosives", category: "products", severity: "high", recommendation: "Remove promotion of 'explosives'." },
    { word: "Illegal drugs (e.g., 'buy marijuana')", category: "products", severity: "high", recommendation: "Remove any mention or depiction of 'illegal drugs'." },
    { word: "Steroids (non-prescribed)", category: "products", severity: "high", recommendation: "Remove promotion of non-prescribed 'steroids'." },
    
    // COVID-19 related (if making unsubstantiated claims or exploiting crisis)
    { word: "Pandemic (exploitative context)", category: "covid", severity: "medium", recommendation: "Avoid exploiting the 'pandemic' for commercial gain; ensure information is accurate." },
    { word: "Corona/Coronavirus (exploitative context)", category: "covid", severity: "medium", recommendation: "Use 'coronavirus' terms responsibly and avoid misinformation or exploitation." },
    { word: "Infection (misleading info)", category: "covid", severity: "medium", recommendation: "Do not spread misleading information about 'infection' rates or treatments." },
    { word: "Disease (misleading info)", category: "covid", severity: "medium", recommendation: "Provide accurate and non-sensationalized information about 'disease'." },
    { word: "Social distance (if used in harmful ways)", category: "covid", severity: "low", recommendation: "Use 'social distance' messaging constructively." },
    { word: "Confirmed case (privacy issues)", category: "covid", severity: "medium", recommendation: "Respect privacy regarding 'confirmed cases'." },
    { word: "Positive case (privacy issues)", category: "covid", severity: "medium", recommendation: "Respect privacy regarding 'positive cases'." },
    
    // Political/Social (often requires authorization, can be high risk if divisive)
    { word: "Politics (if SIEP and not authorized)", category: "political", severity: "high", recommendation: "Obtain authorization for ads related to 'politics', elections, or social issues." },
    { word: "Conspiracy theories", category: "political", severity: "high", recommendation: "Remove any content promoting 'conspiracy theories'." },
    { word: "Feminism (if used in hate speech)", category: "political", severity: "medium", recommendation: "Ensure discussions of 'feminism' are respectful and not hate speech." },
    
    // Gambling
    { word: "Gambling (if not authorized/targeted)", category: "gambling", severity: "high", recommendation: "Obtain authorization and use appropriate targeting for 'gambling' ads." },
    { word: "Betting (if not authorized/targeted)", category: "gambling", severity: "high", recommendation: "Comply with all policies for 'betting' advertisements." },
    { word: "Casino (if not authorized/targeted)", category: "gambling", severity: "high", recommendation: "Follow specific 'casino' advertising guidelines and authorizations." },
    
    // Emotional triggers (used excessively or deceptively)
    { word: "Fear", category: "emotional", severity: "medium", recommendation: "Avoid using 'fear'-mongering tactics in advertising." },
    { word: "Shock", category: "emotional", severity: "medium", recommendation: "Refrain from using 'shock' value content excessively or gratuitously." },
    { word: "Aggressive (language)", category: "emotional", severity: "medium", recommendation: "Use moderate and respectful language; avoid 'aggressive' tones." },
    { word: "STOP (in all caps, sensational)", category: "emotional", severity: "medium", recommendation: "Avoid sensational use of 'STOP' or similar capitalized exclamations." },
    
    // Adult content
    { word: "Sexual (explicit)", category: "adult", severity: "high", recommendation: "Remove explicitly 'sexual' content and imagery." },
    { word: "Intimate (explicit)", category: "adult", severity: "high", recommendation: "Avoid explicitly 'intimate' or suggestive content." },
    { word: "Profanity / Swear words", category: "adult", severity: "medium", recommendation: "Remove or minimize 'profanity' and strong swear words." },
    
    // Misleading
    { word: "Illegal", category: "misleading", severity: "high", recommendation: "Do not promote anything 'illegal' or imply illegality." },
    { word: "Forbidden", category: "misleading", severity: "medium", recommendation: "Avoid using 'forbidden' in a sensational or misleading way." },
    { word: "Dangerous (claims)", category: "misleading", severity: "medium", recommendation: "Ensure claims about products/services are not 'dangerous' or unverified." },
    { word: "Unauthorized (claims)", category: "misleading", severity: "high", recommendation: "Do not make 'unauthorized' claims or impersonate." },
    { word: "Misleading (general)", category: "misleading", severity: "high", recommendation: "Ensure all ad content is truthful and not 'misleading'." },
    { word: "Deceptive", category: "misleading", severity: "high", recommendation: "Avoid any 'deceptive' practices or statements." },
    { word: "Fraud", category: "misleading", severity: "high", recommendation: "Do not engage in or promote 'fraud'." },
    
    // Platform specific (usually for branding/impersonation)
    { word: "Facebook / Meta (impersonation)", category: "platform", severity: "medium", recommendation: "Do not impersonate 'Facebook', 'Meta', or other brands." },
    { word: "Copyright (infringement implied)", category: "platform", severity: "medium", recommendation: "Respect 'copyright' and intellectual property rights." }
  ];


  const filteredWords = bannedWords.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.recommendation && item.recommendation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categoryColors: Record<string, string> = {
    personal: "bg-sky-700/40 text-sky-300 border-sky-600",
    discrimination: "bg-red-700/50 text-red-200 border-red-500",
    health: "bg-orange-700/40 text-orange-300 border-orange-500",
    financial: "bg-amber-600/40 text-amber-200 border-amber-500",
    products: "bg-purple-700/40 text-purple-300 border-purple-500",
    covid: "bg-teal-700/40 text-teal-300 border-teal-500",
    political: "bg-indigo-700/40 text-indigo-300 border-indigo-500",
    gambling: "bg-pink-700/40 text-pink-300 border-pink-500",
    emotional: "bg-neutral-600/50 text-neutral-300 border-neutral-500",
    adult: "bg-rose-700/50 text-rose-200 border-rose-500",
    misleading: "bg-yellow-600/40 text-yellow-200 border-yellow-500",
    platform: "bg-cyan-700/40 text-cyan-300 border-cyan-500"
  };

  const Section: React.FC<{title: string; sectionId: string; icon: React.ReactNode; children: React.ReactNode; defaultExpanded?: boolean}> = 
    ({title, sectionId, icon, children, defaultExpanded}) => {
      const isExpanded = expandedSections[sectionId] ?? defaultExpanded ?? false;
      return (
        <div className="bg-neutral-800 rounded-lg shadow-md border border-neutral-700 overflow-hidden">
          <button
            onClick={() => toggleSection(sectionId)}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-700/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            aria-expanded={isExpanded}
            aria-controls={`${sectionId}-content`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <h2 className="text-lg sm:text-xl font-semibold text-yellow-400">{title}</h2>
            </div>
            {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
          </button>
          
          <div 
            id={`${sectionId}-content`}
            className={`px-4 sm:px-6 pb-5 border-t border-neutral-700 ${ isExpanded ? '' : 'hidden'}`}
          >
              {children}
          </div>
        </div>
      );
    };

  return (
    <div className="text-neutral-200">
      
      {/* Header */}
      <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-5 sm:p-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mb-2">Meta Content Policy Guide</h1>
        <p className="text-neutral-400 mb-4 text-sm sm:text-base">Quick reference for ad compliance and content moderation.</p>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <a href="https://transparency.meta.com/policies/ad-standards/" 
               className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-black text-xs sm:text-sm rounded-md hover:bg-yellow-500 transition-colors"
               target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Official Standards
            </a>
            <a href="https://www.facebook.com/business/help/488043719226449" 
               className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-700 text-neutral-200 text-xs sm:text-sm rounded-md hover:bg-neutral-600 transition-colors border border-neutral-600"
               target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Help Center
            </a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs sm:text-sm bg-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-600 border border-neutral-600 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs sm:text-sm bg-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-600 border border-neutral-600 transition-colors"
            >
              <ChevronUp className="w-4 h-4" /> {/* Changed to ChevronUp for collapse all */}
              Collapse All
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5"> 
      
        <Section title="Detection Pipeline" sectionId="pipeline" icon={<Bot className="w-5 h-5 text-cyan-400" />} defaultExpanded={expandedSections.pipeline ?? false}>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {[
                { step: "1. Keyword Scan", status: "Auto", color: "green" },
                { step: "2. Context Analysis", status: "AI", color: "blue" },
                { step: "3. Image Check", status: "AI", color: "blue" },
                { step: "4. Geo Filter", status: "Auto", color: "green" },
                { step: "5. Human Review", status: "Manual", color: "purple" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700/70 rounded-md border border-neutral-600">
                  <span className="font-medium text-neutral-200">{item.step}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${
                    item.color === 'green' ? 'bg-green-600/30 text-green-300' :
                    item.color === 'blue' ? 'bg-sky-600/30 text-sky-300' :
                    'bg-purple-600/30 text-purple-300'
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
        </Section>

        <Section title="Risk Level Guide" sectionId="riskAssessment" icon={<Target className="w-5 h-5 text-yellow-300" />} defaultExpanded={expandedSections.riskAssessment ?? true}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-red-800/30 rounded-lg border border-red-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-300 flex items-center"><ThumbsDown className="w-4 h-4 mr-2" />HIGH RISK</span>
                <span className="text-xs bg-red-600/50 text-red-200 px-2 py-1 rounded">Manual Review</span>
              </div>
              <p className="text-sm text-red-300/90">Political content, discrimination, illegal products, direct health claims.</p>
            </div>
            
            <div className="p-4 bg-orange-800/40 rounded-lg border border-orange-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-orange-300 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" />MEDIUM RISK</span>
                <span className="text-xs bg-orange-600/50 text-orange-200 px-2 py-1 rounded">Enhanced Check</span>
              </div>
              <p className="text-sm text-orange-300/90">Health suggestions, financial opportunities, COVID-19 context.</p>
            </div>
            
            <div className="p-4 bg-green-800/40 rounded-lg border border-green-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-green-300 flex items-center"><Info className="w-4 h-4 mr-2" />LOW RISK</span>
                <span className="text-xs bg-green-600/50 text-green-200 px-2 py-1 rounded">Auto Review</span>
              </div>
              <p className="text-sm text-green-300/90">General content, education, entertainment, brand mentions.</p>
            </div>
          </div>
        </Section>

        <Section title="Banned & Restricted Words" sectionId="banned" icon={<AlertTriangle className="w-5 h-5 text-red-400" />} defaultExpanded={expandedSections.banned ?? true}>
            <div className="relative mt-4 mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search words, categories, or recommendations..."
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-600 rounded-lg bg-neutral-700 text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search banned and restricted words"
              />
            </div>
            <p className="text-xs text-neutral-400 mb-3">Displaying {filteredWords.length} of {bannedWords.length} keywords. Severity: {severityIconsLucide.high} High, {severityIconsLucide.medium} Medium, {severityIconsLucide.low} Low.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredWords.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col p-3 rounded-md border ${categoryColors[item.category] || 'bg-neutral-600/50 text-neutral-300 border-neutral-500'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{item.word}</span>
                    <span className="ml-2 flex-shrink-0">{severityIconsLucide[item.severity as keyof typeof severityIconsLucide]}</span>
                  </div>
                  {item.recommendation && (
                    <p className="text-xs text-neutral-300/80 mt-1 leading-tight">
                      <strong className="text-amber-400">{item.recommendation.split(' ')[0]}</strong> {item.recommendation.substring(item.recommendation.indexOf(' ') + 1)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {filteredWords.length === 0 && (
              <p className="text-center text-neutral-400 py-8">No words found matching "{searchTerm}"</p>
            )}
        </Section>

        <Section title="SIEP Authorization Required" sectionId="siep" icon={<Shield className="w-5 h-5 text-sky-400" />} defaultExpanded={expandedSections.siep ?? false}>
            <p className="text-neutral-300 mt-4 mb-4 text-sm">Social Issues, Elections, and Politics (SIEP) content needs pre-approval and "Paid for by" disclaimers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">Political Content Examples:</h3>
                <ul className="space-y-1 text-neutral-300/90 list-disc list-inside">
                  <li>Elections and candidates</li>
                  <li>Voting rights and procedures</li>
                  <li>Government policy discussions</li>
                  <li>Legislative advocacy</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">Social Issue Examples:</h3>
                <ul className="space-y-1 text-neutral-300/90 list-disc list-inside">
                  <li>Civil rights advocacy (discrimination, equality)</li>
                  <li>LGBTQ+ rights</li>
                  <li>Immigration policy</li>
                  <li>Environmental issues & climate change</li>
                  <li>Gun control</li>
                </ul>
              </div>
            </div>
            <div className="bg-sky-800/30 border border-sky-700 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-sky-300 mb-2">Key Authorization Requirements:</h4>
              <ul className="space-y-1 text-sm text-sky-300/90 list-disc list-inside">
                <li>Advertiser identity verification</li>
                <li>Business documentation (if applicable)</li>
                <li>Clear and accurate "Paid for by" disclaimers</li>
                <li>Geographic targeting compliance for disclaimers</li>
              </ul>
            </div>
        </Section>

        <Section title="Visual Content Detection" sectionId="visual" icon={<Eye className="w-5 h-5 text-orange-400" />} defaultExpanded={expandedSections.visual ?? false}>
            <p className="text-neutral-300 mt-4 mb-4 text-sm">AI analyzes images and videos for policy violations. Context is key.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-orange-800/30 border border-orange-700 rounded-lg p-4">
                <h3 className="font-semibold text-orange-300 mb-2">Often Prohibited Imagery:</h3>
                <ul className="space-y-1 text-neutral-300/90 list-disc list-inside">
                  <li>Explicit violence or gore</li>
                  <li>Weapons shown in a threatening manner</li>
                  <li>Sexually explicit or overly suggestive content</li>
                  <li>Misleading before/after images (e.g., health, finance)</li>
                  <li>Undisclosed AI-generated realistic people/events in ads</li>
                  <li>Political rallies without disclaimers (if SIEP)</li>
                </ul>
              </div>
              <div className="bg-amber-800/30 border border-amber-700 rounded-lg p-4">
                <h3 className="font-semibold text-amber-300 mb-2">Sensitive / Restricted Categories:</h3>
                <ul className="space-y-1 text-neutral-300/90 list-disc list-inside">
                  <li>Protest imagery (may require SIEP authorization)</li>
                  <li>Images of government buildings/officials in political ads</li>
                  <li>Religious symbols in ads (can be sensitive)</li>
                  <li>Political flags and symbols (can be SIEP)</li>
                  <li>Sensational or shocking imagery</li>
                  <li>Low-quality, blurry, or pixelated images</li>
                </ul>
              </div>
            </div>
        </Section>

        <Section title="Location & Time Restrictions" sectionId="geo" icon={<Globe className="w-5 h-5 text-purple-400" />} defaultExpanded={expandedSections.geo ?? false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm">
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Key Geographic Rules Examples:
                </h3>
                <div className="space-y-2">
                  <div className="bg-purple-800/30 rounded p-3 border border-purple-700">
                    <div className="font-medium text-purple-300">Washington State (USA)</div>
                    <div className="text-xs text-purple-300/80">Specific restrictions on local election ads.</div>
                  </div>
                  <div className="bg-red-800/30 rounded p-3 border border-red-700">
                    <div className="font-medium text-red-300">Palestine/Israel Conflict Zones</div>
                    <div className="text-xs text-red-300/80">Enhanced scrutiny for all content, potential for over-moderation.</div>
                  </div>
                  <div className="bg-sky-800/30 rounded p-3 border border-sky-700">
                    <div className="font-medium text-sky-300">EU Regions (DSA)</div>
                    <div className="text-xs text-sky-300/80">Enhanced transparency and ad library requirements.</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Key Timeline Rules Examples:
                </h3>
                <div className="space-y-2">
                  <div className="bg-red-800/30 rounded p-3 border border-red-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-red-300">Election "Quiet Periods" (varies by region)</span>
                      <span className="text-xs bg-red-600/50 text-red-200 px-2 py-1 rounded">FREEZE</span>
                    </div>
                    <div className="text-xs text-red-300/80">Restrictions on new political/social issue ads or major edits.</div>
                  </div>
                  <div className="bg-sky-800/30 rounded p-3 border border-sky-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sky-300">Ongoing Monitoring</span>
                       <span className="text-xs bg-sky-600/50 text-sky-200 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                    <div className="text-xs text-sky-300/80">Real-time checks for misinformation, especially during sensitive events.</div>
                  </div>
                </div>
              </div>
            </div>
        </Section>

        <Section title="AI Detection & Known Issues" sectionId="ai" icon={<Bot className="w-5 h-5 text-indigo-400" />} defaultExpanded={expandedSections.ai ?? false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="bg-indigo-800/30 border border-indigo-700 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-300 mb-2">AI-Generated Content Policy:</h3>
                <p className="text-neutral-300/90 mb-2">Must disclose if using AI for ads to create or alter:</p>
                <ul className="space-y-1 text-neutral-300/80 list-disc list-inside">
                  <li>Photorealistic people who don't exist</li>
                  <li>Realistic events that didn't happen</li>
                  <li>Altered footage of real events (making people say/do things they didn't)</li>
                </ul>
              </div>
              <div className="bg-orange-800/30 border border-orange-700 rounded-lg p-4">
                <h3 className="font-semibold text-orange-300 mb-2">Arabic Language Content:</h3>
                <p className="text-neutral-300/90">Reports suggest higher false positive rates for policy violations, potentially due to nuances and dialectal variations. Over-censorship of certain Palestinian content has been a concern.</p>
                <p className="text-xs text-orange-400 mt-2">Recommendation: Be extra clear, consider simpler phrasing. Manual review might be needed more often.</p>
              </div>
              <div className="bg-teal-800/30 border border-teal-700 rounded-lg p-4">
                <h3 className="font-semibold text-teal-300 mb-2">Hebrew Language Content:</h3>
                <p className="text-neutral-300/90">Reports suggest potential under-detection of hostile speech or content that might violate policies if translated or understood in full context by human reviewers.</p>
                <p className="text-xs text-teal-400 mt-2">Recommendation: Adhere strictly to policies; do not assume leniency.</p>
              </div>
            </div>
        </Section>
      </div> {/* End main content sections wrapper */}

      {/* Footer */}
      <div className="bg-neutral-800 rounded-lg p-4 mt-8 text-center border border-neutral-700">
        <p className="text-xs text-neutral-400">
          <span className="font-medium text-yellow-500">Disclaimer:</span> This guide is for informational purposes and is based on publicly available information about Meta's policies. Policies change frequently.
          <br />
          <strong className="text-amber-400">Always consult official Meta documentation for the most current and authoritative guidance.</strong>
        </p>
      </div>

    </div>
  );
};

export default PolicyGuide;
