
import React, { useState } from 'react';
import type { PredefinedExclusionTag } from '../types';
import { AdjustmentsVerticalIcon } from './icons'; 
import { ChevronDown, ChevronUp } from 'lucide-react'; 

interface ExclusionRulesInputsProps {
  selectedExclusionTags: Set<string>;
  customExclusions: string;
  onTagChange: (tagId: string) => void;
  onCustomChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  predefinedTags: PredefinedExclusionTag[];
  disabled?: boolean;
  idSuffix: string; 
}

export const ExclusionRulesInputs: React.FC<ExclusionRulesInputsProps> = ({
  selectedExclusionTags,
  customExclusions,
  onTagChange,
  onCustomChange,
  predefinedTags,
  disabled,
  idSuffix,
}) => {
  const [isExpanded, setIsExpanded] = useState(false); 
  const customExclusionInputId = `custom-exclusions-input-${idSuffix}`;
  const contentId = `exclusion-rules-content-${idSuffix}`;

  return (
    <div className="mt-6 pt-6 border-t border-neutral-700/60">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 p-2 text-left text-neutral-100 hover:bg-neutral-700/50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        aria-label={isExpanded ? "Collapse exclusion rules for this analysis" : "Expand exclusion rules for this analysis"}
      >
        <h3 className="text-lg font-semibold text-yellow-300 flex items-center pointer-events-none"> {/* pointer-events-none so h3 doesn't interfere with button clicks */}
          <AdjustmentsVerticalIcon className="w-5 h-5 mr-2 text-yellow-400" />
          Exclusion Rules for this Analysis
        </h3>
        <span className="text-neutral-400 pointer-events-none"> {/* pointer-events-none so span doesn't interfere */}
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      
      <p className="text-xs text-neutral-400 mb-4">
        Define content to be categorized separately by the AI. These rules apply only to the current analysis.
      </p>

      {isExpanded && (
        <div id={contentId} className="space-y-5 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Predefined Exclusion Tags:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2.5">
              {predefinedTags.map(tag => (
                <label key={tag.id} className={`flex items-center space-x-2.5 text-sm text-neutral-200 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:text-yellow-300'}`}>
                  <input
                    type="checkbox"
                    checked={selectedExclusionTags.has(tag.id)}
                    onChange={() => onTagChange(tag.id)}
                    className="h-4 w-4 rounded border-neutral-500 text-yellow-500 focus:ring-offset-neutral-800 focus:ring-yellow-500 bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                    aria-labelledby={`tag-label-${tag.id}-${idSuffix}`}
                  />
                  <span id={`tag-label-${tag.id}-${idSuffix}`}>{tag.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor={customExclusionInputId} className="block text-sm font-medium text-neutral-300 mb-1.5">Custom Exclusions (one phrase or keyword per line):</label>
            <textarea
              id={customExclusionInputId}
              rows={3}
              value={customExclusions}
              onChange={onCustomChange}
              placeholder="e.g., Company Anniversary Sale Reminder&#10;Happy Birthday Message (Internal)"
              className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-100 text-sm placeholder-neutral-500 disabled:opacity-60 disabled:bg-neutral-700/50 disabled:cursor-not-allowed"
              disabled={disabled}
              aria-label="Custom exclusions for this analysis"
            />
          </div>
          <p className="text-xs text-neutral-500 pt-1">
            Changes to these rules will affect the next analysis. If an analysis result is already displayed, use the "Re-run Analysis" button to apply new rules.
          </p>
        </div>
      )}
      {/* 
        The 'animate-fadeIn' class used above for the animation needs to be defined globally for the animation to work.
        Example CSS for 'animate-fadeIn':
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        This CSS can be added to an index.html <style> tag or a global CSS file.
      */}
    </div>
  );
};
