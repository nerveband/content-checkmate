
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeContent } from './services/geminiService';
import { POLICY_GUIDE, PREDEFINED_EXCLUSION_TAGS } from './constants';
import PolicyGuide from './components/PolicyGuide';
import type { AnalysisResult, FileType, AnalysisTableItem, ExcludedItem } from './types';
import { 
  LoadingSpinner, ErrorIcon, FilmIcon, PencilSquareIcon, MegaphoneIcon, PhotoIcon, 
  ChatBubbleBottomCenterTextIcon, ClipboardDocumentListIcon, XCircleIcon, CogIcon, Trash2Icon, AdjustmentsHorizontalIcon
} from './components/icons';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { GoogleGenAI } from '@google/genai';
import { ExclusionRulesInputs } from './components/ExclusionRulesInputs';


type ActiveTab = 'mediaAndText' | 'textOnly' | 'policyGuide';

type ModelName =
  | 'gemini-2.5-pro-preview-05-06'
  | 'gemini-2.5-flash-preview-05-20'
  | 'gemini-2.5-flash-preview-04-17'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite';

const AVAILABLE_MODELS: { id: ModelName; name: string; note?: string, suitableForAnalysis: boolean }[] = [
  { 
    id: 'gemini-2.5-pro-preview-05-06', 
    name: 'Gemini 2.5 Pro (Preview 05-06)', 
    note: 'Most capable advanced multimodal model.', 
    suitableForAnalysis: true 
  },
  { 
    id: 'gemini-2.5-flash-preview-05-20', 
    name: 'Gemini 2.5 Flash (Preview 05-20)', 
    note: 'Latest advanced multimodal, fast and efficient.', 
    suitableForAnalysis: true 
  },
  { 
    id: 'gemini-2.5-flash-preview-04-17', 
    name: 'Gemini 2.5 Flash (Preview 04-17)', 
    note: 'Advanced multimodal, fast and efficient.', 
    suitableForAnalysis: true 
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    note: 'Fast and versatile multimodal model.',
    suitableForAnalysis: true
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    note: 'Lighter, faster version for simpler tasks.',
    suitableForAnalysis: true
  }
];

const getInitialModel = (): ModelName => {
  const savedModel = localStorage.getItem('selectedApiModel') as ModelName | null;
  if (savedModel && AVAILABLE_MODELS.some(m => m.id === savedModel)) {
    return savedModel;
  }
  return 'gemini-2.5-flash-preview-05-20'; // New default model
};

// Exclusions are no longer loaded from localStorage by default
// const getInitialSelectedExclusionTags = (): Set<string> => {
//   const saved = localStorage.getItem('selectedExclusionTags');
//   if (saved) {
//     try {
//       const parsed = JSON.parse(saved);
//       if (Array.isArray(parsed)) {
//         return new Set(parsed.filter(tagId => PREDEFINED_EXCLUSION_TAGS.some(t => t.id === tagId)));
//       }
//     } catch (e) {
//       console.error("Error parsing selectedExclusionTags from localStorage", e);
//     }
//   }
//   return new Set<string>();
// };

// const getInitialCustomExclusions = (): string => {
//   return localStorage.getItem('customExclusions') || '';
// };


const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

