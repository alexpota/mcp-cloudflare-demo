const CONFIG = {
  DEFAULT_PROJECT_NAME: 'mcp-cloudflare-demo',
  CACHE_DURATION: 30,
  DEMO_BUILD_DURATION: 30000,
  MAX_AGE: '86400'
};

const HEADERS = {
  CORS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': CONFIG.MAX_AGE,
  },
  JSON: { 'Content-Type': 'application/json' },
  CACHE: { 'Cache-Control': `public, max-age=${CONFIG.CACHE_DURATION}, s-maxage=${CONFIG.CACHE_DURATION}` }
};

function createResponse(data, status = 200, cacheHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...HEADERS.JSON, ...HEADERS.CORS, ...cacheHeaders }
  });
}

function createDemoDeployment(projectName) {
  return {
    success: true,
    demo: true,
    timestamp: new Date().toISOString(),
    deployment: {
      id: 'demo-' + Date.now().toString(36),
      url: `https://${projectName}.pages.dev`,
      environment: 'production',
      created_on: new Date().toISOString(),
      latest_stage: {
        status: 'success',
        started_on: new Date(Date.now() - CONFIG.DEMO_BUILD_DURATION).toISOString(),
        ended_on: new Date().toISOString(),
      }
    }
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return createResponse(null, 200);
  }

  if (request.method !== 'GET') {
    return createResponse({ 
      error: 'Method not allowed',
      allowed: ['GET']
    }, 405);
  }

  const projectName = env.CF_PAGES_PROJECT_NAME || CONFIG.DEFAULT_PROJECT_NAME;
  return createResponse(createDemoDeployment(projectName), 200, HEADERS.CACHE);
}