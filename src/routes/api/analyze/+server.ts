import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkRateLimit, incrementUsage } from '$lib/server/rateLimit';
import { analyzeViaServer } from '$lib/server/geminiProxy';

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
        error: 'Rate limit exceeded. You have used all your free checks for today. Add your own Gemini API key for unlimited checks.',
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

  try {
    const result = await analyzeViaServer({
      base64MediaData: (body.base64MediaData as string) || null,
      mimeType: (body.mimeType as string) || null,
      userDescription: body.userDescription as string | undefined,
      userCta: body.userCta as string | undefined,
      selectedExclusionTags: body.selectedExclusionTags as string[] | undefined,
      customExclusions: body.customExclusions as string | undefined,
      postIntent: body.postIntent as string | undefined,
      isSiepNotApplicable: body.isSiepNotApplicable as boolean | undefined
    });

    // Increment usage only on success
    await incrementUsage(ip);

    // Recalculate remaining after increment
    const updatedLimit = await checkRateLimit(ip);

    return json({
      ...result,
      _usage: {
        remaining: updatedLimit.remaining,
        limit: 5
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Proxy analysis error:', err);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      return json({ error: 'Server API key configuration error. Please try again later.' }, { status: 500 });
    }
    if (err.message?.includes('quota')) {
      return json({ error: 'Service temporarily unavailable. Please try again later or add your own API key.' }, { status: 503 });
    }
    if (err.message?.includes('payload size exceeds')) {
      return json({ error: 'File too large. Please use a smaller file.' }, { status: 413 });
    }

    return json({ error: `Analysis failed: ${err.message || 'Unknown error'}` }, { status: 500 });
  }
};
