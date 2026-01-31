import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkRateLimit } from '$lib/server/rateLimit';
import { generateFixPromptViaServer, generateComprehensiveFixPromptViaServer } from '$lib/server/geminiProxy';
import type { AnalysisTableItem } from '$lib/types';

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export const POST: RequestHandler = async ({ request }) => {
  const ip = getClientIP(request);

  // Check rate limit (but do NOT increment - prompt gen is lightweight)
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

  try {
    let prompt: string;

    if (body.comprehensive && Array.isArray(body.issues)) {
      // Comprehensive fix for multiple issues
      const issues = body.issues as AnalysisTableItem[];
      if (issues.length === 0) {
        return json({ error: 'No issues provided' }, { status: 400 });
      }
      prompt = await generateComprehensiveFixPromptViaServer(issues);
    } else if (body.issue) {
      // Single issue fix
      const issue = body.issue as AnalysisTableItem;
      prompt = await generateFixPromptViaServer(issue);
    } else {
      return json({ error: 'Either issue or issues (with comprehensive: true) is required' }, { status: 400 });
    }

    return json({
      prompt,
      _usage: {
        remaining: rateLimit.remaining,
        limit: 5
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Proxy fix prompt generation error:', err);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      return json({ error: 'Server API key configuration error. Please try again later.' }, { status: 500 });
    }
    if (err.message?.includes('quota')) {
      return json({ error: 'Service temporarily unavailable. Please try again later or add your own API key.' }, { status: 503 });
    }

    return json({ error: `Fix prompt generation failed: ${err.message || 'Unknown error'}` }, { status: 500 });
  }
};
