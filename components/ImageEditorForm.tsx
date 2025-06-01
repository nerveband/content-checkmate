import React from 'react';
import { FileUpload } from './FileUpload';
import { LoadingSpinner, SparklesIcon } from './icons';
import type { FluxModelName } from '../types';

interface ImageEditorFormProps {
  uploadedImageFile: File | null;
  uploadedImagePreview: string | null;
  editingPrompt: string;
  selectedFluxModel: FluxModelName;
  isLoadingGeneration: boolean;
  onFileSelect: (file: File) => void;
  onPromptChange: (prompt: string) => void;
  onModelChange: (model: FluxModelName) => void;
  onGenerate: () => void;
  disabled?: boolean;
}

const FLUX_MODELS: { id: FluxModelName; name: string; description: string }[] = [
  { 
    id: 'flux-kontext-pro', 
    name: 'FLUX.1 Kontext Pro', 
    description: 'High-quality image editing with excellent detail preservation' 
  },
  { 
    id: 'flux-kontext-max', 
    name: 'FLUX.1 Kontext Max', 
    description: 'Maximum quality image editing for professional results' 
  }
];

export const ImageEditorForm: React.FC<ImageEditorFormProps> = ({
  uploadedImageFile,
  uploadedImagePreview,
  editingPrompt,
  selectedFluxModel,
  isLoadingGeneration,
  onFileSelect,
  onPromptChange,
  onModelChange,
  onGenerate,
  disabled = false
}) => {
  const canGenerate = uploadedImageFile && editingPrompt.trim() && !isLoadingGeneration;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">AI Image Editor</h3>
        <p className="text-neutral-400 text-sm mb-6">
          Upload an image and describe how you'd like to modify it. Our AI will generate an edited version based on your instructions.
        </p>
      </div>

      <FileUpload 
        onFileSelect={onFileSelect} 
        disabled={disabled || isLoadingGeneration}
        acceptedTypes="image/*"
        maxSizeMB={10}
        dropzoneText="Drop an image here or click to upload"
        helperText="Supports JPG, PNG, WebP up to 10MB"
      />

      {uploadedImagePreview && (
        <div className="text-center">
          <h4 className="text-lg font-medium text-yellow-400 mb-3">Original Image</h4>
          <div className="inline-block border-2 border-neutral-700 rounded-lg overflow-hidden">
            <img 
              src={uploadedImagePreview} 
              alt="Original image to edit" 
              className="max-w-full max-h-80 object-contain"
            />
          </div>
          {uploadedImageFile && (
            <p className="text-xs text-neutral-500 mt-2">
              {uploadedImageFile.name} • {(uploadedImageFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="editing-prompt" className="block text-sm font-medium text-neutral-300 mb-2">
          <SparklesIcon className="w-4 h-4 inline mr-1 align-text-bottom text-yellow-400"/>
          Editing Instructions
        </label>
        <textarea
          id="editing-prompt"
          rows={4}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-200 placeholder-neutral-500 text-sm disabled:opacity-70 disabled:bg-neutral-700/50"
          placeholder="Describe how you want to modify the image... (e.g., 'Change the background to a sunny beach', 'Remove the person from the image', 'Make the lighting more dramatic')"
          value={editingPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={disabled || isLoadingGeneration}
          aria-label="Image editing instructions"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Be specific about what you want to change. The AI works best with clear, detailed instructions.
        </p>
      </div>

      <div>
        <label htmlFor="flux-model-select" className="block text-sm font-medium text-neutral-300 mb-2">
          AI Model
        </label>
        <select
          id="flux-model-select"
          value={selectedFluxModel}
          onChange={(e) => onModelChange(e.target.value as FluxModelName)}
          className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-200 text-sm disabled:opacity-70"
          disabled={disabled || isLoadingGeneration}
          aria-label="Select FLUX model"
        >
          {FLUX_MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
      </div>

      <div className="text-center">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || disabled}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-purple-500/30 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center mx-auto"
          aria-live="polite"
          title={!canGenerate ? "Please upload an image and provide editing instructions" : "Generate edited image"}
        >
          {isLoadingGeneration ? (
            <>
              <LoadingSpinner className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Edited Image
            </>
          )}
        </button>
        {!canGenerate && !isLoadingGeneration && (
          <p className="mt-2 text-xs text-neutral-400">
            {!uploadedImageFile ? "Upload an image to get started" : 
             !editingPrompt.trim() ? "Provide editing instructions" : ""}
          </p>
        )}
      </div>
    </div>
  );
};