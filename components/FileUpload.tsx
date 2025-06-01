import React, { useCallback, useState } from 'react';
import { UploadIcon, DocumentDuplicateIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  }, [onFileSelect, disabled]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-xl cursor-pointer
          transition-colors duration-300 ease-in-out
          ${disabled ? 'bg-neutral-800 border-neutral-700 cursor-not-allowed opacity-70' : 
            isDragging ? 'bg-yellow-700/20 border-yellow-500' : 'bg-neutral-800/70 hover:bg-neutral-700/70 border-neutral-700 hover:border-yellow-600'
          }
        `}
        aria-disabled={disabled}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadIcon className={`w-10 h-10 mb-4 ${disabled ? 'text-neutral-500' : isDragging ? 'text-yellow-300' : 'text-yellow-500'}`} />
          <p className={`mb-2 text-base font-semibold ${disabled ? 'text-neutral-500' : isDragging ? 'text-yellow-200' : 'text-neutral-200'}`}>
            {isDragging ? 'Drop file here' : 'Click to upload or drag & drop'}
          </p>
          <p className={`text-xs mb-1 ${disabled ? 'text-neutral-600' : isDragging ? 'text-yellow-300' : 'text-neutral-400'}`}>
            Image (PNG, JPG, GIF) or Video (MP4, WEBM)
          </p>
          {!disabled && (
            <p className={`text-xs flex items-center ${isDragging ? 'text-yellow-400' : 'text-neutral-500'}`}>
              <DocumentDuplicateIcon className="w-3 h-3 mr-1" /> or paste image (Ctrl/Cmd+V)
            </p>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};