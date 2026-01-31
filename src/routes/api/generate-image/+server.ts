import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkRateLimit, incrementUsage } from '$lib/server/rateLimit';
import { generateImageViaServer } from '$lib/server/geminiProxy';

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export const POST: RequestHandler = async ({ request }) => {
  const ip = getClientIP(request);

  // Check rate limit
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return json(
      {
        error: 'Rate limit exceeded. You have used all your free checks for today. Add your own Gemini API key for unlimited usage.',
        _usage: { remaining: 0, limit: 5 }
      },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const base64Image = body.base64Image as string | undefined;
  const prompt = body.prompt as string | undefined;
  const mimeType = body.mimeType as string | undefined;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const imageDataUrl = await generateImageViaServer(
      base64Image || '',
      prompt,
      mimeType || 'image/png'
    );

    // Increment usage on success (image gen is expensive)
    await incrementUsage(ip);

    const updatedLimit = await checkRateLimit(ip);

    return json({
      imageDataUrl,
      _usage: {
        remaining: updatedLimit.remaining,
        limit: 5
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Proxy image generation error:', err);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      return json({ error: 'Server API key configuration error. Please try again later.' }, { status: 500 });
    }
    if (err.message?.includes('quota')) {
      return json({ error: 'Service temporarily unavailable. Please try again later or add your own API key.' }, { status: 503 });
    }
    if (err.message?.includes('payload size exceeds') || err.message?.includes('too large')) {
      return json({ error: 'Image too large. Please use a smaller image.' }, { status: 413 });
    }
    if (err.message?.includes('safety')) {
      return json({ error: 'Image generation blocked due to safety settings. Please try a different prompt or image.' }, { status: 400 });
    }

    return json({ error: `Image generation failed: ${err.message || 'Unknown error'}` }, { status: 500 });
  }
};
