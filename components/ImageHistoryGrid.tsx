import React from 'react';
import { DocumentDuplicateIcon, Trash2Icon } from './icons';
import { downloadImage } from '../services/fluxService';
import type { GeneratedImage } from '../types';

interface ImageHistoryGridProps {
  images: GeneratedImage[];
  onClearHistory: () => void;
}

export const ImageHistoryGrid: React.FC<ImageHistoryGridProps> = ({
  images,
  onClearHistory
}) => {
  const handleDownload = (image: GeneratedImage) => {
    const timestamp = new Date(image.timestamp).toISOString().slice(0, 19).replace(/[:]/g, '-');
    downloadImage(image.imageUrl, `ai-edited-${timestamp}.png`);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-yellow-400">Generation History</h4>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded-md text-xs text-white transition-colors"
          aria-label="Clear all generated images"
          title="Clear History"
        >
          <Trash2Icon className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden hover:border-yellow-500/50 transition-all duration-200 group"
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden">
              <img 
                src={image.imageUrl} 
                alt={`Generated: ${image.prompt.slice(0, 50)}...`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Prompt (truncated) */}
              <p className="text-xs text-neutral-300 line-clamp-2" title={image.prompt}>
                "{image.prompt}"
              </p>
              
              {/* Metadata */}
              <div className="flex flex-col gap-1 text-xs text-neutral-500">
                <span title={formatTimestamp(image.timestamp)}>
                  {new Date(image.timestamp).toLocaleDateString()}
                </span>
                <span className="uppercase tracking-wide">
                  {image.modelUsed.replace('flux-kontext-', '')}
                </span>
              </div>
              
              {/* Download button */}
              <button
                onClick={() => handleDownload(image)}
                className="w-full mt-2 px-2 py-1.5 bg-neutral-700 hover:bg-green-600 text-neutral-300 hover:text-white text-xs rounded transition-colors duration-200 flex items-center justify-center gap-1"
                aria-label={`Download image: ${image.prompt.slice(0, 30)}...`}
              >
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-neutral-500">
          {images.length} image{images.length !== 1 ? 's' : ''} generated • Click on any image to download
        </p>
      </div>
    </div>
  );
};