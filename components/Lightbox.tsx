import React, { useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
  title?: string;
  onDownload?: () => void;
  downloadFilename?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt = "Image",
  title,
  onDownload,
  downloadFilename
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = downloadFilename || 'image.png';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewInNewTab = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] bg-neutral-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-white text-sm font-medium truncate pr-4">
                  {title}
                </h3>
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

        {/* Image */}
        <div className="flex items-center justify-center p-8 pt-16">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain rounded"
            style={{ maxHeight: 'calc(90vh - 8rem)' }}
          />
        </div>
      </div>
    </div>
  );
};