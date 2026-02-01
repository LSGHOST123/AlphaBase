const TARGET_BASE_URL = 'https://api.convex.dev/v1';

/**
 * ALPHA_NETWORK_ENVIRONMENT_RESOLVER
 * Detecta se o ambiente é desenvolvimento local ou produção/preview.
 */
const isDev = (() => {
  try {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  } catch {
    return false;
  }
})();

/**
 * fetchWithProxy: Estratégia de Tunelamento Estrito.
 * Local: Usa o proxy do Vite (/api-proxy) definido em vite.config.ts.
 * Produção/Preview: Usa o corsproxy.io, que é o padrão ouro para resolver falhas de Preflight (OPTIONS)
 * quando headers de 'Authorization' são enviados em ambientes sem servidor (GitHub Pages, AI Studio Preview).
 */
export const fetchWithProxy = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullTargetUrl = TARGET_BASE_URL + cleanEndpoint;
  
  // O corsproxy.io exige a URL alvo como query string prefixada por '?'
  const url = isDev 
    ? `/api-proxy${cleanEndpoint}` 
    : `https://corsproxy.io/?${encodeURIComponent(fullTargetUrl)}`;

  console.log(`📡 [ALPHA_NETWORK] Protocol: ${isDev ? 'VITE_LOCAL' : 'CORS_BRIDGE_SENIOR'}`);
  console.log(`📡 [ALPHA_NETWORK] Endpoint: ${cleanEndpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Importante: corsproxy.io lida com o preflight melhor com mode: 'cors'
      mode: 'cors'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.message || `Protocol Error: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      (err as any).status = response.status;
      throw err;
    }

    return response.json();
  } catch (error: any) {
    console.error(`❌ [ALPHA_NETWORK_CRITICAL_FAILURE]:`, error.message);
    throw error;
  }
};