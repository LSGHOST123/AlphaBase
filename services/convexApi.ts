
/**
 * ALPHA_BASE_NETWORK_CORE (v1.7.7)
 * Baseado estritamente na Management API v1 do Convex.
 */
const CONVEX_API_URL = 'https://api.convex.dev/v1'; 
const PROXY_URL = 'https://corsproxy.io/?';

export const convexApi = {
  getHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  },

  async request(endpoint: string, token: string, options: RequestInit = {}): Promise<any> {
    const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${CONVEX_API_URL}${sanitizedEndpoint}`;
    
    console.log('📡 [ALPHABASE_CORE] Executing:', fullUrl);
    
    const targetUrl = PROXY_URL + encodeURIComponent(fullUrl);
    
    const response = await fetch(targetUrl, {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers,
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`❌ [API_ERROR] Status: ${response.status}`, data);
      const errorMsg = data.message || `HTTP_ERR_${response.status}`;
      const error = new Error(errorMsg);
      (error as any).status = response.status;
      throw error;
    }
    return data;
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

  /**
   * Cria uma Deploy Key para um deployment específico.
   * Exige o campo 'name' no body conforme Management API.
   * Endpoint: POST /v1/deployments/:deployment_name/create_deploy_key
   */
  async createDeployKey(deploymentName: string, token: string): Promise<any> {
    return this.request(`/deployments/${deploymentName}/create_deploy_key`, token, {
      method: 'POST',
      body: JSON.stringify({
        name: `alphabase-admin-${deploymentName}-${Date.now()}`
      })
    });
  }
};
