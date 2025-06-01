import React, { useState } from 'react';
import { SparklesIcon, DocumentDuplicateIcon } from './icons';
import { downloadImage } from '../services/fluxService';
import { EnhancedLightbox } from './EnhancedLightbox';

interface GeneratedImageDisplayProps {
  imageUrl: string | null;
  prompt: string;
  originalImageUrl?: string | null;
  isLoading?: boolean;
  onGenerateAnother: () => void;
  onDownload?: () => void;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({
  imageUrl,
  prompt,
  originalImageUrl,
  isLoading = false,
  onGenerateAnother,
  onDownload
}) => {
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  const handleDownload = async () => {
    if (imageUrl) {
      if (onDownload) {
        onDownload();
      } else {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
        await downloadImage(imageUrl, `ai-edited-image-${timestamp}.png`);
      }
    }
  };

  const handleImageClick = (index: number) => {
    setLightboxImageIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxImageIndex(null);
  };

  // Create lightbox images array
  const lightboxImages = [];
  if (originalImageUrl) {
    lightboxImages.push({
      url: originalImageUrl,
      alt: 'Original image',
      title: 'Original Image'
    });
  }
  if (imageUrl) {
    lightboxImages.push({
      url: imageUrl,
      alt: 'AI generated edited image',
      title: `AI Generated: ${prompt}`,
      downloadFilename: `ai-edited-image-${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.png`,
      onDownload: handleDownload
    });
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="text-center">
        <h4 className="text-xl font-semibold text-yellow-400 mb-4">Generated Result</h4>
        
        {/* Side-by-side comparison for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {originalImageUrl && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-neutral-300">Original</h5>
              <div 
                className="border-2 border-neutral-700 rounded-lg overflow-hidden cursor-pointer hover:border-neutral-500 transition-colors"
                onClick={() => handleImageClick(0)}
              >
                <img 
                  src={originalImageUrl} 
                  alt="Original image" 
                  className="w-full h-auto object-contain max-h-80 hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-yellow-400">AI Generated</h5>
            <div 
              className="border-2 border-yellow-500/50 rounded-lg overflow-hidden cursor-pointer hover:border-yellow-400 transition-colors"
              onClick={() => handleImageClick(originalImageUrl ? 1 : 0)}
            >
              <img 
                src={imageUrl} 
                alt="AI generated edited image" 
                className="w-full h-auto object-contain max-h-80 hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        </div>

        {/* Prompt used */}
        <div className="mt-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700 max-w-2xl mx-auto">
          <p className="text-xs text-neutral-400 mb-1">Editing Instructions Used:</p>
          <p className="text-sm text-neutral-200 italic">"{prompt}"</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-md hover:shadow-green-500/30 transition-all duration-300 ease-in-out flex items-center justify-center"
          aria-label="Download generated image"
        >
          <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
          Download Image
        </button>
        
        <button
          onClick={onGenerateAnother}
          disabled={isLoading}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg shadow-md hover:shadow-purple-500/30 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Generate another variation"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Generate Another
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-neutral-500">
          Tip: Click on any image to view full size • Each generation creates a unique variation
        </p>
      </div>

      {/* Enhanced Lightbox */}
      {lightboxImageIndex !== null && (
        <EnhancedLightbox
          isOpen={true}
          onClose={handleCloseLightbox}
          images={lightboxImages}
          currentIndex={lightboxImageIndex}
          onIndexChange={setLightboxImageIndex}
          comparisonImage={originalImageUrl && lightboxImageIndex === 1 ? originalImageUrl : undefined}
          comparisonTitle={originalImageUrl && lightboxImageIndex === 1 ? "Original" : undefined}
        />
      )}
    </div>
  );
};