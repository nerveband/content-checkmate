import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const predictionId = req.query.id;

    if (!predictionId || typeof predictionId !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid prediction ID.' });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN environment variable not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const replicateResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.text();
      console.error('Replicate API polling error:', errorData);
      return res.status(replicateResponse.status).json({ 
        message: 'Replicate API polling error', 
        error: errorData 
      });
    }

    const prediction: ReplicatePrediction = await replicateResponse.json();
    res.status(200).json(prediction);

  } catch (error: any) {
    console.error('Error polling Replicate API:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}