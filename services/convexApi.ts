
/**
 * ALPHA_BASE_NETWORK_CORE (v1.7.8)
 * Baseado estritamente na Management API v1 do Convex com Proxy Failover.
 */
const CONVEX_API_URL = 'https://api.convex.dev/v1'; 

// Lista de proxies para redundância em produção
const PROXY_PROVIDERS = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export const convexApi = {
  getHeaders(token: string, isPost: boolean = false) {
    const headers: any = {
      'Authorization': `Bearer ${token.trim()}`,
      'Accept': 'application/json',
    };
    if (isPost) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  async request(endpoint: string, token: string, options: RequestInit = {}): Promise<any> {
    const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${CONVEX_API_URL}${sanitizedEndpoint}`;
    const isPost = options.method === 'POST';
    
    let lastError: any = null;

    // Tenta cada proxy da lista até obter sucesso ou esgotar as opções
    for (const getProxyUrl of PROXY_PROVIDERS) {
      const targetUrl = getProxyUrl(fullUrl);
      
      try {
        console.log(`📡 [ALPHABASE_CORE] Trying Proxy: ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
          ...options,
          headers: {
            ...this.getHeaders(token, isPost),
            ...options.headers,
          }
        });

        // Se chegamos aqui, o preflight passou ou não foi necessário
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error(`❌ [API_ERROR] Status: ${response.status}`, data);
          const errorMsg = data.message || `HTTP_ERR_${response.status}`;
          const error = new Error(errorMsg);
          (error as any).status = response.status;
          throw error;
        }

        return data; // Sucesso!
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ [ALPHABASE_CORE] Proxy failed or CORS error, trying next...`, err.message);
        // Continua para o próximo loop
      }
    }

    // Se todos os proxies falharem
    throw lastError || new Error("FALHA_TOTAL_CONEXAO: Todos os túneis de proxy falharam.");
  },

  async getProjects(teamId: string, token: string): Promise<any> {
    return this.request(`/teams/${teamId}/list_projects`, token);
  },

  async listDeployments(projectId: string, token: string): Promise<any> {
    return this.request(`/projects/${projectId}/list_deployments`, token);
  },

  async createProject(teamId: string, name: string, token: string): Promise<any> {
    return this.request(`/teams/${teamId}/create_project`, token, {
      method: 'POST',
      body: JSON.stringify({ 
        projectName: name,
        deploymentType: 'dev',
        deploymentClass: 's16' 
      })
    });
  },

  async deleteProject(projectId: string, token: string): Promise<any> {
    return this.request(`/projects/${projectId}/delete`, token, {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  async createDeployKey(deploymentName: string, token: string): Promise<any> {
    return this.request(`/deployments/${deploymentName}/create_deploy_key`, token, {
      method: 'POST',
      body: JSON.stringify({
        name: `alphabase-admin-${deploymentName}-${Date.now()}`
      })
    });
  }
};
