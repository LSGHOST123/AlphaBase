
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import NeonButton from './components/NeonButton';
import NeonInput from './components/NeonInput';
import { convexApi } from './services/convexApi';
import { ConvexProject, ConvexDeployment } from './types';

type Language = 'pt' | 'en';

const translations = {
  en: {
    SYSTEM_CONTROL: "Systems_Control",
    PROVISION_NEW_PROJECT: "PROVISION_NEW_PROJECT",
    NODE_SPEC: "NODE_SPECIFICATION:",
    ENV_TYPE: "ENV_TYPE:",
    CLASS: "CLASS:",
    TUNNEL: "TUNNEL:",
    PROVISION_NODE: "PROVISION_NODE",
    ACTIVE_GRID: "Active_Grid",
    TELEMETRY_DESC: "Infrastructure telemetry & remote management",
    ACTIVE_DEPLOYMENT: "Active_Deployment:",
    OPEN_INTEGRATED_PANEL: "OPEN_INTEGRATED_PANEL",
    CONVEX_CLOUD_DASH: "CONVEX_CLOUD_DASH",
    DESTROY_PROJECT: "DESTROY_PROJECT",
    READY: "READY",
    PROVISIONING_INFRA: "PROVISIONING_INFRAESTRUTURA...",
    NO_ACTIVE_NODES: "NO_ACTIVE_NODES_IN_GRID",
    SYNCING_MATRIX: "Synchronizing_With_Matrix...",
    CONNECTED_NODE: "Connected_Node",
    TERMINATE: "TERMINATE",
    UPLINK_STATUS: "Protocol Alpha_OS v1.7.7:",
    ACCESS_UPLINK: "ACCESS_UPLINK",
    AUTHORIZE: "AUTHORIZE_CONNECTION",
  },
  pt: {
    SYSTEM_CONTROL: "Controle_de_Sistemas",
    PROVISION_NEW_PROJECT: "Criar novo projeto",
    NODE_SPEC: "ESPECIFICAÇÕES_DO_NODE:",
    ENV_TYPE: "TIPO_DE_AMB:",
    CLASS: "CLASSE:",
    TUNNEL: "TÚNEL:",
    PROVISION_NODE: "Criar projeto",
    ACTIVE_GRID: "Grid_Ativo",
    TELEMETRY_DESC: "Telemetria de infraestrutura e gerenciamento remoto",
    ACTIVE_DEPLOYMENT: "Deployment_Ativo:",
    OPEN_INTEGRATED_PANEL: "ABRIR_PAINEL_INTEGRADO",
    CONVEX_CLOUD_DASH: "Abrir no CONVEX",
    DESTROY_PROJECT: "Excluir Projeto",
    READY: "PRONTO",
    PROVISIONING_INFRA: "PROVISIONANDO_INFRAESTRUTURA...",
    NO_ACTIVE_NODES: "SEM_NODES_ATIVOS_NO_GRID",
    SYNCING_MATRIX: "Sincronizando_com_a_Matrix...",
    CONNECTED_NODE: "Node_Conectado",
    TERMINATE: "ENCERRAR",
    UPLINK_STATUS: "Protocolo Alpha_OS v1.7.7:",
    ACCESS_UPLINK: "ACESSO_UPLINK",
    AUTHORIZE: "AUTORIZAR_CONEXÃO",
  }
};

/**
 * COMPONENTE: ConvexDashboardEmbed
 * Implementa o Dashboard Embutido oficial com handshake v2.
 */
