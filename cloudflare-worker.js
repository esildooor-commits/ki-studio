// Weiterleitung für KI-Anbieter, die Browser-Anfragen (CORS) blockieren.
// Es werden nur die unten genannten Ziele erreicht. Der API-Schlüssel wird nur durchgereicht, nicht gespeichert.
const TARGETS = {
  nvidia: 'https://integrate.api.nvidia.com',
  ollama: 'https://ollama.com',
  deepseek: 'https://api.deepseek.com',
};
export default {
  async fetch(req) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'authorization,content-type',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const u = new URL(req.url);
    const [, name, ...rest] = u.pathname.split('/');
    const base = TARGETS[name];
    if (!base) return new Response('Unbekanntes Ziel', { status: 404, headers: cors });
    const r = await fetch(base + '/' + rest.join('/') + u.search, {
      method: req.method,
      headers: {
        authorization: req.headers.get('authorization') || '',
        'content-type': 'application/json',
      },
      body: req.method === 'GET' ? undefined : req.body,
    });
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  },
};
