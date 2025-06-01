export interface FluxGenerationRequest {
  base64Image: string;
  prompt: string;
  negativePrompt?: string;
  fluxModelVersionId: string;
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

export async function generateImage(
  modelName: FluxModelName,
  base64Image: string,
  prompt: string,
  negativePrompt?: string
): Promise<FluxGenerationResult> {
  const fluxModelVersionId = FLUX_MODELS[modelName];
  
  if (!fluxModelVersionId) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  try {
    const response = await fetch('/api/generate-flux-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        prompt,
        negativePrompt,
        fluxModelVersionId,
      } as FluxGenerationRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start image generation');
    }

    const prediction: ReplicatePrediction = await response.json();
    
    const imageUrl = await pollForCompletion(prediction.id);
    
    return {
      imageUrl,
      originalImageId: prediction.id,
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function pollForCompletion(predictionId: string): Promise<string> {
  const maxAttempts = 60;
  const pollInterval = 3000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`/api/get-flux-prediction?id=${predictionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check generation status');
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