
import React, { useState } from 'react';
import type { AnalysisResult, AnalysisTableItem, ExcludedItem } from '../types';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, EyeIcon, SparklesIcon, ClockIcon, ClipboardIcon } from './icons';
import { MarkdownRenderer } from './MarkdownRenderer';

type SeverityLevel = 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Compliant' | 'High' | 'Medium' | 'Low' | string | undefined;

interface SeverityStyles {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const severityDefinitions: Record<string, SeverityStyles> = {
  'Compliant': {
    bgColor: 'bg-green-800/40', 
    textColor: 'text-green-300',
    borderColor: 'border-green-600',
    icon: <CheckCircleIcon className="w-7 h-7 text-green-400" />,
    label: 'Compliant'
  },
  'Low Risk': {
    bgColor: 'bg-yellow-700/30', 
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500',
    icon: <InformationCircleIcon className="w-7 h-7 text-yellow-400" />,
    label: 'Low Risk'
  },
  'Low': {
    bgColor: 'bg-yellow-700/30',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500',
    icon: <InformationCircleIcon className="w-5 h-5 text-yellow-400" />,
    label: 'Low'
  },
  'Medium Risk': {
    bgColor: 'bg-orange-700/40', 
    textColor: 'text-orange-300',
    borderColor: 'border-orange-500',
    icon: <ExclamationTriangleIcon className="w-7 h-7 text-orange-400" />,
    label: 'Medium Risk'
  },
  'Medium': {
    bgColor: 'bg-orange-700/40',
    textColor: 'text-orange-300',
    borderColor: 'border-orange-500',
    icon: <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />,
    label: 'Medium'
  },
  'High Risk': {
    bgColor: 'bg-red-700/40',
    textColor: 'text-red-300',
    borderColor: 'border-red-500',
    icon: <ExclamationTriangleIcon className="w-7 h-7 text-red-400" />,
    label: 'High Risk'
  },
  'High': {
    bgColor: 'bg-red-700/40',
    textColor: 'text-red-300',
    borderColor: 'border-red-500',
    icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />,
    label: 'High'
  },
  'default': {
    bgColor: 'bg-neutral-700/30',
    textColor: 'text-neutral-300',
    borderColor: 'border-neutral-500',
    icon: <InformationCircleIcon className="w-7 h-7 text-neutral-400" />,
    label: 'Info'
  }
};

const getSeverityStyles = (severity: SeverityLevel): SeverityStyles => {
  return severityDefinitions[severity || 'default'] || severityDefinitions['default'];
};


const SectionCard: React.FC<{ title: string; severity?: SeverityLevel; children: React.ReactNode; iconOverride?: React.ReactNode; }> = ({ title, severity, children, iconOverride }) => {
  const styles = getSeverityStyles(severity);
  const headerIconNode = iconOverride || (severity ? styles.icon : <InformationCircleIcon className="w-7 h-7 text-yellow-400" />);
  const headerTextColor = severity ? styles.textColor : 'text-yellow-400';
  const cardBorderColor = severity ? styles.borderColor : 'border-neutral-700';


  return (
    <div className={`bg-neutral-800/60 shadow-lg rounded-lg p-6 border-l-4 ${cardBorderColor}`}>
      <div className="flex items-center mb-4">
        {headerIconNode && React.isValidElement(headerIconNode) ? (
          <span className="mr-3">
            {React.cloneElement(headerIconNode as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-7 h-7"})}
          </span>
        ) : headerIconNode ? ( // Fallback for non-element ReactNode (e.g. string), though icons should be elements
          <span className="mr-3">{headerIconNode}</span>
        ) : null}
        <h3 className={`text-2xl font-semibold ${headerTextColor}`}>{title}
         {severity && <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded-full ${styles.bgColor} ${styles.textColor}`}>{styles.label}</span>}
        </h3>
      </div>
      {children}
    </div>
  );
};

const SeverityBadge: React.FC<{ severity: AnalysisTableItem['severity'] }> = ({ severity }) => {
  if (!severity) return null;
  const styles = getSeverityStyles(severity); 
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles.bgColor} ${styles.textColor}`}>
      {React.cloneElement(styles.icon, { className: "w-3.5 h-3.5 mr-1.5" })}
      {styles.label}
    </span>
  );
};

interface AnalysisDisplayProps {
  result: AnalysisResult;
  highlightedIssueId: string | null;
  onHighlightIssue: (id: string | null) => void;
  drawableIssuesMap: Map<string, number>; 
  drawableExcludedMap: Map<string, number>;
  isImageTabActive: boolean;
  onSuggestFix?: (issue: AnalysisTableItem) => void;
  onSuggestAllFixes?: (issues: AnalysisTableItem[]) => void;
  canGenerateFixes?: boolean;
  isVideoAnalysis?: boolean;
  videoSrc?: string;
  onTimestampJump?: (timestamp: number) => void;
}

const CopyableSummary: React.FC<{ summary: string }> = ({ summary }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-yellow-400 flex items-center">
          <ClipboardIcon className="w-5 h-5 mr-2" />
          Summary for Designers/Developers
        </h4>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
            isCopied 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 hover:bg-yellow-500 text-black'
          }`}
          aria-label="Copy summary to clipboard"
        >
          <ClipboardIcon className="w-4 h-4 mr-1.5" />
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-neutral-800 rounded-md p-3 border border-neutral-700">
        <MarkdownRenderer 
          text={summary} 
          className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap"
        />
      </div>
    </div>
  );
};

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TimestampButton: React.FC<{ 
  timestamp: number; 
  onJump: (timestamp: number) => void;
  className?: string;
}> = ({ timestamp, onJump, className = "" }) => (
  <button
    onClick={() => onJump(timestamp)}
    className={`inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors duration-200 ${className}`}
    aria-label={`Jump to ${formatTimestamp(timestamp)}`}
    title={`Click to jump to ${formatTimestamp(timestamp)} in video`}
  >
    <ClockIcon className="w-3 h-3 mr-1" />
    {formatTimestamp(timestamp)}
  </button>
);

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
    result, 
    highlightedIssueId, 
    onHighlightIssue, 
    drawableIssuesMap, 
    drawableExcludedMap,
    isImageTabActive,
    onSuggestFix,
    onSuggestAllFixes,
    canGenerateFixes = false,
    isVideoAnalysis = false,
    onTimestampJump
}) => {
  const hasIssues = result.issuesTable && result.issuesTable.length > 0;
  const hasExcludedItems = result.excludedItemsTable && result.excludedItemsTable.length > 0;
  
  const overallSeverityStyles = getSeverityStyles(result.overallSeverity || (hasIssues ? 'Medium Risk' : 'Compliant'));

  let recommendationsSeverity: SeverityLevel = 'Compliant';
  if (result.overallSeverity === 'High Risk' || result.overallSeverity === 'Medium Risk') {
    recommendationsSeverity = result.overallSeverity;
  } else if (hasIssues) {
    recommendationsSeverity = 'Low Risk';
  }
  const recommendationsSeverityStyles = getSeverityStyles(recommendationsSeverity);
  
  let issuesSectionSeverity: SeverityLevel = 'Compliant';
  if (hasIssues) {
    if (result.issuesTable.some(i => i.severity === 'High')) issuesSectionSeverity = 'High Risk';
    else if (result.issuesTable.some(i => i.severity === 'Medium')) issuesSectionSeverity = 'Medium Risk';
    else issuesSectionSeverity = 'Low Risk';
  }


  return (
    <div className="mt-8 space-y-8">
      <SectionCard 
        title="Overall Assessment" 
        severity={result.overallSeverity || (hasIssues ? 'Medium Risk' : 'Compliant')}
      >
        <MarkdownRenderer 
            text={result.overallAssessment || "No overall assessment provided."} 
            className={`leading-relaxed whitespace-pre-wrap ${overallSeverityStyles.textColor}`}
        />
      </SectionCard>

      <SectionCard 
        title="Recommendations & Feedback"
        severity={recommendationsSeverity}
      >
         <MarkdownRenderer 
            text={result.recommendationsFeedback || (hasIssues ? "Review specific issues below." : "No specific feedback provided. Content appears compliant.")}
            className={`leading-relaxed whitespace-pre-wrap ${recommendationsSeverityStyles.textColor}`}
        />
      </SectionCard>

      {hasIssues ? (
        <SectionCard title="Identified Issues & Suggestions" severity={issuesSectionSeverity}>
          {/* Suggest Fix for All Button */}
          {canGenerateFixes && onSuggestAllFixes && isImageTabActive && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => onSuggestAllFixes(result.issuesTable.filter(issue => issue.sourceContext === 'primaryImage' || issue.sourceContext === 'videoFrame'))}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-purple-500/30 transition-all duration-300 ease-in-out flex items-center justify-center"
                aria-label="Generate AI fixes for all visual issues"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Suggest AI Fix for All Issues
              </button>
            </div>
          )}
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full min-w-[700px] text-sm text-left text-neutral-300">
              <thead className="text-xs text-yellow-300 uppercase bg-neutral-700/80">
                <tr>
                  {isImageTabActive && drawableIssuesMap.size > 0 && <th scope="col" className="px-3 py-3 w-[5%] text-center">#</th>}
                  <th scope="col" className="px-4 py-3 w-[10%]">Severity</th>
                  {isVideoAnalysis && <th scope="col" className="px-4 py-3 w-[10%] text-center">Timestamp</th>}
                  <th scope="col" className="px-6 py-3 w-[25%]">Identified Content</th>
                  <th scope="col" className="px-6 py-3 w-[35%]">Issue Description</th>
                  <th scope="col" className="px-6 py-3 w-[25%]">Recommendation</th>
                  {canGenerateFixes && onSuggestFix && isImageTabActive && (
                    <th scope="col" className="px-4 py-3 rounded-tr-lg w-[10%] text-center">AI Fix</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {result.issuesTable.map((item) => {
                  const itemSeverityStyles = getSeverityStyles(item.severity);
                  const isHighlighted = item.id === highlightedIssueId;
                  const boxDisplayNumber = drawableIssuesMap.get(item.id);
                  const canBeClicked = isImageTabActive && boxDisplayNumber;

                  const rowBgColor = isHighlighted ? 'bg-sky-800/50' : itemSeverityStyles.bgColor;
                  const hoverBgColor = isHighlighted ? 'hover:bg-sky-800/60' : `hover:bg-opacity-60 ${itemSeverityStyles.bgColor.split('/')[0]}`;

                  return (
                    <tr 
                      key={item.id} 
                      id={`issue-row-${item.id}`}
                      className={`border-b border-neutral-700 transition-colors duration-150
                        ${rowBgColor}
                        ${(canBeClicked || item.sourceContext === 'descriptionText' || item.sourceContext === 'ctaText') ? `cursor-pointer ${hoverBgColor}` : `${hoverBgColor}`}
                      `}
                      onClick={() => (canBeClicked || item.sourceContext !== 'videoFrame') ? onHighlightIssue(item.id) : undefined}
                      aria-current={isHighlighted ? "true" : undefined}
                    >
                      {isImageTabActive && drawableIssuesMap.size > 0 && (
                        <td className={`px-3 py-4 text-center font-mono text-xs ${isHighlighted ? 'text-cyan-200 font-bold' : 'text-neutral-400'}`}>
                          {boxDisplayNumber || ''}
                        </td>
                      )}
                      <td className={`px-4 py-4 border-l-4 ${isHighlighted ? 'border-cyan-400' : itemSeverityStyles.borderColor}`}>
                        <SeverityBadge severity={item.severity} />
                      </td>
                      {isVideoAnalysis && (
                        <td className="px-4 py-4 text-center">
                          {item.timestamp !== undefined && item.timestamp !== null && onTimestampJump ? (
                            <TimestampButton 
                              timestamp={item.timestamp} 
                              onJump={onTimestampJump}
                            />
                          ) : (
                            <span className="text-neutral-500 text-xs">N/A</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-neutral-200 whitespace-pre-wrap">
                        {item.imageSnippet && item.sourceContext === 'primaryImage' && (
                          <img 
                            src={item.imageSnippet} 
                            alt="Issue snippet" 
                            className="mb-2 max-w-[80px] max-h-[80px] object-contain border border-neutral-600 rounded-md"
                          />
                        )}
                        <MarkdownRenderer text={item.identifiedContent} />
                        {item.captionText && (
                          <div className="mt-1 text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded">
                            <strong>Caption:</strong> {item.captionText}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap"><MarkdownRenderer text={item.issueDescription} /></td>
                      <td className="px-6 py-4 whitespace-pre-wrap"><MarkdownRenderer text={item.recommendation} /></td>
                      {canGenerateFixes && onSuggestFix && isImageTabActive && (
                        <td className="px-4 py-4 text-center">
                          {(item.sourceContext === 'primaryImage' || item.sourceContext === 'videoFrame') ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSuggestFix(item);
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center justify-center mx-auto"
                              aria-label={`Suggest AI fix for: ${item.identifiedContent.slice(0, 50)}`}
                            >
                              <SparklesIcon className="h-3.5 w-3.5 mr-1" />
                              Fix
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-500">N/A</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            {result.issuesTable.map((item) => {
              const itemSeverityStyles = getSeverityStyles(item.severity);
              const isHighlighted = item.id === highlightedIssueId;
              const boxDisplayNumber = drawableIssuesMap.get(item.id);
              const canBeClicked = isImageTabActive && boxDisplayNumber;

              const cardBgColor = isHighlighted ? 'bg-sky-700/40' : itemSeverityStyles.bgColor;
              const cardBorderColor = isHighlighted ? 'border-cyan-400' : itemSeverityStyles.borderColor;

              return (
                <div 
                  key={item.id} 
                  id={`issue-card-${item.id}`}
                  className={`p-4 rounded-lg border-l-4 shadow-md transition-colors duration-150
                    ${cardBgColor} ${cardBorderColor}
                    ${(canBeClicked || item.sourceContext === 'descriptionText' || item.sourceContext === 'ctaText') ? 'cursor-pointer hover:bg-opacity-70' : 'hover:bg-opacity-70'}
                  `}
                  onClick={() => (canBeClicked || item.sourceContext !== 'videoFrame') ? onHighlightIssue(item.id) : undefined}
                  aria-current={isHighlighted ? "true" : undefined}
                >
                  <div className="flex justify-between items-start mb-2">
                    <SeverityBadge severity={item.severity} />
                    <div className="flex items-center gap-2">
                      {isVideoAnalysis && item.timestamp !== undefined && item.timestamp !== null && onTimestampJump && (
                        <TimestampButton 
                          timestamp={item.timestamp} 
                          onJump={onTimestampJump}
                        />
                      )}
                      {isImageTabActive && boxDisplayNumber && (
                        <span className={`font-mono text-sm px-2 py-0.5 rounded
                          ${isHighlighted ? 'bg-cyan-500 text-black font-bold' : 'bg-neutral-600 text-yellow-300'}`}>
                          # {boxDisplayNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong className="block text-sm font-semibold text-yellow-300">Identified:</strong>
                     {item.imageSnippet && item.sourceContext === 'primaryImage' && (
                        <img 
                            src={item.imageSnippet} 
                            alt="Issue snippet" 
                            className="mt-1 mb-2 max-w-[100px] max-h-[100px] object-contain border border-neutral-600 rounded-md"
                        />
                     )}
                    <MarkdownRenderer text={item.identifiedContent} className="text-neutral-200 whitespace-pre-wrap text-sm" />
                    {item.captionText && (
                      <div className="mt-1 text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded">
                        <strong>Caption:</strong> {item.captionText}
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <strong className="block text-sm font-semibold text-yellow-300">Issue:</strong>
                    <MarkdownRenderer text={item.issueDescription} className="text-neutral-300 whitespace-pre-wrap text-sm" />
                  </div>
                  <div>
                    <strong className="block text-sm font-semibold text-yellow-300">Recommendation:</strong>
                    <MarkdownRenderer text={item.recommendation} className="text-neutral-300 whitespace-pre-wrap text-sm" />
                  </div>
                  {canGenerateFixes && onSuggestFix && isImageTabActive && (item.sourceContext === 'primaryImage' || item.sourceContext === 'videoFrame') && (
                    <div className="mt-4 pt-3 border-t border-neutral-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSuggestFix(item);
                        }}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center"
                        aria-label={`Suggest AI fix for: ${item.identifiedContent.slice(0, 50)}`}
                      >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Suggest AI Fix
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Identified Issues & Suggestions" severity={'Compliant'}>
           <p className="text-neutral-300">No policy violations or major issues were identified in the content. Looks good!</p>
        </SectionCard>
      )}

      {hasExcludedItems && (
         <SectionCard 
            title="Content Categorized by Exclusion Rules" 
            iconOverride={<EyeIcon className="w-7 h-7 text-sky-400" />} 
            // No severity prop here, as this section is informational
         >
          {/* Desktop Table View for Excluded Items */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full min-w-[700px] text-sm text-left text-neutral-300">
              <thead className="text-xs text-sky-300 uppercase bg-neutral-700/80">
                <tr>
                  {isImageTabActive && drawableExcludedMap.size > 0 && <th scope="col" className="px-3 py-3 w-[5%] text-center">#</th>}
                  {isVideoAnalysis && <th scope="col" className="px-4 py-3 w-[10%] text-center">Timestamp</th>}
                  <th scope="col" className="px-6 py-3 w-[25%]">Identified Content</th>
                  <th scope="col" className="px-6 py-3 w-[30%]">Matched Rule</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-lg w-[40%]">AI Note / Context</th>
                </tr>
              </thead>
              <tbody>
                {result.excludedItemsTable!.map((item) => {
                  const isHighlighted = item.id === highlightedIssueId;
                  const boxDisplayNumber = drawableExcludedMap.get(item.id);
                  const canBeClicked = isImageTabActive && boxDisplayNumber;

                  // Neutral informational colors (sky blue/teal)
                  const rowBgColor = isHighlighted ? 'bg-cyan-700/50' : 'bg-sky-800/30'; // Using cyan for highlighted for distinction
                  const hoverBgColor = isHighlighted ? 'hover:bg-cyan-700/60' : 'hover:bg-sky-800/40';
                  const borderColor = isHighlighted ? 'border-cyan-400' : 'border-sky-600';


                  return (
                    <tr 
                      key={item.id} 
                      id={`excluded-row-${item.id}`}
                      className={`border-b border-neutral-700 transition-colors duration-150
                        ${rowBgColor}
                        ${(canBeClicked || item.sourceContext === 'descriptionText' || item.sourceContext === 'ctaText') ? `cursor-pointer ${hoverBgColor}` : `${hoverBgColor}`}
                      `}
                      onClick={() => (canBeClicked || item.sourceContext !== 'videoFrame') ? onHighlightIssue(item.id) : undefined}
                      aria-current={isHighlighted ? "true" : undefined}
                    >
                      {isImageTabActive && drawableExcludedMap.size > 0 && (
                        <td className={`px-3 py-4 text-center font-mono text-xs ${isHighlighted ? 'text-cyan-200 font-bold' : 'text-neutral-400'}`}>
                          {boxDisplayNumber ? `E${boxDisplayNumber}` : ''}
                        </td>
                      )}
                      {isVideoAnalysis && (
                        <td className="px-4 py-4 text-center">
                          {item.timestamp !== undefined && item.timestamp !== null && onTimestampJump ? (
                            <TimestampButton 
                              timestamp={item.timestamp} 
                              onJump={onTimestampJump}
                            />
                          ) : (
                            <span className="text-neutral-500 text-xs">N/A</span>
                          )}
                        </td>
                      )}
                       <td className={`px-6 py-4 font-medium text-neutral-200 whitespace-pre-wrap border-l-4 ${borderColor}`}>
                        {item.imageSnippet && item.sourceContext === 'primaryImage' && (
                          <img 
                            src={item.imageSnippet} 
                            alt="Excluded item snippet" 
                            className="mb-2 max-w-[80px] max-h-[80px] object-contain border border-neutral-600 rounded-md"
                          />
                        )}
                        <MarkdownRenderer text={item.identifiedContent} />
                        {item.captionText && (
                          <div className="mt-1 text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded">
                            <strong>Caption:</strong> {item.captionText}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap"><MarkdownRenderer text={item.matchedRule} /></td>
                      <td className="px-6 py-4 whitespace-pre-wrap"><MarkdownRenderer text={item.aiNote} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View for Excluded Items */}
          <div className="space-y-4 md:hidden">
            {result.excludedItemsTable!.map((item) => {
              const isHighlighted = item.id === highlightedIssueId;
              const boxDisplayNumber = drawableExcludedMap.get(item.id);
              const canBeClicked = isImageTabActive && boxDisplayNumber;
              
              // Neutral informational colors
              const cardBgColor = isHighlighted ? 'bg-cyan-700/40' : 'bg-sky-800/30';
              const cardBorderColor = isHighlighted ? 'border-cyan-400' : 'border-sky-600';

              return (
                <div 
                  key={item.id} 
                  id={`excluded-card-${item.id}`}
                  className={`p-4 rounded-lg border-l-4 shadow-md transition-colors duration-150
                    ${cardBgColor} ${cardBorderColor}
                    ${(canBeClicked || item.sourceContext === 'descriptionText' || item.sourceContext === 'ctaText') ? 'cursor-pointer hover:bg-opacity-70' : 'hover:bg-opacity-70'}
                  `}
                  onClick={() => (canBeClicked || item.sourceContext !== 'videoFrame') ? onHighlightIssue(item.id) : undefined}
                  aria-current={isHighlighted ? "true" : undefined}
                >
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-sm font-medium text-sky-300">Excluded Item</span>
                     <div className="flex items-center gap-2">
                       {isVideoAnalysis && item.timestamp !== undefined && item.timestamp !== null && onTimestampJump && (
                         <TimestampButton 
                           timestamp={item.timestamp} 
                           onJump={onTimestampJump}
                         />
                       )}
                       {isImageTabActive && boxDisplayNumber && (
                        <span className={`font-mono text-sm px-2 py-0.5 rounded
                          ${isHighlighted ? 'bg-cyan-500 text-black font-bold' : 'bg-neutral-600 text-sky-300'}`}>
                          # E{boxDisplayNumber}
                        </span>
                      )}
                     </div>
                  </div>
                  <div className="mb-2">
                    <strong className="block text-sm font-semibold text-sky-300">Identified:</strong>
                     {item.imageSnippet && item.sourceContext === 'primaryImage' && (
                        <img 
                            src={item.imageSnippet} 
                            alt="Excluded item snippet" 
                            className="mt-1 mb-2 max-w-[100px] max-h-[100px] object-contain border border-neutral-600 rounded-md"
                        />
                     )}
                    <MarkdownRenderer text={item.identifiedContent} className="text-neutral-200 whitespace-pre-wrap text-sm" />
                    {item.captionText && (
                      <div className="mt-1 text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded">
                        <strong>Caption:</strong> {item.captionText}
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <strong className="block text-sm font-semibold text-sky-300">Matched Rule:</strong>
                    <MarkdownRenderer text={item.matchedRule} className="text-neutral-300 whitespace-pre-wrap text-sm" />
                  </div>
                  <div>
                    <strong className="block text-sm font-semibold text-sky-300">AI Note:</strong>
                    <MarkdownRenderer text={item.aiNote} className="text-neutral-300 whitespace-pre-wrap text-sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Copyable Summary Section */}
      {result.summaryForCopy && (
        <CopyableSummary summary={result.summaryForCopy} />
      )}

    </div>
  );
};
