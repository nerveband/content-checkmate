import React, { useEffect, useState, useRef } from 'react';
import { X, Download, ExternalLink, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

interface LightboxImage {
  url: string;
  alt?: string;
  title?: string;
  downloadFilename?: string;
  onDownload?: () => void;
}

interface EnhancedLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  comparisonImage?: string; // Optional image for before/after comparison
  comparisonTitle?: string;
}

export const EnhancedLightbox: React.FC<EnhancedLightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  comparisonImage,
  comparisonTitle
}) => {
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;
  const hasComparison = !!comparisonImage;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'ArrowLeft' && hasMultipleImages) {
          handlePrevious();
        } else if (e.key === 'ArrowRight' && hasMultipleImages) {
          handleNext();
        } else if (e.key === 'c' && hasComparison) {
          setIsComparisonMode(!isComparisonMode);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, hasMultipleImages, hasComparison, isComparisonMode]);

  const handlePrevious = () => {
    if (hasMultipleImages && onIndexChange) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      onIndexChange(newIndex);
    }
  };

  const handleNext = () => {
    if (hasMultipleImages && onIndexChange) {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      onIndexChange(newIndex);
    }
  };

  const handleDownload = () => {
    if (currentImage.onDownload) {
      currentImage.onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = currentImage.downloadFilename || 'image.png';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewInNewTab = () => {
    window.open(currentImage.url, '_blank', 'noopener,noreferrer');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isComparisonMode && containerRef.current) {
      setIsDragging(true);
      updateSliderPosition(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isComparisonMode) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[95vw] max-h-[95vh] bg-neutral-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-4">
              {currentImage.title && (
                <h3 className="text-white text-sm font-medium truncate">
                  {currentImage.title}
                </h3>
              )}
              {hasMultipleImages && (
                <span className="text-neutral-400 text-xs">
                  {currentIndex + 1} of {images.length}
                </span>
              )}
              {hasComparison && (
                <button
                  onClick={() => setIsComparisonMode(!isComparisonMode)}
                  className="flex items-center gap-2 px-3 py-1 bg-neutral-800/80 hover:bg-purple-600 text-white text-xs rounded-md transition-colors"
                  title={`${isComparisonMode ? 'Disable' : 'Enable'} comparison mode (C)`}
                >
                  {isComparisonMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  Compare
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewInNewTab}
                className="p-2 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-md transition-colors"
                title="View in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 bg-neutral-800/80 hover:bg-green-600 text-white rounded-md transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 bg-neutral-800/80 hover:bg-red-600 text-white rounded-md transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Previous image (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Next image (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Container */}
        <div 
          ref={containerRef}
          className="flex items-center justify-center p-8 pt-16 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isComparisonMode ? 'col-resize' : 'default' }}
        >
          {isComparisonMode && comparisonImage ? (
            /* Comparison Mode */
            <div className="relative max-w-full max-h-full">
              {/* Before Image (Comparison) */}
              <img
                src={comparisonImage}
                alt={comparisonTitle || 'Comparison image'}
                className="max-w-full max-h-full object-contain rounded"
                style={{ maxHeight: 'calc(90vh - 8rem)' }}
                draggable={false}
              />
              
              {/* After Image (Current) with Clip Path */}
              <div
                className="absolute inset-0 overflow-hidden rounded"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={currentImage.url}
                  alt={currentImage.alt || 'Current image'}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              
              {/* Slider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-1 h-4 bg-neutral-600"></div>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {comparisonTitle || 'Before'}
              </div>
              <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                After
              </div>
            </div>
          ) : (
            /* Normal Mode */
            <img
              src={currentImage.url}
              alt={currentImage.alt || 'Image'}
              className="max-w-full max-h-full object-contain rounded"
              style={{ maxHeight: 'calc(90vh - 8rem)' }}
            />
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        {(hasMultipleImages || hasComparison) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
              {hasMultipleImages && '← → Navigate'} 
              {hasMultipleImages && hasComparison && ' • '}
              {hasComparison && 'C Compare'}
              {' • Esc Close'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};