const ConvexDashboardEmbed: React.FC<{
  deploymentUrl: string;
  deploymentName: string;
  adminKey: string;
  onClose: () => void;
}> = ({ deploymentUrl, deploymentName, adminKey, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "dashboard-credentials-request") return;

      console.log('🔐 [ALPHA_BASE] Handshake detectado. Injetando credenciais...');
      
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "dashboard-credentials",
          adminKey,
          deploymentUrl,
          deploymentName,
          visiblePages: [
            "health", "data", "functions", "files", "schedules", "logs", "history", "settings",
          ],
        },
        "*",
      );
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [deploymentUrl, deploymentName, adminKey]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col p-4 animate-in fade-in duration-300 font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-[#39FF14]/30 pb-3">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-[#39FF14] uppercase tracking-tighter">
            ALPHA<span className="text-white">BASE</span>_INTEGRATED_CONSOLE: <span className="text-white">{deploymentName}</span>
          </h2>
          <span className="text-[10px] opacity-50 text-[#39FF14]">{deploymentUrl}</span>
        </div>
        <button 
          onClick={onClose}
          className="px-8 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase font-black text-xs tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        >
          FECHAR_CONEXAO
        </button>
      </div>
      <div className="flex-1 border border-[#39FF14]/20 bg-[#050505] rounded-sm overflow-hidden relative shadow-[0_0_50px_rgba(57,255,20,0.1)]">
        <iframe
          ref={iframeRef}
          src="https://dashboard-embedded.convex.dev/data"
          allow="clipboard-write"
          className="w-full h-full"
          title="Convex Integrated Dashboard"
        />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>
      <div className="mt-3 text-[8px] opacity-20 uppercase tracking-[0.4em] text-center font-bold">
        Secure_Tunnel: Handshake_v2_Active // Session_Admin
      </div>
    </div>
  );
};

