const TARGET_BASE_URL = 'https://api.convex.dev/v1';

/**
 * ALPHA_NETWORK_ENVIRONMENT_RESOLVER
 * Detecta se o ambiente requer tunelamento de CORS.
 */
const isDev = (() => {
  try {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.port !== '';
  } catch {
    return false;
  }
})();

/**
 * fetchWithProxy: Estratégia de Tunelamento Estrito para Universal Deploy.
 */
export const fetchWithProxy = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullTargetUrl = TARGET_BASE_URL + cleanEndpoint;
  
  // Em ambientes de Preview/GitHub Pages, usamos o corsproxy.io para injetar headers OPTIONS (Preflight)
  const url = isDev 
    ? `/api-proxy${cleanEndpoint}` 
    : `https://corsproxy.io/?${encodeURIComponent(fullTargetUrl)}`;

  console.log(`📡 [ALPHA_NETWORK] Environment: ${isDev ? 'LOCAL_VITE' : 'PRODUCTION_BRIDGE'}`);
  console.log(`📡 [ALPHA_NETWORK] Path: ${cleanEndpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      mode: 'cors'
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP Error ${response.status}` };
      }
      const err = new Error(errorData.message || response.statusText);
      (err as any).status = response.status;
      throw err;
    }

    return response.json();
  } catch (error: any) {
    console.error(`❌ [ALPHA_NETWORK_CRITICAL_FAILURE]:`, error.message);
    // Se o corsproxy.io falhar, tentamos um fallback silencioso ou reportamos o erro
    throw error;
  }
};