async function generateImageSnippet(
  fullImageBase64: string, // This must be the dataURL (e.g., "data:image/png;base64,...")
  box: { x_min: number; y_min: number; x_max: number; y_max: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context for snippet'));
        return;
      }

      const sourceX = box.x_min * img.naturalWidth;
      const sourceY = box.y_min * img.naturalHeight;
      let snippetWidth = (box.x_max - box.x_min) * img.naturalWidth;
      let snippetHeight = (box.y_max - box.y_min) * img.naturalHeight;

      if (snippetWidth <= 0 || snippetHeight <= 0) {
        console.warn("Invalid bounding box dimensions for snippet, resolving with empty data URL.", box);
        canvas.width = 1;
        canvas.height = 1;
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0,0,1,1);
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      
      canvas.width = snippetWidth;
      canvas.height = snippetHeight;

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        snippetWidth, 
        snippetHeight, 
        0, 0,
        snippetWidth, 
        snippetHeight 
      );
      resolve(canvas.toDataURL('image/png')); 
    };
    img.onerror = (err) => {
      console.error('Failed to load image for snippet generation:', err);
      reject(new Error('Failed to load image for snippet generation'));
    };
    img.src = fullImageBase64;
  });
}


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mediaAndText');
  const [selectedModel, setSelectedModel] = useState<ModelName>(getInitialModel()); 
  
  const [genAIClient, setGenAIClient] = useState<GoogleGenAI | null>(null);
  const [currentApiKeyStatus, setCurrentApiKeyStatus] = useState<'built-in' | 'custom' | 'none'>('none');
  const [customApiKeyInput, setCustomApiKeyInput] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);


  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // For image DataURL or video thumbnail DataURL
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string | null>(null);
  
  const [mediaUserDescription, setMediaUserDescription] = useState<string>('');
  const [mediaUserCta, setMediaUserCta] = useState<string>('');

  const [textOnlyDescription, setTextOnlyDescription] = useState<string>('');
  const [textOnlyCta, setTextOnlyCta] = useState<string>('');
  
  const [mediaBase64Data, setMediaBase64Data] = useState<string | null>(null); 
  const [isProcessingPreview, setIsProcessingPreview] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; naturalWidth: number; naturalHeight: number } | null>(null);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);
  const [drawableIssuesMap, setDrawableIssuesMap] = useState<Map<string, number>>(new Map());
  const [drawableExcludedMap, setDrawableExcludedMap] = useState<Map<string, number>>(new Map());

  // Exclusion state is now local to the component, not persisted in localStorage by default.
  const [selectedExclusionTags, setSelectedExclusionTags] = useState<Set<string>>(new Set());
  const [customExclusions, setCustomExclusions] = useState<string>('');
  const [exclusionsChangedSinceLastAnalysis, setExclusionsChangedSinceLastAnalysis] = useState<boolean>(false);


  const currentSelectedModelDetails = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const getEffectiveApiKey = useCallback((): { key: string | null, source: 'custom' | 'built-in' | 'none' } => {
    const customKey = localStorage.getItem('customGeminiApiKey');
    if (customKey && customKey.trim() !== "") {
      return { key: customKey, source: 'custom' };
    }
    const envKey = process.env.API_KEY;
    if (envKey && envKey !== "MISSING_API_KEY" && envKey.trim() !== "") {
      return { key: envKey, source: 'built-in' };
    }
    return { key: null, source: 'none' };
  }, []);

  useEffect(() => {
    const { key, source } = getEffectiveApiKey();
    setCurrentApiKeyStatus(source);
    setCustomApiKeyInput(localStorage.getItem('customGeminiApiKey') || '');

    if (key) {
      try {
        setGenAIClient(new GoogleGenAI({ apiKey: key }));
        setAnalysisError(null); 
      } catch (e: any) {
        console.error("Error initializing GoogleGenAI with key:", e);
        setGenAIClient(null);
        setCurrentApiKeyStatus('none');
        setAnalysisError(`Error initializing AI client: ${e.message}. Please check the API key.`);
      }
    } else {
      setGenAIClient(null);
      setAnalysisError("API Key is not configured. Please set a custom key in Settings or ensure a built-in key is available.");
    }
  }, [getEffectiveApiKey]);


  useEffect(() => {
    if (isLoadingAnalysis && analysisStartTime) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - analysisStartTime) / 1000));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isLoadingAnalysis, analysisStartTime]);
  
  useEffect(() => {
    if (analysisResult && fileType === 'image') {
      const newIssuesMap = new Map<string, number>();
      let issuesCounter = 1;
      analysisResult.issuesTable?.forEach(issue => {
        if (issue.sourceContext === 'primaryImage' && issue.boundingBox) {
          newIssuesMap.set(issue.id, issuesCounter++);
        }
      });
      setDrawableIssuesMap(newIssuesMap);

      const newExcludedMap = new Map<string, number>();
      let excludedCounter = 1;
      analysisResult.excludedItemsTable?.forEach(item => {
        if (item.sourceContext === 'primaryImage' && item.boundingBox) {
            newExcludedMap.set(item.id, excludedCounter++);
        }
      });
      setDrawableExcludedMap(newExcludedMap);

    } else {
      setDrawableIssuesMap(new Map());
      setDrawableExcludedMap(new Map());
    }
  }, [analysisResult, fileType]);

  const resetFileState = (clearAlsoMediaText: boolean = false) => {
    setUploadedFile(null);
    setFilePreview(null);
    setFileType(null);
    setFileSize(null);
    setVideoDuration(null);
    setIsProcessingPreview(false);
    setMediaBase64Data(null);
    setAnalysisResult(null);
    setImageDimensions(null);
    setHighlightedIssueId(null);
    setDrawableIssuesMap(new Map());
    setDrawableExcludedMap(new Map());
    // Do not reset exclusions here as they are part of the form fields now
    if (clearAlsoMediaText) {
      setMediaUserDescription('');
      setMediaUserCta('');
    }
  };
  
  const clearMediaUserDescription = () => setMediaUserDescription('');
  const clearMediaUserCta = () => setMediaUserCta('');
  const clearTextOnlyDescription = () => {
    setTextOnlyDescription('');
    setAnalysisResult(null); 
  }
  const clearTextOnlyCta = () => {
    setTextOnlyCta('');
    setAnalysisResult(null);
  }

  const extractFirstVideoFrame = useCallback(async (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectURL = URL.createObjectURL(videoFile);
      video.src = objectURL;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.1, video.duration / 2); 
      };

      video.onseeked = () => {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          reject(new Error('Failed to get video dimensions for preview frame.'));
          URL.revokeObjectURL(objectURL);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          reject(new Error('Failed to get canvas context for preview frame.'));
        }
        URL.revokeObjectURL(objectURL);
      };

      video.onerror = (e) => {
        console.error("Video error for preview:", e, video.error);
        reject(new Error('Error loading video for preview frame extraction.'));
        URL.revokeObjectURL(objectURL);
      };
    });
  }, []);


  const handleFileSelect = useCallback(async (file: File) => {
    resetFileState(true); 
    setAnalysisResult(null);
    setExclusionsChangedSinceLastAnalysis(false); // Reset on new file
    setIsProcessingPreview(true); 
    setUploadedFile(file);
    setFileSize(formatBytes(file.size));
    setImageDimensions(null); 

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onloadend = () => {
        const result = reader.result as string;
        setFilePreview(result); 
        setMediaBase64Data(result.split(',')[1]); 
        setIsProcessingPreview(false);
      };
      reader.onerror = () => {
        setAnalysisError('Error reading image file.');
        setIsProcessingPreview(false);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
      
      try {
        const thumbnailDataUrl = await extractFirstVideoFrame(file);
        setFilePreview(thumbnailDataUrl);
      } catch (thumbError: any) {
        setAnalysisError(`Error generating video thumbnail: ${thumbError.message}`);
      }

      reader.onloadend = () => {
        const result = reader.result as string;
        setMediaBase64Data(result.split(',')[1]); 
        const videoElementForDuration = document.createElement('video');
        videoElementForDuration.src = result; 
        videoElementForDuration.onloadedmetadata = () => {
          setVideoDuration(formatDuration(videoElementForDuration.duration));
           setIsProcessingPreview(false); 
        };
        videoElementForDuration.onerror = () => {
            setAnalysisError('Error getting video duration from loaded data.');
            setIsProcessingPreview(false);
        }
      };
      reader.onerror = () => {
        setAnalysisError('Error reading video file for analysis.');
        setIsProcessingPreview(false);
      };
      reader.readAsDataURL(file); 
    } else {
      setAnalysisError('Unsupported file type. Please upload an image or video.');
      resetFileState(); 
    }
  }, [extractFirstVideoFrame]);


  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (activeTab !== 'mediaAndText' || isLoadingAnalysis || isProcessingPreview) return; 

      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const fileName = `pasted-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
              const file = new File([blob], fileName, { type: blob.type });
              handleFileSelect(file);
            }
            event.preventDefault(); 
            return;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleFileSelect, isLoadingAnalysis, isProcessingPreview, activeTab]);


  const handleAnalyze = useCallback(async () => {
    if (!genAIClient) {
      setAnalysisError("API Key is not configured or AI Client not initialized. Analysis cannot proceed.");
      return;
    }
    if (!currentSelectedModelDetails.suitableForAnalysis) {
      setAnalysisError(`The selected model (${currentSelectedModelDetails.name}) is not suitable for policy analysis.`);
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setHighlightedIssueId(null); 
    setDrawableIssuesMap(new Map()); 
    setDrawableExcludedMap(new Map());
    setAnalysisStartTime(Date.now());
    setElapsedTime(0);
    
    setExclusionsChangedSinceLastAnalysis(false);


    let finalMediaDataToSend: string | null = null; 
    let finalMimeType: string | null = null;
    let descriptionToSend: string | undefined = undefined;
    let ctaToSend: string | undefined = undefined;
    let isVideoAnalysis = false;

    if (activeTab === 'mediaAndText') {
        descriptionToSend = mediaUserDescription.trim() ? mediaUserDescription : undefined;
        ctaToSend = mediaUserCta.trim() ? mediaUserCta : undefined;

        if (uploadedFile && fileType && mediaBase64Data) {
            finalMediaDataToSend = mediaBase64Data;
            finalMimeType = uploadedFile.type; 
            isVideoAnalysis = fileType === 'video';
        }
        if (!finalMediaDataToSend && !descriptionToSend && !ctaToSend) {
            setAnalysisError('In Media & Text tab: Please upload a file or enter a description/CTA to analyze.');
            setIsLoadingAnalysis(false);
            setAnalysisStartTime(null);
            return;
        }
    } else if (activeTab === 'textOnly') { 
        descriptionToSend = textOnlyDescription.trim() ? textOnlyDescription : undefined;
        ctaToSend = textOnlyCta.trim() ? textOnlyCta : undefined;
        
        if (!descriptionToSend && !ctaToSend) {
            setAnalysisError('In Text-Only tab: Please enter a description or CTA to analyze.');
            setIsLoadingAnalysis(false);
            setAnalysisStartTime(null);
            return;
        }
    } else { 
        setIsLoadingAnalysis(false);
        setAnalysisStartTime(null);
        return;
    }
    
    const currentExclusionTags = Array.from(selectedExclusionTags);
    const currentCustomExclusions = customExclusions.trim();

    try {
      let result = await analyzeContent(
        genAIClient,
        selectedModel, 
        finalMediaDataToSend ? [finalMediaDataToSend] : null, 
        finalMimeType, 
        POLICY_GUIDE, 
        descriptionToSend,
        ctaToSend,
        isVideoAnalysis,
        currentExclusionTags.length > 0 ? currentExclusionTags : undefined,
        currentCustomExclusions.length > 0 ? currentCustomExclusions : undefined
      );
      
      if (result && activeTab === 'mediaAndText' && fileType === 'image' && filePreview) {
        const processItemsWithSnippets = async <T extends AnalysisTableItem | ExcludedItem>(items: T[] | undefined): Promise<T[]> => {
          if (!items) return [];
          return Promise.all(
            items.map(async (item) => {
              if (item.boundingBox && item.sourceContext === 'primaryImage' && filePreview) {
                try {
                  const snippet = await generateImageSnippet(filePreview, item.boundingBox);
                  return { ...item, imageSnippet: snippet };
                } catch (error) {
                  console.error("Error generating image snippet for item:", item.id, error);
                  return item;
                }
              }
              return item;
            })
          );
        };
        
        const issuesWithSnippets = await processItemsWithSnippets(result.issuesTable);
        const excludedWithSnippets = await processItemsWithSnippets(result.excludedItemsTable);

        setAnalysisResult({ 
          ...result, 
          issuesTable: issuesWithSnippets,
          excludedItemsTable: excludedWithSnippets
        });

      } else {
        setAnalysisResult(result);
      }

    } catch (e: any) {
      console.error("Analysis error:", e);
      setAnalysisError(e.message || 'Failed to analyze content. Check console for details.');
    } finally {
      setIsLoadingAnalysis(false);
      setAnalysisStartTime(null); 
    }
  }, [
      activeTab, uploadedFile, fileType, mediaBase64Data, genAIClient,
      mediaUserDescription, mediaUserCta, textOnlyDescription, textOnlyCta, 
      selectedModel, currentSelectedModelDetails, filePreview,
      selectedExclusionTags, customExclusions
    ]);

  const mediaTabHasTextInputs = mediaUserDescription.trim() !== '' || mediaUserCta.trim() !== '';
  const mediaFileIsReadyForAnalysis = !!(uploadedFile && mediaBase64Data && fileType);
  const textOnlyTabHasTextInputs = textOnlyDescription.trim() !== '' || textOnlyCta.trim() !== '';

  let currentCanAnalyze = false;
  let analysisDisabledReason = "";

  if (!genAIClient || currentApiKeyStatus === 'none') {
    analysisDisabledReason = "API Key not configured or AI Client not initialized.";
  } else if (!currentSelectedModelDetails.suitableForAnalysis) { 
     analysisDisabledReason = `Model ${currentSelectedModelDetails.name} is not suitable for policy analysis.`;
  } else if (isLoadingAnalysis) {
    analysisDisabledReason = "Analysis in progress...";
  } else if (isProcessingPreview) {
    analysisDisabledReason = "Processing file...";
  } else {
    if (activeTab === 'mediaAndText') {
      currentCanAnalyze = (mediaFileIsReadyForAnalysis || mediaTabHasTextInputs);
      if (!currentCanAnalyze) analysisDisabledReason = "Upload media or add text for Media & Text analysis.";
    } else if (activeTab === 'textOnly') {
      currentCanAnalyze = textOnlyTabHasTextInputs;
      if (!currentCanAnalyze) analysisDisabledReason = "Enter description or CTA for Text-Only analysis.";
    }
  }
  
  const formInputsDisabled = isLoadingAnalysis || isProcessingPreview;

  const handleSaveCustomApiKey = () => {
    if (customApiKeyInput.trim()) {
      localStorage.setItem('customGeminiApiKey', customApiKeyInput.trim());
    } else {
      localStorage.removeItem('customGeminiApiKey');
    }
    const { key, source } = getEffectiveApiKey();
    setCurrentApiKeyStatus(source);
    if (key) {
      try {
         setGenAIClient(new GoogleGenAI({ apiKey: key }));
         setAnalysisError(null);
      } catch (e: any) {
        setGenAIClient(null);
        setCurrentApiKeyStatus('none');
        setAnalysisError(`Error initializing AI client with new key: ${e.message}.`);
      }
    } else {
      setGenAIClient(null);
      setAnalysisError("API Key is not configured.");
    }
  };

  const handleClearCustomApiKey = () => {
    localStorage.removeItem('customGeminiApiKey');
    setCustomApiKeyInput('');
    const { key, source } = getEffectiveApiKey();
    setCurrentApiKeyStatus(source);
     if (key) {
      try {
        setGenAIClient(new GoogleGenAI({ apiKey: key }));
        setAnalysisError(null);
      } catch (e: any) {
        setGenAIClient(null);
        setCurrentApiKeyStatus('none');
        setAnalysisError(`Error initializing AI client after clearing custom key: ${e.message}.`);
      }
    } else {
      setGenAIClient(null);
      setAnalysisError("API Key is not configured (built-in key also missing/invalid).");
    }
  };

  const handleExclusionTagChange = (tagId: string) => {
    setSelectedExclusionTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      // localStorage.setItem('selectedExclusionTags', JSON.stringify(Array.from(newSet))); // No longer persisting globally
      return newSet;
    });
    if (analysisResult) setExclusionsChangedSinceLastAnalysis(true);
  };

  const handleCustomExclusionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCustomExclusions(newValue);
    // localStorage.setItem('customExclusions', newValue); // No longer persisting globally
    if (analysisResult) setExclusionsChangedSinceLastAnalysis(true);
  };


  const TabButton: React.FC<{
    tabId: ActiveTab;
    currentTab: ActiveTab;
    onClick: (tabId: ActiveTab) => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }> = ({ tabId, currentTab, onClick, children, icon }) => (
    <button
      role="tab"
      aria-selected={currentTab === tabId}
      aria-controls={`${tabId}-panel`}
      id={`${tabId}-tab`}
      onClick={() => {
        setAnalysisResult(null); 
        setHighlightedIssueId(null);
        setDrawableIssuesMap(new Map());
        setDrawableExcludedMap(new Map());
        setExclusionsChangedSinceLastAnalysis(false);
        // Do not reset selectedExclusionTags and customExclusions here
        // as they are now part of the form for each tab's context.
        // If they need to be reset on tab switch, do it explicitly or manage separate state per tab.
        onClick(tabId);
      }}
      className={`flex items-center justify-center px-4 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${currentTab === tabId 
          ? 'bg-neutral-800 text-yellow-400 border-b-2 border-yellow-400' 
          : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-yellow-300'
        }`}
    >
      {icon && <span className="mr-2 h-5 w-5">{icon}</span>}
      {children}
    </button>
  );
  
  const getHeaderSubtitle = () => {
    switch(activeTab) {
      case 'mediaAndText': return "Upload media, add optional text, define exclusions, and get instant policy feedback.";
      case 'textOnly': return "Enter your text content, define exclusions, and get a quick policy check.";
      case 'policyGuide': return "Interactively explore content policy guidelines and restricted keywords.";
      default: return "";
    }
  };

  const InputFieldWrapper: React.FC<{
    children: React.ReactNode;
    value: string;
    onClear: () => void;
    disabled?: boolean;
    fieldId: string;
  }> = ({ children, value, onClear, disabled, fieldId }) => (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={onClear}
        className={`absolute top-1/2 right-3 -translate-y-1/2 text-xs text-neutral-400 hover:text-yellow-400 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500 transition-opacity duration-150
          ${(value && !disabled) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-label={`Clear ${fieldId}`}
        aria-hidden={!(value && !disabled)}
        tabIndex={(value && !disabled) ? 0 : -1}
      >
        Clear
      </button>
    </div>
  );

  const handleHighlightIssueInteraction = (issueId: string | null) => {
    setHighlightedIssueId(issueId);
    if (issueId) {
      const element = document.getElementById(`issue-row-${issueId}`) || document.getElementById(`issue-card-${issueId}`) ||
                      document.getElementById(`excluded-row-${issueId}`) || document.getElementById(`excluded-card-${issueId}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value as ModelName;
    setSelectedModel(newModelId);
    localStorage.setItem('selectedApiModel', newModelId);
    setAnalysisError(null);
    setAnalysisResult(null);
    setExclusionsChangedSinceLastAnalysis(false);
    setHighlightedIssueId(null);
    setDrawableIssuesMap(new Map());
    setDrawableExcludedMap(new Map());
  };
  
  return (
    <div className="min-h-screen bg-black text-neutral-100 p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl mb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mb-2">
          Intuitive Solutions Content Policy Analyzer
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg">
          {getHeaderSubtitle()}
        </p>
         {currentApiKeyStatus === 'none' && analysisError && analysisError.includes("API Key is not configured") && (
          <div className="mt-4 p-3 bg-red-700/30 text-red-300 border border-red-500 rounded-md flex items-center justify-center">
            <ErrorIcon className="h-5 w-5 mr-2" />
            <MarkdownRenderer text={analysisError} />
          </div>
        )}
      </header>

      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsSettingsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div 
            className="bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-xl border border-neutral-700 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="settings-title" className="text-2xl font-semibold text-yellow-400">Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-neutral-400 hover:text-white">
                <XCircleIcon className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label htmlFor="model-select-modal" className="block text-sm font-medium text-neutral-300 mb-1">Select AI Model:</label>
                <select
                  id="model-select-modal"
                  value={selectedModel}
                  onChange={handleModelChange}
                  className="w-full p-2.5 bg-neutral-700 border border-neutral-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-100 text-sm"
                  aria-label="Select AI Model"
                >
                  {AVAILABLE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.note ? `- ${model.note}` : ''}
                    </option>
                  ))}
                </select>
                 {!currentSelectedModelDetails.suitableForAnalysis && (
                    <p className="mt-2 text-xs text-orange-400">
                        Warning: The selected model ({currentSelectedModelDetails.name}) may not be optimal for policy analysis tasks.
                    </p>
                 )}
              </div>

              <div>
                <label htmlFor="custom-api-key" className="block text-sm font-medium text-neutral-300 mb-1">Custom Gemini API Key (Optional):</label>
                <input
                  type="password"
                  id="custom-api-key"
                  value={customApiKeyInput}
                  onChange={(e) => setCustomApiKeyInput(e.target.value)}
                  placeholder="Enter your Gemini API Key to override built-in"
                  className="w-full p-2.5 bg-neutral-700 border border-neutral-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-100 text-sm placeholder-neutral-500"
                />
                <p className="mt-2 text-xs text-neutral-400">
                  Currently using: 
                  <span className={`font-semibold ml-1 px-1.5 py-0.5 rounded text-xs
                    ${currentApiKeyStatus === 'custom' ? 'bg-green-600/30 text-green-300' : 
                      currentApiKeyStatus === 'built-in' ? 'bg-sky-600/30 text-sky-300' : 
                      'bg-red-600/30 text-red-300'}`}>
                    {currentApiKeyStatus === 'custom' ? 'Custom Key' : 
                     currentApiKeyStatus === 'built-in' ? 'Built-in Key' : 
                     'No Key Active'}
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveCustomApiKey}
                  className="flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-medium rounded-md shadow-sm transition-colors text-sm"
                >
                  Save Custom Key
                </button>
                <button
                  onClick={handleClearCustomApiKey}
                  disabled={currentApiKeyStatus !== 'custom'}
                  className="flex-1 px-4 py-2.5 bg-neutral-600 hover:bg-neutral-500 text-neutral-100 font-medium rounded-md shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Custom Key & Use Built-in
                </button>
              </div>
              
              {/* Exclusion rules removed from settings */}

            </div>
             <p className="mt-6 text-xs text-neutral-500">
                A custom API key will be stored in your browser's local storage.
            </p>
          </div>
        </div>
      )}


      <main className="w-full max-w-5xl bg-neutral-900 shadow-2xl shadow-yellow-500/10 rounded-xl">
        <div role="tablist" aria-label="Analysis Mode" className="flex justify-between items-center border-b border-neutral-700/80 px-2 sm:px-4">
          <div className="flex">
            <TabButton tabId="mediaAndText" currentTab={activeTab} onClick={setActiveTab} icon={<PhotoIcon />}>Media & Text</TabButton>
            <TabButton tabId="textOnly" currentTab={activeTab} onClick={setActiveTab} icon={<ChatBubbleBottomCenterTextIcon />}>Text Only</TabButton>
            <TabButton tabId="policyGuide" currentTab={activeTab} onClick={setActiveTab} icon={<ClipboardDocumentListIcon />}>Policy Guide</TabButton>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-neutral-400 hover:text-yellow-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
            aria-label="Open Settings"
            title="Open Settings"
          >
            <CogIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'mediaAndText' && (
            <div role="tabpanel" id="mediaAndText-panel" aria-labelledby="mediaAndText-tab">
              <FileUpload onFileSelect={handleFileSelect} disabled={formInputsDisabled} />
              
              <div className="mt-6 w-full space-y-4 text-left">
                  <div>
                      <label htmlFor="mediaUserDescription" className="block text-sm font-medium text-neutral-300 mb-1">
                      <PencilSquareIcon className="w-4 h-4 inline mr-1 align-text-bottom text-yellow-400"/>
                      Accompanying Description (Optional)
                      </label>
                      <InputFieldWrapper value={mediaUserDescription} onClear={clearMediaUserDescription} disabled={formInputsDisabled} fieldId="media description">
                        <textarea
                        id="mediaUserDescription"
                        rows={3}
                        className="w-full p-2 pr-16 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-200 placeholder-neutral-500 text-sm disabled:opacity-70 disabled:bg-neutral-700/50"
                        placeholder="Enter any text description that accompanies your media..."
                        value={mediaUserDescription}
                        onChange={(e) => setMediaUserDescription(e.target.value)}
                        disabled={formInputsDisabled}
                        aria-label="Accompanying Description for Media"
                        />
                      </InputFieldWrapper>
                  </div>
                  <div>
                      <label htmlFor="mediaUserCta" className="block text-sm font-medium text-neutral-300 mb-1">
                      <MegaphoneIcon className="w-4 h-4 inline mr-1 align-text-bottom text-yellow-400"/>
                      Call to Action (CTA) (Optional)
                      </label>
                       <InputFieldWrapper value={mediaUserCta} onClear={clearMediaUserCta} disabled={formInputsDisabled} fieldId="media CTA">
                        <input
                        type="text"
                        id="mediaUserCta"
                        className="w-full p-2 pr-16 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-200 placeholder-neutral-500 text-sm disabled:opacity-70 disabled:bg-neutral-700/50"
                        placeholder="Enter any Call to Action text for your media..."
                        value={mediaUserCta}
                        onChange={(e) => setMediaUserCta(e.target.value)}
                        disabled={formInputsDisabled}
                        aria-label="Call to Action for Media"
                        />
                      </InputFieldWrapper>
                  </div>
              </div>

              <ExclusionRulesInputs
                selectedExclusionTags={selectedExclusionTags}
                customExclusions={customExclusions}
                onTagChange={handleExclusionTagChange}
                onCustomChange={handleCustomExclusionsChange}
                predefinedTags={PREDEFINED_EXCLUSION_TAGS}
                disabled={formInputsDisabled}
                idSuffix="media-text"
              />

              {isProcessingPreview && (
                <div className="mt-6 flex flex-col items-center justify-center text-center">
                  <LoadingSpinner className="h-8 w-8 text-yellow-400 animate-spin" />
                  <p className="mt-3 text-neutral-300">Processing file...</p>
                </div>
              )}
              
              {filePreview && !isProcessingPreview && (
                <div className="mt-6 text-center relative">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xl font-semibold text-yellow-400">File Preview & Details</h3>
                    <button
                        onClick={() => resetFileState(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-md text-xs text-neutral-300 hover:text-white transition-colors"
                        aria-label="Clear uploaded file and associated text"
                        title="Clear File & Text"
                    >
                        <Trash2Icon className="w-3.5 h-3.5" />
                        Clear File & Text
                    </button>
                  </div>
                  <div className='flex flex-col md:flex-row gap-4 items-start justify-center'>
                    <div className="flex-shrink-0 mx-auto md:mx-0 relative max-w-xs w-full">
                      {fileType === 'image' && filePreview && (
                        <div 
                            className="relative w-full overflow-hidden" 
                            style={{
                                paddingTop: imageDimensions ? `${(imageDimensions.naturalHeight / imageDimensions.naturalWidth) * 100}%` : '75%', 
                            }}
                        >
                           <img
                            ref={imageRef}
                            src={filePreview}
                            alt="Uploaded content preview"
                            className="absolute top-0 left-0 w-full h-full object-contain rounded-lg shadow-lg border-2 border-neutral-700"
                            onLoad={() => {
                              if (imageRef.current) {
                                setImageDimensions({
                                  width: imageRef.current.offsetWidth,
                                  height: imageRef.current.offsetHeight,
                                  naturalWidth: imageRef.current.naturalWidth,
                                  naturalHeight: imageRef.current.naturalHeight,
                                });
                              }
                            }}
                          />
                          {imageDimensions && analysisResult && (
                            <>
                              {analysisResult.issuesTable?.map((issue) => {
                                const displayNumber = drawableIssuesMap.get(issue.id);
                                if (issue.sourceContext === 'primaryImage' && issue.boundingBox && displayNumber) {
                                  const box = issue.boundingBox;
                                  const isHighlighted = issue.id === highlightedIssueId;
                                  
                                  let borderColor = '#D4AF37'; 
                                  let boxBgColor = 'rgba(212, 175, 55, 0.1)'; 
                                  let numBgColor = 'rgba(0, 0, 0, 0.6)';
                                  let numColor = '#D4AF37'; 

                                  switch (issue.severity) {
                                    case 'High': borderColor = '#EF4444'; boxBgColor = 'rgba(239, 68, 68, 0.2)'; numBgColor = 'rgba(185, 28, 28, 0.8)'; numColor = 'white'; break;
                                    case 'Medium': borderColor = '#F97316'; boxBgColor = 'rgba(249, 115, 22, 0.2)'; numBgColor = 'rgba(194, 65, 12, 0.8)'; numColor = 'white'; break;
                                    case 'Low': borderColor = '#EAB308'; boxBgColor = 'rgba(234, 179, 8, 0.2)'; numBgColor = 'rgba(161, 98, 7, 0.8)'; numColor = 'white'; break;
                                  }
                                  if (isHighlighted) { borderColor = '#06B6D4'; boxBgColor = 'rgba(6, 182, 212, 0.25)'; numBgColor = 'rgba(8, 145, 178, 0.9)'; numColor = 'white'; }
                                  
                                  const boxStyle: React.CSSProperties = { position: 'absolute', left: `${box.x_min * 100}%`, top: `${box.y_min * 100}%`, width: `${(box.x_max - box.x_min) * 100}%`, height: `${(box.y_max - box.y_min) * 100}%`, border: `2px solid ${borderColor}`, backgroundColor: boxBgColor, cursor: 'pointer', boxSizing: 'border-box', borderWidth: isHighlighted ? '3px': '2px' };
                                  const numberStyle: React.CSSProperties = { position: 'absolute', top: '2px', left: '2px', backgroundColor: numBgColor, color: numColor, padding: '1px 4px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold', pointerEvents: 'none' };

                                  return (
                                    <div key={issue.id} style={boxStyle} onClick={() => handleHighlightIssueInteraction(issue.id)} role="button" aria-label={`Highlight issue ${displayNumber}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHighlightIssueInteraction(issue.id);}}>
                                      <span style={numberStyle}>{displayNumber}</span>
                                    </div>
                                  );
                                } return null;
                              })}
                               {analysisResult.excludedItemsTable?.map((item) => {
                                const displayNumber = drawableExcludedMap.get(item.id);
                                if (item.sourceContext === 'primaryImage' && item.boundingBox && displayNumber) {
                                  const box = item.boundingBox;
                                  const isHighlighted = item.id === highlightedIssueId;
                                  
                                  const borderColor = isHighlighted ? '#06B6D4' : '#6EE7B7'; 
                                  const boxBgColor = isHighlighted ? 'rgba(6, 182, 212, 0.25)' : 'rgba(16, 185, 129, 0.15)';
                                  const numBgColor = isHighlighted ? 'rgba(8, 145, 178, 0.9)' : 'rgba(5, 150, 105, 0.8)';
                                  const numColor = 'white';
                                  
                                  const boxStyle: React.CSSProperties = { position: 'absolute', left: `${box.x_min * 100}%`, top: `${box.y_min * 100}%`, width: `${(box.x_max - box.x_min) * 100}%`, height: `${(box.y_max - box.y_min) * 100}%`, border: `2px dashed ${borderColor}`, backgroundColor: boxBgColor, cursor: 'pointer', boxSizing: 'border-box', borderWidth: isHighlighted ? '3px': '2px' };
                                  const numberStyle: React.CSSProperties = { position: 'absolute', top: '2px', right: '2px', backgroundColor: numBgColor, color: numColor, padding: '1px 4px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold', pointerEvents: 'none' };

                                  return (
                                    <div key={item.id} style={boxStyle} onClick={() => handleHighlightIssueInteraction(item.id)} role="button" aria-label={`Highlight excluded item ${displayNumber}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHighlightIssueInteraction(item.id);}}>
                                      <span style={numberStyle}>E{displayNumber}</span>
                                    </div>
                                  );
                                } return null;
                              })}
                            </>
                          )}
                        </div>
                      )}
                      {fileType === 'video' && filePreview && ( 
                        <img src={filePreview} alt="Video first frame preview" className="max-w-xs max-h-72 object-contain mx-auto rounded-lg shadow-lg border-2 border-neutral-700" />
                      )}
                      <div className="text-sm text-neutral-400 mt-2 space-y-0.5">
                        {uploadedFile && <p>Name: <MarkdownRenderer text={uploadedFile.name} className="inline"/> </p>}
                        {fileSize && <p>Size: {fileSize}</p>}
                        {fileType === 'video' && videoDuration && <p>Duration: {videoDuration}</p>}
                      </div>
                      {fileType === 'video' && (
                          <p className="text-xs text-neutral-500 mt-1">
                              Previewing first frame. Full video content will be analyzed.
                          </p>
                      )}
                       {(fileType === 'image' && (drawableIssuesMap.size > 0 || drawableExcludedMap.size > 0)) && (
                         <p className="text-xs text-neutral-500 mt-1">
                            Click on numbers on the image or table rows to highlight items. (E for Excluded)
                          </p>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'textOnly' && (
            <div role="tabpanel" id="textOnly-panel" aria-labelledby="textOnly-tab">
                <p className="text-neutral-300 mb-6 text-center text-sm">
                    Enter a description and/or a Call to Action (CTA) below to analyze them against content policies.
                    No media will be uploaded or analyzed in this mode.
                </p>
                <div className="w-full space-y-4 text-left">
                    <div>
                        <label htmlFor="textOnlyDescription" className="block text-sm font-medium text-neutral-300 mb-1">
                        <PencilSquareIcon className="w-4 h-4 inline mr-1 align-text-bottom text-yellow-400"/>
                        Description
                        </label>
                        <InputFieldWrapper value={textOnlyDescription} onClear={clearTextOnlyDescription} disabled={formInputsDisabled} fieldId="text description">
                          <textarea
                          id="textOnlyDescription"
                          rows={4}
                          className="w-full p-2 pr-16 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-200 placeholder-neutral-500 text-sm disabled:opacity-70 disabled:bg-neutral-700/50"
                          placeholder="Enter the primary text content or description..."
                          value={textOnlyDescription}
                          onChange={(e) => setTextOnlyDescription(e.target.value)}
                          disabled={formInputsDisabled}
                          aria-label="Description for Text-Only Analysis"
                          />
                        </InputFieldWrapper>
                    </div>
                    <div>
                        <label htmlFor="textOnlyCta" className="block text-sm font-medium text-neutral-300 mb-1">
                        <MegaphoneIcon className="w-4 h-4 inline mr-1 align-text-bottom text-yellow-400"/>
                        Call to Action (CTA)
                        </label>
                        <InputFieldWrapper value={textOnlyCta} onClear={clearTextOnlyCta} disabled={formInputsDisabled} fieldId="text CTA">
                          <input
                          type="text"
                          id="textOnlyCta"
                          className="w-full p-2 pr-16 bg-neutral-800 border border-neutral-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-neutral-200 placeholder-neutral-500 text-sm disabled:opacity-70 disabled:bg-neutral-700/50"
                          placeholder="Enter any Call to Action text..."
                          value={textOnlyCta}
                          onChange={(e) => setTextOnlyCta(e.target.value)}
                          disabled={formInputsDisabled}
                          aria-label="Call to Action for Text-Only Analysis"
                          />
                        </InputFieldWrapper>
                    </div>
                </div>
                <ExclusionRulesInputs
                  selectedExclusionTags={selectedExclusionTags}
                  customExclusions={customExclusions}
                  onTagChange={handleExclusionTagChange}
                  onCustomChange={handleCustomExclusionsChange}
                  predefinedTags={PREDEFINED_EXCLUSION_TAGS}
                  disabled={formInputsDisabled}
                  idSuffix="text-only"
                />
            </div>
          )}
           {activeTab === 'policyGuide' && (
            <div role="tabpanel" id="policyGuide-panel" aria-labelledby="policyGuide-tab" className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <PolicyGuide />
            </div>
           )}


          {analysisError && !isLoadingAnalysis && !(currentApiKeyStatus === 'none' && analysisError.includes("API Key is not configured")) && (
            <div className="mt-6 p-4 bg-red-800/60 text-red-200 border border-red-600 rounded-md flex items-start">
              <ErrorIcon className="h-6 w-6 mr-3 flex-shrink-0 text-red-300" />
              <div>
                <h4 className="font-bold text-red-200">Error</h4>
                <MarkdownRenderer text={analysisError} className="text-sm text-red-200" />
              </div>
            </div>
          )}
          
          {(activeTab === 'mediaAndText' || activeTab === 'textOnly') && (
            <div className="mt-8 text-center">
              <button
                onClick={handleAnalyze}
                disabled={!currentCanAnalyze}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-black font-semibold rounded-lg shadow-md hover:shadow-yellow-500/30 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center mx-auto"
                aria-live="polite"
                title={!currentCanAnalyze ? analysisDisabledReason : "Analyze Content (uses current exclusion settings)"}
              >
                {isLoadingAnalysis ? (
                  <>
                    <LoadingSpinner className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing... ({elapsedTime}s)
                  </>
                ) : (
                  <> 
                    <FilmIcon className="h-5 w-5 mr-2" />
                    Analyze Content
                  </>
                )}
              </button>
              {!currentCanAnalyze && analysisDisabledReason && (
                <p className="mt-2 text-xs text-neutral-400">{analysisDisabledReason}</p>
              )}

              {analysisResult && exclusionsChangedSinceLastAnalysis && (activeTab === 'mediaAndText' || activeTab === 'textOnly') && (
                 <button
                  onClick={handleAnalyze} 
                  disabled={isLoadingAnalysis || isProcessingPreview}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 hover:via-sky-600 hover:to-cyan-600 text-white font-medium rounded-lg shadow-md hover:shadow-sky-500/30 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  title="Re-run analysis with updated exclusion settings"
                >
                  {isLoadingAnalysis ? (
                    <>
                      <LoadingSpinner className="h-5 w-5 mr-2 animate-spin" />
                      Re-Analyzing...
                    </>
                  ) : (
                    <>
                      <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                      Re-run Analysis with Exclusions
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
          {isLoadingAnalysis && (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <LoadingSpinner className="h-12 w-12 text-yellow-400 animate-spin" />
              <p className="mt-4 text-lg text-neutral-300">
                Analyzing content... This may take a moment. ({elapsedTime}s)
              </p>
               {fileType === 'video' && <p className="text-sm text-neutral-400 mt-1">Analyzing full video. Larger videos may take longer.</p>}
            </div>
          )}

          {analysisResult && !isLoadingAnalysis && (activeTab === 'mediaAndText' || activeTab === 'textOnly') && (
            <AnalysisDisplay 
              result={analysisResult} 
              highlightedIssueId={highlightedIssueId}
              onHighlightIssue={handleHighlightIssueInteraction}
              drawableIssuesMap={drawableIssuesMap}
              drawableExcludedMap={drawableExcludedMap}
              isImageTabActive={activeTab === 'mediaAndText' && fileType === 'image'}
            />
          )}
        </div>
      </main>
      <footer className="w-full max-w-5xl mt-12 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Intuitive Solutions Content Policy Analyzer.</p>
         <p className="text-xs mt-1">Note: For videos, analysis is based on the full video content and any accompanying text.</p>
      </footer>
    </div>
  );
};

export default App;
