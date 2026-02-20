/**
 * Supabase Edge Function: publish-scheduled
 *
 * Runs every minute via pg_cron to publish articles whose scheduledAt <= now().
 * After publishing, triggers Next.js revalidation via webhook.
 *
 * Cron schedule (add to supabase/migrations):
 *   SELECT cron.schedule('publish-scheduled', '* * * * *', $$
 *     SELECT net.http_post(
 *       url := 'https://<project-ref>.supabase.co/functions/v1/publish-scheduled',
 *       headers := '{"Authorization": "Bearer <anon-key>"}'
 *     );
 *   $$);
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const NEXT_REVALIDATE_URL = Deno.env.get('NEXT_REVALIDATE_URL')! // e.g. https://yourdomain.com/api/revalidate
const NEXT_REVALIDATE_SECRET = Deno.env.get('NEXT_REVALIDATE_SECRET')!

Deno.serve(async () => {
  const now = new Date().toISOString()

  // Publish all scheduled articles whose time has passed
  const { data: published, error } = await supabase
    .from('articles')
    .update({ status: 'PUBLISHED', published_at: now })
    .eq('status', 'SCHEDULED')
    .lte('scheduled_at', now)
    .select('id, organization_id, slug')

  if (error) {
    console.error('[publish-scheduled] DB error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!published || published.length === 0)
    return new Response(JSON.stringify({ published: 0 }), { status: 200 })

  console.log(`[publish-scheduled] Published ${published.length} article(s)`)

  // Trigger Next.js on-demand revalidation for affected paths
  const paths = [
    '/news',
    ...published.map((a: { slug: string }) => `/news/${a.slug}`),
  ]

  try {
    await fetch(NEXT_REVALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: NEXT_REVALIDATE_SECRET, paths }),
    })
  } catch (revalidateError) {
    // Non-fatal: articles are published; revalidation will happen on next request
    console.warn('[publish-scheduled] Revalidation webhook failed:', revalidateError)
  }

  return new Response(
    JSON.stringify({ published: published.length, ids: published.map((a: { id: string }) => a.id) }),
    { status: 200 }
  )
})
