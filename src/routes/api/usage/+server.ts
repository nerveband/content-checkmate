import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUsageForIP } from '$lib/server/rateLimit';

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export const GET: RequestHandler = async ({ request }) => {
  const ip = getClientIP(request);
  const usage = await getUsageForIP(ip);
  return json(usage);
};
