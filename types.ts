
export interface ConvexDeployment {
  deploymentName: string;
  deploymentUrl: string;
  deploymentType: 'dev' | 'prod';
  adminKey?: string; // Cache local da chave de admin/deploy
}

export interface ConvexProject {
  id: string;
  name: string;
  slug: string;
  deployments: ConvexDeployment[];
}

export interface ConvexTeam {
  id: string;
  name: string;
  slug: string;
}

export interface DeployKeyResponse {
  key: string;
}
