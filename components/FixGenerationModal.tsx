import React from 'react';
import { XCircleIcon, LoadingSpinner, SparklesIcon, DocumentDuplicateIcon } from './icons';
import { GeneratedImageDisplay } from './GeneratedImageDisplay';
import { ImageHistoryGrid } from './ImageHistoryGrid';
import type { GeneratedFixImage, AnalysisTableItem } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface FixGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImageUrl: string | null;
  currentFixedImage: string | null;
  currentFixPrompt: string;
  isLoadingGeneration: boolean;
  generationError: string | null;
  fixImagesHistory: GeneratedFixImage[];
  targetIssue?: AnalysisTableItem | null;
  isAllIssuesFix?: boolean;
  onGenerateAnother: () => void;
  onClearHistory: () => void;
}

export const FixGenerationModal: React.FC<FixGenerationModalProps> = ({
  isOpen,
  onClose,
  originalImageUrl,
  currentFixedImage,
  currentFixPrompt,
  isLoadingGeneration,
  generationError,
  fixImagesHistory,
  targetIssue,
  isAllIssuesFix = false,
  onGenerateAnother,
  onClearHistory
}) => {
  if (!isOpen) return null;

  const getModalTitle = () => {
    if (isAllIssuesFix) {
      return 'AI-Generated Fix for All Issues';
    } else if (targetIssue) {
      return `AI-Generated Fix for: ${targetIssue.identifiedContent.slice(0, 50)}${targetIssue.identifiedContent.length > 50 ? '...' : ''}`;
    } else {
      return 'AI-Generated Content Fix';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fix-modal-title"
    >
      <div 
        className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-neutral-700">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <div>
              <h2 id="fix-modal-title" className="text-2xl font-semibold text-yellow-400">
                {getModalTitle()}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                AI-powered content remediation using FLUX.1 Kontext
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-800"
            aria-label="Close fix generation modal"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Target Issue Information */}
          {targetIssue && !isAllIssuesFix && (
            <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
              <h3 className="text-lg font-medium text-orange-400 mb-3">Target Issue</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-300">Identified Content:</span>
                  <p className="text-neutral-400 mt-1"><MarkdownRenderer text={targetIssue.identifiedContent} /></p>
                </div>
                <div>
                  <span className="font-medium text-neutral-300">Issue:</span>
                  <p className="text-neutral-400 mt-1"><MarkdownRenderer text={targetIssue.issueDescription} /></p>
                </div>
                <div>
                  <span className="font-medium text-neutral-300">Recommendation:</span>
                  <p className="text-neutral-400 mt-1"><MarkdownRenderer text={targetIssue.recommendation} /></p>
                </div>
              </div>
            </div>
          )}

          {/* Generation Error */}
          {generationError && !isLoadingGeneration && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
              <h4 className="font-medium text-red-300 mb-2">Generation Error</h4>
              <MarkdownRenderer text={generationError} className="text-red-200 text-sm" />
            </div>
          )}

          {/* Loading State */}
          {isLoadingGeneration && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LoadingSpinner className="h-16 w-16 text-purple-400 animate-spin mb-4" />
              <h3 className="text-xl font-medium text-neutral-300 mb-2">
                Generating AI Fix...
              </h3>
              <p className="text-neutral-400">
                Using advanced AI to automatically resolve the policy violation
              </p>
              {currentFixPrompt && (
                <div className="mt-4 p-3 bg-neutral-800 rounded-lg max-w-2xl">
                  <p className="text-xs text-neutral-400 mb-1">AI-Generated Fix Instruction:</p>
                  <p className="text-sm text-purple-300 italic">"{currentFixPrompt}"</p>
                </div>
              )}
            </div>
          )}

          {/* Generated Fix Display */}
          {currentFixedImage && !isLoadingGeneration && (
            <GeneratedImageDisplay
              imageUrl={currentFixedImage}
              prompt={currentFixPrompt}
              originalImageUrl={originalImageUrl}
              onGenerateAnother={onGenerateAnother}
            />
          )}

          {/* Fix History */}
          {fixImagesHistory.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-yellow-400">Fix Generation History</h3>
                <button
                  onClick={onClearHistory}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear History
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fixImagesHistory.map((fix) => (
                  <div 
                    key={fix.id}
                    className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={fix.imageUrl} 
                        alt={`Fix: ${fix.generatedPrompt.slice(0, 50)}...`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-neutral-300 line-clamp-2" title={fix.generatedPrompt}>
                        "{fix.generatedPrompt}"
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{new Date(fix.timestamp).toLocaleDateString()}</span>
                        <span className="uppercase tracking-wide">
                          {fix.modelUsed.replace('flux-kontext-', '')}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          const timestamp = new Date(fix.timestamp).toISOString().slice(0, 19).replace(/[:]/g, '-');
                          const link = document.createElement('a');
                          link.href = fix.imageUrl;
                          link.download = `fixed-image-${timestamp}.png`;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="w-full mt-2 px-2 py-1.5 bg-neutral-700 hover:bg-green-600 text-neutral-300 hover:text-white text-xs rounded transition-colors duration-200 flex items-center justify-center gap-1"
                        aria-label={`Download fixed image: ${fix.generatedPrompt.slice(0, 30)}...`}
                      >
                        <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isLoadingGeneration && !currentFixedImage && !generationError && (
            <div className="text-center py-8">
              <SparklesIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-400 mb-2">
                Ready to Generate AI Fix
              </h3>
              <p className="text-neutral-500">
                Click the generation button to create an AI-powered fix for the identified policy violation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};