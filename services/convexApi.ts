
import { fetchWithProxy } from '../lib/api';

/**
 * ALPHA_BASE_NETWORK_CORE (v1.9.5)
 * Implementação baseada na Management API v1 do Convex via Universal Bridge.
 */
export const convexApi = {
  getHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token.trim()}`,
    };
  },

  async getProjects(teamId: string, token: string): Promise<any> {
    return fetchWithProxy(`/teams/${teamId}/list_projects`, {
      headers: this.getHeaders(token)
    });
  },

  async listDeployments(projectId: string, token: string): Promise<any> {
    return fetchWithProxy(`/projects/${projectId}/list_deployments`, {
      headers: this.getHeaders(token)
    });
  },

  async createProject(teamId: string, name: string, token: string): Promise<any> {
    return fetchWithProxy(`/teams/${teamId}/create_project`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ 
        projectName: name,
        deploymentType: 'dev',
        deploymentClass: 's16' 
      })
    });
  },

  async deleteProject(projectId: string, token: string): Promise<any> {
    return fetchWithProxy(`/projects/${projectId}/delete`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({})
    });
  },

  async createDeployKey(deploymentName: string, token: string): Promise<any> {
    return fetchWithProxy(`/deployments/${deploymentName}/create_deploy_key`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        name: `alphabase-admin-${deploymentName}-${Date.now()}`
      })
    });
  }
};
