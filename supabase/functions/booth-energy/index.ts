import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(() =>
  new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  }),
);
