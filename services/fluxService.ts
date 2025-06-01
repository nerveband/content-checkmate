export interface FluxGenerationRequest {
  base64Image: string;
  prompt: string;
  negativePrompt?: string;
  fluxModelVersionId: string;
  replicateApiToken?: string;
}

export interface FluxGenerationResult {
  imageUrl: string;
  originalImageId?: string;
}

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[] | null;
  error?: string | null;
  urls: {
    get: string;
    cancel: string;
  };
}

const FLUX_MODELS = {
  'flux-kontext-pro': '64734fe9bb527757ee720f64e35cf8266a8f48449f6ee7722fb2dec26a7a0476',
  'flux-kontext-max': '0b9c317b23e79a9a0d8b9602ff4d04030d433055927fb7c4b91c44234a6818c4'
} as const;

export type FluxModelName = keyof typeof FLUX_MODELS;

// Helper function to extract base64 data from data URL
function extractBase64FromDataUrl(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    const base64Start = dataUrl.indexOf(',') + 1;
    return dataUrl.substring(base64Start);
  }
  return dataUrl; // Already just base64
}

// Helper function to validate and convert image to supported format
async function prepareImageForFlux(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to ensure consistent format
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Check image dimensions and resize if too large
        let targetWidth = img.width;
        let targetHeight = img.height;
        const maxDimension = 2048; // FLUX typically works well with images up to 2048px
        
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
          targetWidth = Math.floor(targetWidth * ratio);
          targetHeight = Math.floor(targetHeight * ratio);
        }
        
        // Set canvas size
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw image to canvas with proper scaling
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Convert to high-quality JPEG
        const convertedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        // Validate data URL
        if (!convertedDataUrl || !convertedDataUrl.startsWith('data:image/')) {
          reject(new Error('Failed to generate valid data URL'));
          return;
        }
        
        // Extract base64 part for validation
        const base64Data = extractBase64FromDataUrl(convertedDataUrl);
        if (!base64Data || base64Data.length === 0) {
          reject(new Error('Generated base64 data is empty'));
          return;
        }
        
        // Check if base64 is valid format
        try {
          atob(base64Data.substring(0, 100)); // Test decode first 100 chars
        } catch (e) {
          reject(new Error('Invalid base64 data generated'));
          return;
        }
        
        // Return the full data URL for FLUX API
        resolve(convertedDataUrl);
      } catch (error) {
        reject(new Error('Failed to convert image: ' + error));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };
    
    img.src = dataUrl;
  });
}

export async function generateImage(
  modelName: FluxModelName,
  base64Image: string,
  prompt: string,
  negativePrompt?: string,
  replicateApiToken?: string
): Promise<FluxGenerationResult> {
  const fluxModelVersionId = FLUX_MODELS[modelName];
  
  if (!fluxModelVersionId) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  try {
    // Prepare and validate image format - this now returns a full data URL
    const dataUrl = await prepareImageForFlux(base64Image);
    
    const response = await fetch('/api/generate-flux-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: dataUrl,
        prompt,
        negativePrompt,
        fluxModelVersionId,
        replicateApiToken,
      } as FluxGenerationRequest),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to start image generation';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const prediction: ReplicatePrediction = await response.json();
    
    const imageUrl = await pollForCompletion(prediction.id, replicateApiToken);
    
    return {
      imageUrl,
      originalImageId: prediction.id,
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function pollForCompletion(predictionId: string, replicateApiToken?: string): Promise<string> {
  const maxAttempts = 60;
  const pollInterval = 3000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const url = `/api/get-flux-prediction?id=${predictionId}${replicateApiToken ? `&token=${encodeURIComponent(replicateApiToken)}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        let errorMessage = 'Failed to check generation status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const prediction: ReplicatePrediction = await response.json();

      if (prediction.status === 'succeeded') {
        if (prediction.output && prediction.output.length > 0) {
          return prediction.output[0];
        } else {
          throw new Error('Generation completed but no output received');
        }
      }

      if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Image generation failed');
      }

      if (prediction.status === 'starting' || prediction.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
        continue;
      }

      throw new Error(`Unknown prediction status: ${prediction.status}`);
    } catch (error) {
      console.error('Error during polling:', error);
      
      if (attempts >= maxAttempts - 1) {
        throw new Error('Generation timeout - please try again');
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }
  }

  throw new Error('Generation timeout - please try again');
}

export function downloadImage(imageUrl: string, filename: string = 'generated-image.png'): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}