
const TARGET_BASE_URL = 'https://api.convex.dev/v1';

/**
 * ALPHA_BASE_ENVIRONMENT_DETECTOR (v2.0)
 * Identifica se estamos em ambiente de desenvolvimento ou produção de forma segura.
 */
const isDev = (() => {
  try {
    // Tenta detectar via Vite Env
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env && typeof meta.env.DEV !== 'undefined') {
      return meta.env.DEV;
    }
    // Fallback: Se estiver em localhost ou 127.0.0.1, assume desenvolvimento
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('192.168.');
  } catch (e) {
    return false;
  }
})();

/**
 * fetchWithProxy: O motor de rede definitivo da AlphaBase.
 * Resolve: CORS, Preflight (OPTIONS), 405 Method Not Allowed e Redirecionamentos 301.
 * 
 * Agora utiliza o CORSPROXY.IO que injeta corretamente:
 * Access-Control-Allow-Headers: Authorization, Content-Type, ...
 */
export const fetchWithProxy = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullTargetUrl = TARGET_BASE_URL + cleanEndpoint;
  
  // Em Produção/Preview, usamos o corsproxy.io que suporta headers customizados (Authorization)
  const url = isDev 
    ? `/api-proxy${cleanEndpoint}` 
    : `https://corsproxy.io/?${encodeURIComponent(fullTargetUrl)}`;

  console.log(`📡 [ALPHA_NETWORK] ${isDev ? '[LOCAL_VITE_PROXY]' : '[ELITE_CORS_BRIDGE]'} -> ${cleanEndpoint}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers, // Aqui vai o Authorization: Bearer
    },
    mode: 'cors'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.message || `Erro ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};