// Modal de Confirmação de Exclusão
const DeleteConfirmationModal: React.FC<{
  project: ConvexProject;
  onConfirm: (id: string) => void;
  onCancel: () => void;
  loading: boolean;
  lang: Language;
}> = ({ project, onConfirm, onCancel, loading, lang }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
    <div className="w-full max-w-md bg-black border-2 border-red-500 p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-in zoom-in duration-200">
      <h2 className="text-2xl font-black text-red-500 uppercase italic tracking-tighter mb-4 underline">{lang === 'pt' ? 'EXCLUIR_PROJETO' : 'DESTROY_PROJECT'}</h2>
      <p className="text-white text-xs mb-8 leading-relaxed uppercase">
        {lang === 'pt' ? 'CONFIRMAR QUE VAI EXCLUIR O PROJETO' : 'CONFIRM THAT YOU WILL DELETE THE PROJECT'} <span className="text-red-500 font-bold underline">[{project.name}]</span> {lang === 'pt' ? 'PERMANENTEMENTE.' : 'PERMANENTLY.'}
      </p>
      <div className="flex gap-4 items-stretch">
        <NeonButton 
          variant="danger" 
          className="flex-1 text-[10px] h-[52px] px-2" 
          onClick={() => onConfirm(project.id)}
          isLoading={loading}
        >
          {lang === 'pt' ? 'Confirmar Exclusão' : 'Confirm Destruction'}
        </NeonButton>
        <button 
          onClick={onCancel}
          className="flex-1 border border-white/20 text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-all h-[52px] px-2"
        >
          {lang === 'pt' ? 'Cancelar' : 'Cancel'}
        </button>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [token, setToken] = useState<string>(localStorage.getItem('convex_token') || '');
  const [teamIdInput, setTeamIdInput] = useState<string>(localStorage.getItem('convex_team_id') || '');
  const [projects, setProjects] = useState<ConvexProject[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>((localStorage.getItem('alpha_lang') as Language) || 'en');
  
  const [activeEmbed, setActiveEmbed] = useState<{ url: string; name: string; key: string; } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ConvexProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('alpha_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'pt' : 'en');
  };

  /**
   * Função para buscar projetos e seus deployments.
   */
  const fetchProjects = useCallback(async () => {
    const tokenStr = localStorage.getItem('convex_token');
    const id = localStorage.getItem('convex_team_id');
    if (!tokenStr || !id) return;
    
    setLoading(true);
    try {
      const res = await convexApi.getProjects(id, tokenStr);
      const list = res.projects || res.items || (Array.isArray(res) ? res : []);
      
      const enrichedList = await Promise.all(list.map(async (p: any) => {
        try {
          const depRes = await convexApi.listDeployments(p.id, tokenStr);
          const rawDeployments = depRes.deployments || depRes.items || (Array.isArray(depRes) ? depRes : []);
          
          const deployments: ConvexDeployment[] = rawDeployments.map((d: any) => ({
            deploymentName: d.name || d.deploymentName,
            deploymentUrl: d.url || d.deploymentUrl || `https://${d.name}.convex.cloud`,
            deploymentType: d.deploymentType || 'dev'
          }));

          return { ...p, deployments };
        } catch (e) {
          console.error(`Falha ao carregar deployments para ${p.name}`, e);
          return { ...p, deployments: [] };
        }
      }));

      setProjects(enrichedList);
    } catch (err: any) {
      console.error('ALPHABASE_SYNC_ERROR:', err.message);
      setError('Erro ao carregar projetos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchProjects();
      const interval = setInterval(fetchProjects, 60000);
      return () => clearInterval(interval);
    }
  }, [location.pathname, fetchProjects]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanToken = token.trim();
    const cleanTeamId = teamIdInput.trim();

    if (!cleanToken || !cleanTeamId) {
      setError('TOKEN e Team ID são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await convexApi.getProjects(cleanTeamId, cleanToken);
      localStorage.setItem('convex_token', cleanToken);
      localStorage.setItem('convex_team_id', cleanTeamId);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.status === 404) setError('ERRO_404: Team ID não localizado.');
      else if (err.status === 401) setError('ERRO_401: TOKEN negado.');
      else setError(`FALHA_CONEXÃO: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const tokenStr = localStorage.getItem('convex_token');
    const id = localStorage.getItem('convex_team_id');
    if (!newProjectName || !tokenStr || !id) return;
    setLoading(true);
    try {
      await convexApi.createProject(id, newProjectName, tokenStr);
      setNewProjectName('');
      setTimeout(fetchProjects, 1500);
    } catch (err: any) {
      setError('ERRO_PROVISIONAMENTO: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDelete = async (projectId: string) => {
    const tokenStr = localStorage.getItem('convex_token');
    if (!tokenStr) return;
    setIsDeleting(true);
    try {
      await convexApi.deleteProject(projectId, tokenStr);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err: any) {
      setError('ERRO_PURGE: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Abre o túnel administrativo. Obtém a Admin Key instantaneamente.
   */
  const handleOpenPanel = async (deployment: ConvexDeployment) => {
    const tokenStr = localStorage.getItem('convex_token');
    if (!tokenStr) return;

    if (!deployment.deploymentName) {
      console.error('❌ [ALPHA_BASE] Deployment name is missing', deployment);
      setError('ERRO_TUNEL: Nome do deployment não localizado.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📡 [ALPHA_BASE] Iniciando túnel para: ${deployment.deploymentName}...`);
      const res = await convexApi.createDeployKey(deployment.deploymentName, tokenStr);
      
      const adminKey = res.key || res.deployKey || (res.data && res.data.key);

      if (!adminKey) {
        throw new Error("A API não retornou uma Admin Key válida. Verifique as permissões do Token.");
      }

      console.log('✅ [ALPHA_BASE] Handshake concluído.');
      
      setActiveEmbed({
        url: deployment.deploymentUrl,
        name: deployment.deploymentName,
        key: adminKey
      });
    } catch (err: any) {
      console.error('❌ [ALPHA_BASE] Erro no túnel:', err);
      setError('ERRO_TUNEL: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openExternalDashboard = (projectSlug: string) => {
    const dashboardUrl = `https://dashboard.convex.dev/p/${projectSlug}`;
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setTeamIdInput('');
    setProjects([]);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-[#39FF14] flex flex-col items-center p-4 font-mono selection:bg-[#39FF14] selection:text-black">
      {/* OVERLAY: DASHBOARD EMBUTIDO */}
      {activeEmbed && (
        <ConvexDashboardEmbed 
          deploymentName={activeEmbed.name}
          deploymentUrl={activeEmbed.url}
          adminKey={activeEmbed.key}
          onClose={() => setActiveEmbed(null)} 
        />
      )}

      {projectToDelete && (
        <DeleteConfirmationModal 
          project={projectToDelete} 
          onConfirm={handleExecuteDelete} 
          onCancel={() => setProjectToDelete(null)}
          loading={isDeleting}
          lang={lang}
        />
      )}

      <header className="w-full max-w-6xl flex justify-between items-center py-8 border-b border-[#39FF14]/30 mb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tighter italic neon-glow select-none uppercase">
            ALPHA<span className="text-white">BASE</span>
          </h1>
          <span className="text-[9px] tracking-[0.4em] opacity-50 uppercase">Network_v1.7.7_Operational</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 border border-[#39FF14]/30 p-1 px-2">
            <button 
              onClick={() => setLang('pt')} 
              className={`text-[10px] px-2 py-1 font-bold ${lang === 'pt' ? 'bg-[#39FF14] text-black' : 'text-[#39FF14]/50'}`}
            >
              PT
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`text-[10px] px-2 py-1 font-bold ${lang === 'en' ? 'bg-[#39FF14] text-black' : 'text-[#39FF14]/50'}`}
            >
              US
            </button>
          </div>

          {localStorage.getItem('convex_token') && (
            <>
              <div className="text-right">
                <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{t.CONNECTED_NODE}</p>
                <p className="text-xs font-bold text-white tracking-widest">{localStorage.getItem('convex_team_id')}</p>
              </div>
              <button onClick={logout} className="text-[10px] border border-red-500/50 text-red-500 px-5 py-2 hover:bg-red-500 hover:text-white transition-all uppercase font-bold tracking-widest bg-black active:scale-95">
                {t.TERMINATE}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="w-full max-w-6xl flex-grow">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center py-20 gap-10 animate-in fade-in duration-1000">
              <div className="text-center max-w-lg">
                <p className="text-3xl mb-4 font-black tracking-tighter italic neon-glow uppercase tracking-widest">{t.ACCESS_UPLINK}</p>
                <div className="bg-[#39FF14]/5 p-6 border border-[#39FF14]/20 text-[10px] text-left mb-8 space-y-2 opacity-80 uppercase leading-relaxed shadow-[inset_0_0_20px_rgba(57,255,20,0.05)]">
                  <p className="text-[#39FF14] font-bold border-b border-[#39FF14]/20 pb-1 text-center">{t.UPLINK_STATUS}</p>
                  <p>> MANAGEMENT_CORE: Operational</p>
                  <p>> DEPLOY_AUTO_SYNC: Enabled</p>
                  <p>> ADMIN_TUNNEL_V2: Ready</p>
                </div>
              </div>
              
              <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6 p-8 border border-[#39FF14] bg-black shadow-[0_0_80px_rgba(57,255,20,0.15)]">
                <NeonInput label="CONVEX_ACCESS_TOKEN" placeholder="cvx_at_..." value={token} onChange={(e) => setToken(e.target.value)} type="password" required />
                <NeonInput label="TEAM_ID" placeholder="Ex: 41" value={teamIdInput} onChange={(e) => setTeamIdInput(e.target.value)} required />
                <NeonButton type="submit" isLoading={loading}>{t.AUTHORIZE}</NeonButton>
                {error && <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase text-center animate-pulse">{error}</div>}
              </form>
            </div>
          } />

          <Route path="/dashboard" element={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-700">
              {/* LADO ESQUERDO: CONTROLE */}
              <div className="lg:col-span-4 flex flex-col gap-6 p-8 border border-[#39FF14] bg-black shadow-[inset_0_0_50px_rgba(57,255,20,0.05)] h-fit relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#39FF14]/20"></div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter border-b border-[#39FF14]/30 pb-3">{t.SYSTEM_CONTROL}</h2>
                <div className="flex flex-col gap-6">
                  <NeonInput label={t.PROVISION_NEW_PROJECT} placeholder="alpha-node-01" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                  <div className="bg-[#39FF14]/5 p-4 border border-[#39FF14]/10 text-[10px] space-y-1">
                    <p className="font-bold border-b border-[#39FF14]/10 mb-2 pb-1 text-[#39FF14]">{t.NODE_SPEC}</p>
                    <p>{t.ENV_TYPE} <span className="text-white">DEV_CORE</span></p>
                    <p>{t.CLASS} <span className="text-white">S16_CLOUD</span></p>
                    <p>{t.TUNNEL} <span className="text-white">AUTO_INJECT</span></p>
                  </div>
                  <NeonButton onClick={handleCreate} isLoading={loading}>{t.PROVISION_NODE}</NeonButton>
                  {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center leading-tight mt-2">{error}</p>}
                </div>
              </div>

              {/* LADO DIREITO: GRID DE PROJETOS */}
              <div className="lg:col-span-8 flex flex-col gap-6 relative">
                <div className="flex justify-between items-end border-b border-[#39FF14]/20 pb-4">
                  <div>
                    <h2 className="text-3xl font-black neon-glow tracking-tighter uppercase italic">{t.ACTIVE_GRID}</h2>
                    <p className="text-[9px] opacity-40 uppercase tracking-[0.3em] font-mono">{t.TELEMETRY_DESC}</p>
                  </div>
                  
                  <button 
                    onClick={fetchProjects}
                    className="w-12 h-12 border-2 border-dashed border-[#FF8C00] flex items-center justify-center hover:bg-[#FF8C00]/10 transition-all text-[#FF8C00] active:scale-95 disabled:opacity-30"
                    disabled={loading}
                  >
                    <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                <div className="border border-dashed border-[#FF8C00]/40 p-6 min-h-[450px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((p) => (
                      <div key={p.id} className="p-6 border border-[#39FF14]/20 bg-black hover:border-[#39FF14] hover:shadow-[0_0_30px_rgba(57,255,20,0.15)] transition-all group relative overflow-hidden flex flex-col min-h-[350px]">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <h3 className="text-xl font-black uppercase tracking-tight truncate max-w-[150px] italic">{p.name}</h3>
                            <span className="text-[9px] opacity-40 uppercase mt-2 font-bold tracking-widest text-[#39FF14]">ID: {p.id}</span>
                            <span className="text-[9px] opacity-40 uppercase font-bold tracking-widest text-[#39FF14]">SLUG: {p.slug}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-[#39FF14]/10 px-3 py-1 border border-[#39FF14]/30">
                            <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_5px_#39FF14] animate-pulse"></span>
                            <span className="text-[8px] font-bold text-[#39FF14]">{t.READY}</span>
                          </div>
                        </div>

                        {p.deployments && p.deployments.length > 0 ? (
                          <div className="mb-4 space-y-4">
                            <div className="p-2 bg-[#39FF14]/5 border border-[#39FF14]/20 text-[9px] shadow-[inset_0_0_10px_rgba(57,255,20,0.05)]">
                              <p className="opacity-40 uppercase text-[7px] mb-1 font-bold tracking-tighter">{t.ACTIVE_DEPLOYMENT}</p>
                              <p className="text-white truncate font-bold tracking-widest uppercase mb-1">{p.deployments[0].deploymentName}</p>
                              <p className="text-[#39FF14]/60 truncate lowercase italic font-mono">{p.deployments[0].deploymentUrl}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-[8px] text-red-500 uppercase italic font-bold text-center tracking-widest">
                            {t.PROVISIONING_INFRA}
                          </div>
                        )}

                        <div className="mt-auto">
                          <div className="grid grid-cols-2 gap-2 font-mono">
                            <button 
                              className="py-3 bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] text-[9px] font-black uppercase hover:bg-[#39FF14] hover:text-black transition-all shadow-[inset_0_0_10px_rgba(57,255,20,0.1)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                              onClick={() => {
                                if (p.deployments && p.deployments[0]) {
                                  handleOpenPanel(p.deployments[0]);
                                } else {
                                  setError("Nenhum deployment disponível.");
                                }
                              }}
                              disabled={loading || !p.deployments || p.deployments.length === 0}
                            >
                              {t.OPEN_INTEGRATED_PANEL}
                            </button>
                            
                            <button 
                              className="py-3 border border-[#39FF14]/40 text-[#39FF14] text-[9px] font-black uppercase hover:bg-[#39FF14]/20 transition-all active:scale-95"
                              onClick={() => openExternalDashboard(p.slug)}
                            >
                              {t.CONVEX_CLOUD_DASH}
                            </button>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <button 
                              className="py-2.5 px-8 border border-red-500/40 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                              onClick={() => setProjectToDelete(p)}
                            >
                              {t.DESTROY_PROJECT}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {projects.length === 0 && !loading && (
                      <div className="col-span-full py-32 text-center opacity-30 text-xs uppercase tracking-[0.8em] italic font-black animate-pulse">
                        {t.NO_ACTIVE_NODES}
                      </div>
                    )}
                    
                    {loading && (
                      <div className="col-span-full py-32 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_10px_#39FF14]"></div>
                        <p className="text-[10px] uppercase tracking-[0.5em] font-bold">{t.SYNCING_MATRIX}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>

      <footer className="w-full max-w-6xl py-12 mt-12 border-t border-[#39FF14]/10 text-[9px] uppercase opacity-40 tracking-[0.5em] flex flex-wrap justify-between gap-6 font-mono font-bold">
        <span>AlphaBase_Control_v1.7.7_STABLE</span>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping"></span>
             <span>Network: Secure</span>
          </div>
          <span>Security_Grade: Alpha_Zero</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
