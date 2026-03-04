export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // Extract the original path from Cloudflare's parsed URL
    // E.g. If request is to /api/finance/v8/finance/chart/AAPL
    // url.pathname will be /api/finance/v8/finance/chart/AAPL
    const path = url.pathname.replace(/^\/api\/finance/, '');
    const searchParams = url.search;

    // Reconstruct the Yahoo Finance URL
    const targetUrl = `https://query1.finance.yahoo.com${path}${searchParams}`;

    // Check Origin for CORS protection
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://mticker.pusztai.cloud',
        'https://multi-ticker-visualizer.pages.dev' // Default Cloudflare Pages domain
    ];

    const isAllowedOrigin = allowedOrigins.includes(origin) || origin.endsWith('.pusztai.cloud');

    // If we want to strictly lock it down to only allowed origins:
    // (We'll allow the request but only set the CORS header if the origin is trusted)
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (isAllowedOrigin) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
        // Fallback for direct browser visits or testing, though fetch API from another domain would fail CORS
        corsHeaders['Access-Control-Allow-Origin'] = allowedOrigins[0];
    }

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders
        });
    }

    try {
        // Fetch data from Yahoo
        const proxyRequest = new Request(targetUrl, {
            method: request.method,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const response = await fetch(proxyRequest);
        const responseBody = await response.arrayBuffer();

        // Return the response with proper CORS headers appended
        const proxyHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            proxyHeaders.set(key, value);
        });

        // Strip out some headers Yahoo sends that might cause issues
        proxyHeaders.delete('content-encoding');
        proxyHeaders.delete('set-cookie');

        return new Response(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: proxyHeaders
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}
