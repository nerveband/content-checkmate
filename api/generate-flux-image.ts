import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FluxGenerationRequest {
  base64Image: string;
  prompt: string;
  negativePrompt?: string;
  fluxModelVersionId: string;
}

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[] | null;
  error?: string | null;
  urls: {
    get: string;
    cancel: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { base64Image, prompt, negativePrompt, fluxModelVersionId }: FluxGenerationRequest = req.body;

    if (!base64Image || !prompt || !fluxModelVersionId) {
      return res.status(400).json({ 
        message: 'Missing required parameters. base64Image, prompt, and fluxModelVersionId are required.' 
      });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN environment variable not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: fluxModelVersionId,
        input: {
          input_image: `data:image/jpeg;base64,${base64Image}`,
          prompt: prompt,
          negative_prompt: negativePrompt || '',
          num_outputs: 1,
        },
      }),
    });

    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.text();
      console.error('Replicate API error:', errorData);
      return res.status(replicateResponse.status).json({ 
        message: 'Replicate API error', 
        error: errorData 
      });
    }

    const prediction: ReplicatePrediction = await replicateResponse.json();
    res.status(200).json(prediction);

  } catch (error: any) {
    console.error('Error calling Replicate API:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}