import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Home, LogOut, CheckCircle, XCircle, Clock, Eye, Users, Copy, Key, Loader2, Download } from "lucide-react";
import { exportToExcel, MEDICO_COLUMNS, INSTITUICAO_COLUMNS } from "@/lib/exportExcel";
import { exportarMedicosPDF, exportarInstituicoesPDF } from "@/lib/pdfExport";
import DashboardProspeccao from "@/components/DashboardProspeccao";
import ImageUpload from "@/components/ImageUpload";
// [REMOVIDO] import IndicacoesTab from "@/components/IndicacoesTab";
// [DESATIVADO] import ConfiguracoesTab from "@/components/ConfiguracoesTab";
import { Link } from "wouter";
import { toast } from "sonner";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";
import { MUNICIPIOS_VALE_ITAJAI } from "@shared/colors";
import { validateMedicoForm, validateInstituicaoForm } from "@/lib/validation";
import { maskTelefone, maskMoeda, unmaskMoeda, calcularDesconto } from "@/lib/masks";
import { GerenciarProcedimentos } from "@/components/GerenciarProcedimentos";
import ApiKeysTab from "@/components/ApiKeysTab";
import WebhooksTab from "@/components/WebhooksTab";

type MedicoForm = {
  id?: number;
  nome: string;
  especialidade: string;
  numeroRegistroConselho?: string;
  subespecialidade?: string;
  areaAtuacao?: string;
  municipio: string;
  endereco: string;
  telefone?: string;
  whatsapp?: string;
  whatsappSecretaria?: string;
  telefoneOrganizacao?: string;
  logoUrl?: string;
  fotoUrl?: string;
  logoFile?: File;
  fotoFile?: File;
  tipoAtendimento: "presencial" | "telemedicina" | "ambos";
  precoConsulta?: string;
  valorParticular?: string;
  valorAssinanteVital?: string;
  descontoPercentual: number;
  observacoes?: string;
  contatoParceria?: string;
  whatsappParceria?: string;
  email?: string;
};

type InstituicaoForm = {
  id?: number;
  nome: string;
  tipoServico: "servicos_saude" | "outros_servicos";
  categoria: string;
  municipio: string;
  endereco: string;
  telefone?: string;
  whatsappSecretaria?: string;
  email?: string;
  logoUrl?: string;
  fotoUrl?: string;
  logoFile?: File;
  fotoFile?: File;
  observacoes?: string;
  contatoParceria?: string;
  whatsappParceria?: string;
};



export default function Admin() {
  const { user, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  // Nota: Admin usa Manus OAuth e verifica user.role (não usuáriosAutorizados)

  const [medicoDialogOpen, setMedicoDialogOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<MedicoForm | null>(null);
  const [instituicaoDialogOpen, setInstituicaoDialogOpen] = useState(false);
  const [editingInstituicao, setEditingInstituicao] = useState<InstituicaoForm | null>(null);

  const { data: medicos = [] } = trpc.medicos.listar.useQuery({});
  const { data: instituicoes = [] } = trpc.instituicoes.listar.useQuery({});
  
  // Queries para contadores de pendências
  const { data: solicitacoesPendentes = [] } = trpc.parceria.listar.useQuery({ status: "pendente" });
  const { data: atualizacoesPendentes = [] } = trpc.atualizacao.listar.useQuery({ status: "pendente" });
  
  // Calcular total de pendências
  const totalPendencias = solicitacoesPendentes.length + atualizacoesPendentes.length;

  const criarMedico = trpc.medicos.criar.useMutation({
    onSuccess: () => {
      utils.medicos.listar.invalidate();
      setMedicoDialogOpen(false);
      setEditingMedico(null);
      toast.success("Médico adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar médico: " + error.message);
    },
  });

  const criarTokenAtualizacao = trpc.tokens.criar.useMutation({
    onError: (error: any) => {
      toast.error("Erro ao gerar token: " + error.message);
    },
  });

  const criarTokenCadastro = trpc.tokens.criarCadastro.useMutation({
    onError: (error: any) => {
      toast.error("Erro ao gerar token de cadastro: " + error.message);
    },
  });

  const atualizarMedico = trpc.medicos.atualizar.useMutation({
    onSuccess: () => {
      utils.medicos.listar.invalidate();
      setMedicoDialogOpen(false);
      setEditingMedico(null);
      toast.success("Médico atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar médico: " + error.message);
    },
  });

  const excluirMedico = trpc.medicos.excluir.useMutation({
    onSuccess: () => {
      utils.medicos.listar.invalidate();
      toast.success("Médico removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover médico: " + error.message);
    },
  });

  const criarInstituicao = trpc.instituicoes.criar.useMutation({
    onSuccess: () => {
      utils.instituicoes.listar.invalidate();
      toast.success("Serviço adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar clínica: " + error.message);
    },
  });

  const atualizarInstituicao = trpc.instituicoes.atualizar.useMutation({
    onSuccess: () => {
      utils.instituicoes.listar.invalidate();
      toast.success("Serviço atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar clínica: " + error.message);
    },
  });

  const excluirInstituicao = trpc.instituicoes.excluir.useMutation({
    onSuccess: () => {
      utils.instituicoes.listar.invalidate();
      toast.success("Clínica removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover clínica: " + error.message);
    },
  });

  const handleSalvarMedico = (data: MedicoForm) => {
    // Validar campos obrigatórios
    const errors = validateMedicoForm(data);
    if (errors.length > 0) {
      toast.error("Preencha todos os campos obrigatórios: " + errors.map(e => e.message).join(", "));
      return;
    }
    
    // Remover campos File que não devem ser enviados
    const { logoFile, fotoFile, ...rest } = data;
    
    // Converter null para string vazia em campos de texto
    const dadosLimpos = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        value === null || value === undefined ? "" : value
      ])
    );
    
    if (data.id) {
      atualizarMedico.mutate({ id: data.id, data: dadosLimpos as any });
    } else {
      criarMedico.mutate(dadosLimpos as any);
    }
  };

  const handleSalvarInstituicao = (data: InstituicaoForm) => {
    // Validar campos obrigatórios
    const errors = validateInstituicaoForm(data);
    if (errors.length > 0) {
      toast.error("Preencha todos os campos obrigatórios: " + errors.map(e => e.message).join(", "));
      return;
    }
    
    // Remover campos File que não devem ser enviados
    const { logoFile, fotoFile, ...rest } = data;
    
    // Converter null para string vazia em campos de texto
    const dadosLimpos = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        value === null || value === undefined ? "" : value
      ])
    );
    
    if (data.id) {
      atualizarInstituicao.mutate({ id: data.id, data: dadosLimpos as any });
    } else {
      criarInstituicao.mutate(dadosLimpos as any);
    }
    setInstituicaoDialogOpen(false);
    setEditingInstituicao(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={APP_LOGO} alt="Vital Logo" className="h-20 w-auto mx-auto mb-4" />
            <CardTitle>Área Administrativa</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Faça login para gerenciar os credenciados
            </p>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = getLoginUrl()}>
              Fazer Login
            </Button>
            <Link href="/dados-internos">
              <Button variant="outline" className="w-full mt-2">
                <Home className="h-4 w-4 mr-2" />
                Voltar para página inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se usuário tem role Admin (Manus OAuth)
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={APP_LOGO} alt="Vital Logo" className="h-20 w-auto mx-auto mb-4" />
            <CardTitle>Acesso Restrito</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Você tem nível de acesso "Visualizador" e pode apenas consultar dados internos.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Para acessar o painel administrativo completo, solicite ao administrador que altere seu nível de acesso para "Admin".
            </p>
            <Link href="/dados-internos">
              <Button className="w-full mt-4">
                <Home className="h-4 w-4 mr-2" />
                Ir para Dados Internos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="Vital Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-3xl font-bold">Painel Administrativo</h1>
                <p className="text-primary-foreground/90 text-sm mt-1">
                  Gerenciamento de credenciados
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Link href="/dados-internos" className="inline-block">
                <Button variant="secondary" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dados Internos
                </Button>
              </Link>
              <Link href="/galeria-parceiros" className="inline-block">
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Galeria
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Dashboard de Crescimento */}
        <DashboardCrescimento />
        
        <Tabs defaultValue="medicos">
          <div className="max-w-6xl mx-auto mb-6 space-y-2">
            {/* Primeira linha */}
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-auto gap-2 bg-transparent p-1 md:grid md:w-full md:grid-cols-5">
              <TabsTrigger value="medicos" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Médicos</TabsTrigger>
              <TabsTrigger value="instituicoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Serviços</TabsTrigger>
              <TabsTrigger value="solicitacoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white relative">
                Solicitações
                {solicitacoesPendentes.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {solicitacoesPendentes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="atualizacoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white relative">
                Atualizações
                {atualizacoesPendentes.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {atualizacoesPendentes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white" title="Usuários cadastrados na plataforma (público)">Usuários Públicos</TabsTrigger>
              </TabsList>
            </div>
            {/* Segunda linha */}
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-auto gap-2 bg-transparent p-1 md:grid md:w-full md:grid-cols-5">
              <TabsTrigger value="acessos" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white" title="Acessos administrativos e permissões internas">Acessos Admin</TabsTrigger>
              <TabsTrigger value="prospeccao" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Prospecção</TabsTrigger>
              <TabsTrigger value="apikeys" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">API Keys</TabsTrigger>
              <TabsTrigger value="webhooks" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Webhooks</TabsTrigger>
              <TabsTrigger value="configuracoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Configurações</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Médicos */}
          <TabsContent value="medicos">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Médicos Credenciados</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (medicos.length === 0) {
                          toast.error("Nenhum médico para exportar");
                          return;
                        }
                        exportToExcel(medicos, MEDICO_COLUMNS, `medicos_credenciados_${new Date().toISOString().split('T')[0]}`);
                        toast.success(`${medicos.length} médicos exportados com sucesso!`);
                      }}
                      title="Exportar Excel"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline ml-2">Excel</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (medicos.length === 0) {
                          toast.error("Nenhum médico para exportar");
                          return;
                        }
                        exportarMedicosPDF(medicos as any);
                        toast.success(`PDF de ${medicos.length} médicos gerado com sucesso!`);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      title="Exportar PDF"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M9 13h6"/>
                        <path d="M9 17h6"/>
                      </svg>
                      <span className="hidden md:inline ml-2">PDF</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await criarTokenCadastro.mutateAsync({
                            tipoCredenciado: "medico",
                          });
                          const baseUrl = window.location.origin;
                          const linkCadastro = `${baseUrl}/cadastro-medico/${result.token}`;
                          const mensagem = `Segue o link para realizar seu cadastro na plataforma de Credenciados Vital:\n${linkCadastro}\n\nSua Saúde Vital - sempre ao seu lado.`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                          window.open(whatsappUrl, "_blank");
                          toast.success("Link de cadastro gerado com sucesso!");
                        } catch (error) {
                          console.error("Erro ao gerar token:", error);
                          toast.error("Erro ao gerar link de cadastro");
                        }
                      }}
                      title="Enviar Link de Cadastro"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Enviar Link</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await criarTokenCadastro.mutateAsync({
                            tipoCredenciado: "medico",
                          });
                          const baseUrl = window.location.origin;
                          const linkCadastro = `${baseUrl}/cadastro-medico/${result.token}`;
                          navigator.clipboard.writeText(linkCadastro);
                          toast.success("Link de cadastro copiado!");
                        } catch (error) {
                          console.error("Erro ao gerar token:", error);
                          toast.error("Erro ao gerar link de cadastro");
                        }
                      }}
                      title="Copiar Link de Cadastro"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Copiar Link</span>
                    </Button>
                    <Dialog open={medicoDialogOpen} onOpenChange={setMedicoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setEditingMedico(null)} title="Adicionar Médico">
                          <Plus className="h-4 w-4" />
                          <span className="hidden lg:inline ml-2">Adicionar</span>
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingMedico?.id ? "Editar Médico" : "Adicionar Médico"}
                        </DialogTitle>
                      </DialogHeader>
                      <MedicoFormDialog
                        medico={editingMedico}
                        onSave={handleSalvarMedico}
                        onCancel={() => {
                          setMedicoDialogOpen(false);
                          setEditingMedico(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Município</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            Nenhum médico cadastrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        medicos.map((medico) => (
                          <TableRow key={medico.id}>
                            <TableCell className="font-medium">{medico.nome}</TableCell>
                            <TableCell>{medico.especialidade}</TableCell>
                            <TableCell>{medico.municipio}</TableCell>
                            <TableCell>{medico.precoConsulta || "Não informado"}</TableCell>
                            <TableCell>{medico.descontoPercentual}%</TableCell>
                            <TableCell>{medico.telefone || medico.whatsapp || "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={async () => {
                                    try {
                                      // Gerar token de atualização
                                      const result = await criarTokenAtualizacao.mutateAsync({
                                        tipoCredenciado: "medico",
                                        credenciadoId: medico.id,
                                        telefone: medico.telefone || medico.whatsapp || undefined,
                                      });

                                      const baseUrl = window.location.origin;
                                      const linkAtualizacao = `${baseUrl}/atualizar-dados/${result.token}`;
                                      const mensagem = `📏 *Atualização do Guia do Assinante Vital*\n\nOlá, Dr(a). ${medico.nome}! 👋\n\nPara mantermos nosso *Guia de Credenciados* sempre atualizado, solicitamos a atualização dos seus dados cadastrais.\n\n🔗 *Acesse o link abaixo para atualizar:*\n${linkAtualizacao}\n\n*Vital Serviços Médicos*\n*Sua Saúde Vital - sempre ao seu lado.*`;
                                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                                      window.open(whatsappUrl, "_blank");
                                      toast.success("Link de atualização gerado com sucesso!");
                                    } catch (error) {
                                      console.error("Erro ao gerar token:", error);
                                    }
                                  }}
                                  title="Enviar link de atualização via WhatsApp"
                                >
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={async () => {
                                    try {
                                      const result = await criarTokenAtualizacao.mutateAsync({
                                        tipoCredenciado: "medico",
                                        credenciadoId: medico.id,
                                        telefone: medico.telefone || medico.whatsapp || undefined,
                                      });
                                      const baseUrl = window.location.origin;
                                      const linkAtualizacao = `${baseUrl}/atualizar-dados/${result.token}`;
                                      await navigator.clipboard.writeText(linkAtualizacao);
                                      toast.success("Link copiado!");
                                    } catch (error) {
                                      toast.error("Erro ao gerar link");
                                    }
                                  }}
                                  title="Copiar link de atualização"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={async () => {
                                    try {
                                      const textoCompleto = `📝 *DADOS DO MÉDICO CREDENCIADO*\n\n` +
                                        `👨‍⚕️ *Nome:* ${medico.nome}\n` +
                                        `🏫 *Especialidade:* ${medico.especialidade}\n` +
                                        `${medico.numeroRegistroConselho ? `📝 *Registro:* ${medico.numeroRegistroConselho}\n` : ''}` +
                                        `${medico.subespecialidade ? `🏫 *Subespecialidade:* ${medico.subespecialidade}\n` : ''}` +
                                        `${medico.areaAtuacao ? `🏫 *Área de Atuação:* ${medico.areaAtuacao}\n` : ''}` +
                                        `🏙️ *Município:* ${medico.municipio}\n` +
                                        `${medico.endereco ? `📍 *Endereço:* ${medico.endereco}\n` : ''}` +
                                        `${medico.telefone ? `📞 *Telefone:* ${medico.telefone}\n` : ''}` +
                                        `${medico.whatsapp ? `📱 *WhatsApp:* ${medico.whatsapp}\n` : ''}` +
                                        `${medico.email ? `✉️ *Email:* ${medico.email}\n` : ''}` +
                                        `\n💰 *PREÇOS E DESCONTOS*\n` +
                                        `${medico.precoConsulta ? `💵 *Valor Particular:* R$ ${medico.precoConsulta}\n` : ''}` +
                                        `🎫 *Desconto Assinante Vital:* ${medico.descontoPercentual}%\n` +
                                        `${medico.precoConsulta ? `💚 *Valor com Desconto:* R$ ${(parseFloat(medico.precoConsulta.replace(',', '.')) * (1 - medico.descontoPercentual / 100)).toFixed(2).replace('.', ',')}\n` : ''}` +
                                        `\n📅 *ATENDIMENTO*\n` +
                                        `📍 *Tipo:* ${medico.tipoAtendimento === 'presencial' ? 'Presencial' : medico.tipoAtendimento === 'telemedicina' ? 'Telemedicina' : 'Presencial e Telemedicina'}\n` +
                                        `${medico.observacoes ? `\n📝 *Observações:*\n${medico.observacoes}\n` : ''}` +
                                        `\n———————————\n💚 *Vital Serviços Médicos*\n*Sua Saúde Vital*`;
                                      
                                      await navigator.clipboard.writeText(textoCompleto);
                                      toast.success("Texto completo copiado! Pronto para enviar ao parceiro.");
                                    } catch (error) {
                                      toast.error("Erro ao copiar texto");
                                    }
                                  }}
                                  title="Copiar texto completo com todas as informações"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingMedico(medico as MedicoForm);
                                    setMedicoDialogOpen(true);
                                  }}
                                  title="Editar médico"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover este médico?")) {
                                      excluirMedico.mutate(medico.id);
                                    }
                                  }}
                                  title="Excluir médico"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Serviços */}
          <TabsContent value="instituicoes">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Serviços Parceiros</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (instituicoes.length === 0) {
                          toast.error("Nenhum serviço para exportar");
                          return;
                        }
                        exportToExcel(instituicoes, INSTITUICAO_COLUMNS, `servicos_parceiros_${new Date().toISOString().split('T')[0]}`);
                        toast.success(`${instituicoes.length} serviços exportados com sucesso!`);
                      }}
                      title="Exportar Excel"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline ml-2">Excel</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (instituicoes.length === 0) {
                          toast.error("Nenhum serviço para exportar");
                          return;
                        }
                        // Separar por tipo de serviço
                        const servicosSaude = instituicoes.filter(i => (i as any).tipoServico === 'servicos_saude');
                        const outrosServicos = instituicoes.filter(i => (i as any).tipoServico === 'outros_servicos');
                        
                        if (servicosSaude.length > 0) {
                          exportarInstituicoesPDF(servicosSaude as any, 'servicos_saude');
                        }
                        if (outrosServicos.length > 0) {
                          setTimeout(() => {
                            exportarInstituicoesPDF(outrosServicos as any, 'outros_servicos');
                          }, 500);
                        }
                        toast.success(`PDFs gerados: ${servicosSaude.length} Serviços de Saúde + ${outrosServicos.length} Outros Serviços`);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      title="Exportar PDF"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M9 13h6"/>
                        <path d="M9 17h6"/>
                      </svg>
                      <span className="hidden md:inline ml-2">PDF</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await criarTokenCadastro.mutateAsync({
                            tipoCredenciado: "instituicao",
                          });
                          const baseUrl = window.location.origin;
                          const linkCadastro = `${baseUrl}/cadastro-servico/${result.token}`;
                          const mensagem = `Segue o link para realizar seu cadastro na plataforma de Credenciados Vital:\n${linkCadastro}\n\nSua Saúde Vital - sempre ao seu lado.`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                          window.open(whatsappUrl, "_blank");
                          toast.success("Link de cadastro gerado com sucesso!");
                        } catch (error) {
                          console.error("Erro ao gerar token:", error);
                          toast.error("Erro ao gerar link de cadastro");
                        }
                      }}
                      title="Enviar Link de Cadastro"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Enviar Link</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await criarTokenCadastro.mutateAsync({
                            tipoCredenciado: "instituicao",
                          });
                          const baseUrl = window.location.origin;
                          const linkCadastro = `${baseUrl}/cadastro-servico/${result.token}`;
                          navigator.clipboard.writeText(linkCadastro);
                          toast.success("Link de cadastro copiado!");
                        } catch (error) {
                          console.error("Erro ao gerar token:", error);
                          toast.error("Erro ao gerar link de cadastro");
                        }
                      }}
                      title="Copiar Link de Cadastro"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Copiar Link</span>
                    </Button>
                    <Dialog open={instituicaoDialogOpen} onOpenChange={setInstituicaoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setEditingInstituicao(null)} title="Adicionar Serviço">
                          <Plus className="h-4 w-4" />
                          <span className="hidden lg:inline ml-2">Adicionar</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingInstituicao?.id ? "Editar Serviço" : "Adicionar Serviço"}
                          </DialogTitle>
                        </DialogHeader>
                        <InstituicaoFormDialog
                          instituicao={editingInstituicao}
                          onSave={handleSalvarInstituicao}
                          onCancel={() => {
                            setInstituicaoDialogOpen(false);
                            setEditingInstituicao(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Município</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instituicoes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            Nenhuma clínica cadastrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        instituicoes.map((inst) => (
                          <TableRow key={inst.id}>
                            <TableCell className="font-medium">{inst.nome}</TableCell>
                            <TableCell className="capitalize">{inst.categoria}</TableCell>
                            <TableCell>{inst.municipio}</TableCell>
                            <TableCell>{inst.precoConsulta || "Não informado"}</TableCell>
                            <TableCell>{inst.descontoPercentual}%</TableCell>
                            <TableCell>{inst.telefone || "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GerenciarProcedimentos 
                                  instituicaoId={inst.id} 
                                  instituicaoNome={inst.nome} 
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={async () => {
                                    try {
                                      // Gerar token de atualização
                                      const result = await criarTokenAtualizacao.mutateAsync({
                                        tipoCredenciado: "instituicao",
                                        credenciadoId: inst.id,
                                        telefone: inst.telefone || inst.whatsappSecretaria || undefined,
                                      });

                                      const baseUrl = window.location.origin;
                                      const linkAtualizacao = `${baseUrl}/atualizar-dados/${result.token}`;
                                      const mensagem = `📏 *Atualização do Guia do Assinante Vital*\n\nOlá, ${inst.nome}! 👋\n\nPara mantermos nosso *Guia de Credenciados* sempre atualizado, solicitamos a atualização dos seus dados cadastrais.\n\n🔗 *Acesse o link abaixo para atualizar:*\n${linkAtualizacao}\n\n*Vital Serviços Médicos*\n*Sua Saúde Vital - sempre ao seu lado.*`;
                                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                                      window.open(whatsappUrl, "_blank");
                                      toast.success("Link de atualização gerado com sucesso!");
                                    } catch (error) {
                                      console.error("Erro ao gerar token:", error);
                                    }
                                  }}
                                  title="Enviar link de atualização via WhatsApp"
                                >
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={async () => {
                                    try {
                                      const result = await criarTokenAtualizacao.mutateAsync({
                                        tipoCredenciado: "instituicao",
                                        credenciadoId: inst.id,
                                        telefone: inst.telefone || inst.whatsappSecretaria || undefined,
                                      });
                                      const baseUrl = window.location.origin;
                                      const linkAtualizacao = `${baseUrl}/atualizar-dados/${result.token}`;
                                      await navigator.clipboard.writeText(linkAtualizacao);
                                      toast.success("Link copiado!");
                                    } catch (error) {
                                      toast.error("Erro ao gerar link");
                                    }
                                  }}
                                  title="Copiar link de atualização"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={async () => {
                                    try {
                                      const textoCompleto = `📝 *DADOS DA INSTITUIÇÃO CREDENCIADA*\n\n` +
                                        `🏪 *Nome:* ${inst.nome}\n` +
                                        `🏷️ *Categoria:* ${inst.categoria}\n` +
                                        `🏙️ *Município:* ${inst.municipio}\n` +
                                        `${inst.endereco ? `📍 *Endereço:* ${inst.endereco}\n` : ''}` +
                                        `${inst.telefone ? `📞 *Telefone:* ${inst.telefone}\n` : ''}` +
                                        `${inst.whatsappSecretaria ? `📱 *WhatsApp Secretaria:* ${inst.whatsappSecretaria}\n` : ''}` +
                                        `${inst.email ? `✉️ *Email:* ${inst.email}\n` : ''}` +
                                        `\n💰 *PREÇOS E DESCONTOS*\n` +
                                        `${inst.precoConsulta ? `💵 *Valor Particular:* R$ ${inst.precoConsulta}\n` : ''}` +
                                        `🎫 *Desconto Assinante Vital:* ${inst.descontoPercentual}%\n` +
                                        `${inst.precoConsulta ? `💚 *Valor com Desconto:* R$ ${(parseFloat(inst.precoConsulta.replace(',', '.')) * (1 - inst.descontoPercentual / 100)).toFixed(2).replace('.', ',')}\n` : ''}` +
                                        `${inst.observacoes ? `\n📝 *Observações:*\n${inst.observacoes}\n` : ''}` +
                                        `\n———————————\n💚 *Vital Serviços Médicos*\n*Sua Saúde Vital*`;
                                      
                                      await navigator.clipboard.writeText(textoCompleto);
                                      toast.success("Texto completo copiado! Pronto para enviar ao parceiro.");
                                    } catch (error) {
                                      toast.error("Erro ao copiar texto");
                                    }
                                  }}
                                  title="Copiar texto completo com todas as informações"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={async () => {
                                    try {
                                      const result = await criarTokenAtualizacao.mutateAsync({
                                        tipoCredenciado: "instituicao",
                                        credenciadoId: inst.id,
                                        telefone: inst.telefone || inst.whatsappSecretaria || undefined,
                                      });
                                      const baseUrl = window.location.origin;
                                      const linkAtualizacao = `${baseUrl}/atualizar-dados/${result.token}`;
                                      window.open(linkAtualizacao, "_blank");
                                      toast.success("Abrindo formulário de edição...");
                                    } catch (error) {
                                      console.error("Erro ao gerar token:", error);
                                      toast.error("Erro ao abrir formulário");
                                    }
                                  }}
                                  title="Editar serviço"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover esta clínica?")) {
                                      excluirInstituicao.mutate(inst.id);
                                    }
                                  }}
                                  title="Excluir clínica"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Solicitações de Parceria */}
          <TabsContent value="solicitacoes">
            <SolicitacoesTab />
          </TabsContent>

          {/* Tab Atualizações Pendentes */}
          <TabsContent value="atualizacoes">
            <AtualizacoesPendentesTab />
          </TabsContent>

          {/* Tab Usuários Manus (OAuth) */}
          <TabsContent value="usuarios">
            <UsuariosManusTab />
          </TabsContent>

          {/* Tab Usuários Autorizados (Dados Internos) */}
          <TabsContent value="acessos">
            <UsuariosAutorizadosTab />
          </TabsContent>

          {/* Tab Prospecção */}
          <TabsContent value="prospeccao">
            <DashboardProspeccao />
          </TabsContent>

          {/* [REMOVIDO] Tab Indicações */}
          {/* <TabsContent value="indicacoes">
            <IndicacoesTab />
          </TabsContent> */}

          {/* Tab API Keys */}
          <TabsContent value="apikeys">
            <ApiKeysTab />
          </TabsContent>

          {/* Tab Webhooks */}
          <TabsContent value="webhooks">
            <WebhooksTab />
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="configuracoes">
            <ConfiguracoesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DashboardCrescimento() {
  const { data: stats, isLoading } = trpc.estatisticas.crescimento.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const crescimentoPositivo = stats.crescimentoPercentual >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-4 md:px-0">
      {/* Total de Credenciados */}
      <Card className="border-l-4 border-l-[#1e9d9f]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Credenciados</p>
              <p className="text-3xl font-bold text-[#1e9d9f] mt-2">{stats.totalCredenciados}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalMedicos} médicos + {stats.totalInstituicoes} instituições
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#1e9d9f]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1e9d9f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ativos */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Credenciados Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalAtivos}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.totalAtivos / stats.totalCredenciados) * 100).toFixed(1)}% do total
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Novos Esta Semana */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Novos Esta Semana</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">+{stats.novosSemana}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.novosMedicosSemana} médicos + {stats.novasInstituicoesSemana} instituições
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crescimento Mensal */}
      <Card className={`border-l-4 ${crescimentoPositivo ? 'border-l-emerald-500' : 'border-l-orange-500'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Crescimento Mensal</p>
              <p className={`text-3xl font-bold mt-2 ${crescimentoPositivo ? 'text-emerald-600' : 'text-orange-600'}`}>
                {crescimentoPositivo ? '+' : ''}{stats.crescimentoPercentual}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.novosMesAtual} este mês vs {stats.novosMesPassado} mês passado
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full ${crescimentoPositivo ? 'bg-emerald-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${crescimentoPositivo ? 'text-emerald-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {crescimentoPositivo ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MedicoFormDialog({
  medico,
  onSave,
  onCancel,
}: {
  medico: MedicoForm | null;
  onSave: (data: MedicoForm) => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [usarImagemPadrao, setUsarImagemPadrao] = useState(false);
  const uploadImagem = trpc.upload.imagem.useMutation();

  const [formData, setFormData] = useState<MedicoForm>(
    medico || {
      nome: "",
      especialidade: "",
      numeroRegistroConselho: "",
      subespecialidade: "",
      areaAtuacao: "",
      municipio: "",
      endereco: "",
      telefone: "",
      whatsapp: "",
      whatsappSecretaria: "",
      telefoneOrganizacao: "",
      fotoUrl: "",
      tipoAtendimento: "presencial",
      precoConsulta: "",
      valorParticular: "",
      valorAssinanteVital: "",
      descontoPercentual: 0,
      observacoes: "",
      contatoParceria: "",
      whatsappParceria: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const updatedData = { ...formData };

      // Upload logo se houver arquivo selecionado
      if (formData.logoFile) {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/xxx;base64,
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.logoFile!);
        });

        const { url } = await uploadImagem.mutateAsync({
          base64: base64Data,
          filename: formData.logoFile.name,
          contentType: formData.logoFile.type,
        });
        updatedData.logoUrl = url;
      }

      // Upload foto se houver arquivo selecionado
      if (formData.fotoFile) {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.fotoFile!);
        });

        const { url } = await uploadImagem.mutateAsync({
          base64: base64Data,
          filename: formData.fotoFile.name,
          contentType: formData.fotoFile.type,
        });
        updatedData.fotoUrl = url;
      }

      onSave(updatedData);
    } catch (error) {
      toast.error("Erro ao fazer upload das imagens: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome do Médico *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="especialidade">Especialidade *</Label>
          <Input
            id="especialidade"
            value={formData.especialidade}
            onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
            required
          />
        </div>


        <div>
          <Label htmlFor="numeroRegistroConselho">Número de Registro (CRM/CRO/etc)</Label>
          <Input
            id="numeroRegistroConselho"
            value={formData.numeroRegistroConselho || ""}
            onChange={(e) => setFormData({ ...formData, numeroRegistroConselho: e.target.value })}
            placeholder="Ex: CRM 12345"
          />
        </div>
        <div>
          <Label htmlFor="subespecialidade">Subespecialidade</Label>
          <Input
            id="subespecialidade"
            value={formData.subespecialidade || ""}
            onChange={(e) => setFormData({ ...formData, subespecialidade: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="areaAtuacao">Área de Atuação Principal</Label>
          <Input
            id="areaAtuacao"
            value={formData.areaAtuacao || ""}
            onChange={(e) => setFormData({ ...formData, areaAtuacao: e.target.value })}
            placeholder="Ex: foco em saúde mental, atendimento infantil, etc."
          />
        </div>

        <div>
          <Label htmlFor="municipio">Município *</Label>
          <Input
            id="municipio"
            value={formData.municipio}
            onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="tipoAtendimento">Tipo de Atendimento *</Label>
          <Select
            value={formData.tipoAtendimento}
            onValueChange={(v: any) => setFormData({ ...formData, tipoAtendimento: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="telemedicina">Telemedicina</SelectItem>
              <SelectItem value="ambos">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="endereco">Endereço *</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            required
          />
        </div>


        <div>
          <Label htmlFor="telefone">Telefone Fixo</Label>
          <Input
            id="telefone"
            value={formData.telefone || ""}
            onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
            placeholder="(47) 3333-4444"
          />
        </div>

        <div>
          <Label htmlFor="whatsappSecretaria">WhatsApp Secretária/Agendamento *</Label>
          <Input
            id="whatsappSecretaria"
            value={formData.whatsappSecretaria || ""}
            onChange={(e) => setFormData({ ...formData, whatsappSecretaria: maskTelefone(e.target.value) })}
            placeholder="(47) 99999-8888"
            required
          />
        </div>

        {/* Checkbox Usar Imagem Padrão */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="usarImagemPadraoAdmin"
              checked={usarImagemPadrao}
              onChange={(e) => {
                setUsarImagemPadrao(e.target.checked);
                if (e.target.checked) {
                  setFormData({ 
                    ...formData, 
                    fotoUrl: "",
                    logoUrl: "",
                    fotoFile: undefined,
                    logoFile: undefined
                  });
                }
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="usarImagemPadraoAdmin" className="text-sm text-muted-foreground cursor-pointer">
              Usar imagem padrão (vou inserir imagem em breve)
            </label>
          </div>
        </div>

        {!usarImagemPadrao && (
          <>
            <div>
              <ImageUpload
                label="Logo do Estabelecimento"
                value={formData.logoUrl}
                onChange={(file, preview) => {
                  setFormData({ 
                    ...formData, 
                    logoFile: file || undefined,
                    logoUrl: preview || formData.logoUrl
                  });
                }}
              />
            </div>

            <div>
              <ImageUpload
                label="Foto do Médico"
                value={formData.fotoUrl}
                onChange={(file, preview) => {
                  setFormData({ 
                    ...formData, 
                    fotoFile: file || undefined,
                    fotoUrl: preview || formData.fotoUrl
                  });
                }}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="contatoParceria">Nome do Responsável pelo Cadastro</Label>
          <Input
            id="contatoParceria"
            placeholder="Nome do responsável"
            value={formData.contatoParceria || ""}
            onChange={(e) => setFormData({ ...formData, contatoParceria: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="whatsappParceria">WhatsApp do Responsável pelo Cadastro *</Label>
          <Input
            id="whatsappParceria"
            value={formData.whatsappParceria || ""}
            onChange={(e) => setFormData({ ...formData, whatsappParceria: maskTelefone(e.target.value) })}
            placeholder="(47) 99999-6666"
            required
          />
        </div>

        {/* Campos de Preço */}
        <div>
          <Label htmlFor="valorParticular">Valor Particular *</Label>
          <Input
            id="valorParticular"
            value={formData.valorParticular || ""}
            onChange={(e) => {
              const masked = maskMoeda(e.target.value);
              setFormData({ ...formData, valorParticular: masked });
            }}
            placeholder="R$ 0,00"
            required
          />
        </div>

        <div>
          <Label htmlFor="valorAssinanteVital">Valor Assinante Vital *</Label>
          <Input
            id="valorAssinanteVital"
            value={formData.valorAssinanteVital || ""}
            onChange={(e) => {
              const masked = maskMoeda(e.target.value);
              setFormData({ ...formData, valorAssinanteVital: masked });
            }}
            placeholder="R$ 0,00"
            required
          />
        </div>

        {/* Mostrar desconto calculado */}
        {formData.valorParticular && formData.valorAssinanteVital && (
          <div className="col-span-2">
            <div className="bg-teal-50 border border-teal-200 rounded-md p-3">
              <p className="text-sm text-teal-800">
                <strong>Desconto calculado:</strong> {calcularDesconto(formData.valorParticular, formData.valorAssinanteVital)}% para assinantes Vital
              </p>
            </div>
          </div>
        )}

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes || ""}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}



// Componente para exibir e editar procedimentos de uma solicitação
function ProcedimentosSolicitacaoSection({ solicitacaoId }: { solicitacaoId: number }) {
  const utils = trpc.useUtils();
  const [editando, setEditando] = useState(false);
  const [novoProcedimento, setNovoProcedimento] = useState({
    nome: '',
    valorParticular: '',
    valorAssinante: '',
  });

  const { data: procedimentos, isLoading } = trpc.procedimentosSolicitacao.listar.useQuery({ solicitacaoId });

  const criarMutation = trpc.procedimentosSolicitacao.criar.useMutation({
    onSuccess: () => {
      toast.success('Procedimento adicionado');
      utils.procedimentosSolicitacao.listar.invalidate();
      setNovoProcedimento({ nome: '', valorParticular: '', valorAssinante: '' });
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar procedimento', { description: error.message });
    },
  });

  const atualizarMutation = trpc.procedimentosSolicitacao.atualizar.useMutation({
    onSuccess: () => {
      toast.success('Procedimento atualizado');
      utils.procedimentosSolicitacao.listar.invalidate();
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar procedimento', { description: error.message });
    },
  });

  const deletarMutation = trpc.procedimentosSolicitacao.excluir.useMutation({
    onSuccess: () => {
      toast.success('Procedimento removido');
      utils.procedimentosSolicitacao.listar.invalidate();
    },
    onError: (error: any) => {
      toast.error('Erro ao remover procedimento', { description: error.message });
    },
  });

  const handleAdicionar = () => {
    if (!novoProcedimento.nome.trim()) {
      toast.error('Nome do procedimento é obrigatório');
      return;
    }
    criarMutation.mutate({
      solicitacaoId,
      ...novoProcedimento,
    });
  };

  const handleAtualizar = (id: number, dados: { nome: string; valorParticular: string; valorAssinante: string }) => {
    atualizarMutation.mutate({ id, ...dados });
  };

  const handleDeletar = (id: number) => {
    if (confirm('Deseja remover este procedimento?')) {
      deletarMutation.mutate(id);
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-base font-semibold">Procedimentos / Serviços Cadastrados</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditando(!editando)}
        >
          {editando ? 'Concluir Edição' : 'Editar Procedimentos'}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">Carregando procedimentos...</div>
      ) : !procedimentos || procedimentos.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground bg-muted rounded-lg">
          Nenhum procedimento cadastrado nesta solicitação
        </div>
      ) : (
        <div className="space-y-2">
          {procedimentos.map((proc: any) => (
            <div key={proc.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{proc.nome}</div>
                <div className="text-sm text-muted-foreground">
                  Particular: R$ {proc.valorParticular || '0,00'} | Vital: R$ {proc.valorAssinante || '0,00'}
                </div>
              </div>
              {editando && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletar(proc.id)}
                  disabled={deletarMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div className="mt-4 p-4 border rounded-lg bg-background">
          <Label className="text-sm font-medium mb-3 block">Adicionar Novo Procedimento</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                placeholder="Nome do procedimento"
                value={novoProcedimento.nome}
                onChange={(e) => setNovoProcedimento({ ...novoProcedimento, nome: e.target.value })}
              />
            </div>
            <div>
              <Input
                placeholder="Valor Particular (R$)"
                value={novoProcedimento.valorParticular}
                onChange={(e) => setNovoProcedimento({ ...novoProcedimento, valorParticular: e.target.value })}
              />
            </div>
            <div>
              <Input
                placeholder="Valor Assinante (R$)"
                value={novoProcedimento.valorAssinante}
                onChange={(e) => setNovoProcedimento({ ...novoProcedimento, valorAssinante: e.target.value })}
              />
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3"
            onClick={handleAdicionar}
            disabled={criarMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Procedimento
          </Button>
        </div>
      )}
    </div>
  );
}

function SolicitacoesTab() {
  const utils = trpc.useUtils();
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const { data: solicitacoes, isLoading } = trpc.parceria.listar.useQuery({ status: "pendente" });

  const aprovarMutation = trpc.parceria.aprovar.useMutation({
    onSuccess: () => {
      toast.success("Parceiro aprovado com sucesso!");
      utils.parceria.listar.invalidate();
      utils.instituicoes.listar.invalidate();
      setDetalhesDialogOpen(false);
      setSolicitacaoSelecionada(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao aprovar parceiro", { description: error.message });
    },
  });

  const rejeitarMutation = trpc.parceria.rejeitar.useMutation({
    onSuccess: () => {
      toast.success("Solicitação rejeitada");
      utils.parceria.listar.invalidate();
      setDetalhesDialogOpen(false);
      setSolicitacaoSelecionada(null);
      setMotivoRejeicao("");
    },
    onError: (error: any) => {
      toast.error("Erro ao rejeitar solicitação", { description: error.message });
    },
  });

  const handleAprovar = (id: number) => {
    if (confirm("Deseja aprovar este parceiro? Ele será adicionado à rede credenciada.")) {
      aprovarMutation.mutate(id);
    }
  };

  const handleRejeitar = (id: number) => {
    rejeitarMutation.mutate({ id, motivo: motivoRejeicao });
  };

  const getCategoriaLabel = (categoria: string) => {
    // Retorna a própria categoria como label (já está formatada)
    return categoria;
  };

  return (
    <>
      <Card className={solicitacoes && solicitacoes.length > 0 ? "border-2 border-red-500 shadow-lg" : ""}>
        <CardHeader className={solicitacoes && solicitacoes.length > 0 ? "bg-red-50" : ""}>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Solicitações Pendentes de Parceria
            {solicitacoes && solicitacoes.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                {solicitacoes.length} {solicitacoes.length === 1 ? 'pendente' : 'pendentes'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !solicitacoes || solicitacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação pendente
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estabelecimento</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((sol: any) => (
                    <TableRow key={sol.id}>
                      <TableCell className="font-medium">{sol.nomeEstabelecimento}</TableCell>
                      <TableCell>{sol.nomeResponsavel}</TableCell>
                      <TableCell>{getCategoriaLabel(sol.categoria)}</TableCell>
                      <TableCell>{sol.cidade}</TableCell>
                      <TableCell>{sol.descontoPercentual}%</TableCell>
                      <TableCell>{new Date(sol.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSolicitacaoSelecionada(sol);
                              setDetalhesDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAprovar(sol.id)}
                            disabled={aprovarMutation.isPending}
                          >
                            {aprovarMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Detalhes */}
      <Dialog open={detalhesDialogOpen} onOpenChange={setDetalhesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {solicitacaoSelecionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estabelecimento</Label>
                  <p className="font-medium">{solicitacaoSelecionada.nomeEstabelecimento}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Responsável</Label>
                  <p className="font-medium">{solicitacaoSelecionada.nomeResponsavel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Categoria</Label>
                  <p className="font-medium">{getCategoriaLabel(solicitacaoSelecionada.categoria)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cidade</Label>
                  <p className="font-medium">{solicitacaoSelecionada.cidade}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{solicitacaoSelecionada.telefone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Desconto Oferecido</Label>
                  <p className="font-medium">{solicitacaoSelecionada.descontoPercentual}%</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Endereço</Label>
                  <p className="font-medium">{solicitacaoSelecionada.endereco}</p>
                </div>
              </div>

              {/* Logo e Foto */}
              <div className="grid grid-cols-2 gap-4">
                {solicitacaoSelecionada.logoUrl && (
                  <div>
                    <Label className="text-muted-foreground">Logo do Estabelecimento</Label>
                    <div className="mt-2 aspect-square bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden">
                      <img 
                        src={solicitacaoSelecionada.logoUrl} 
                        alt="Logo" 
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    </div>
                  </div>
                )}
                {solicitacaoSelecionada.fotoUrl && (
                  <div>
                    <Label className="text-muted-foreground">{solicitacaoSelecionada.tipoCredenciado === "medico" ? "Foto do Médico" : "Foto do Estabelecimento"}</Label>
                    <div className="mt-2 aspect-square bg-gray-100 rounded-lg border overflow-hidden">
                      <img 
                        src={solicitacaoSelecionada.fotoUrl} 
                        alt="Foto" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Procedimentos / Serviços */}
              <ProcedimentosSolicitacaoSection solicitacaoId={solicitacaoSelecionada.id} />

              <div className="border-t pt-4">
                <Label htmlFor="motivoRejeicao">Motivo da Rejeição (opcional)</Label>
                <Textarea
                  id="motivoRejeicao"
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  placeholder="Descreva o motivo caso vá rejeitar..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleRejeitar(solicitacaoSelecionada.id)}
                  disabled={rejeitarMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleAprovar(solicitacaoSelecionada.id)}
                  disabled={aprovarMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar e Adicionar à Rede
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


function UsuariosManusTab() {
  const utils = trpc.useUtils();
  const { data: usuarios, isLoading } = trpc.usuariosManus.listar.useQuery();
  const atualizarRoleMutation = trpc.usuariosManus.atualizarRole.useMutation({
    onSuccess: () => {
      toast.success("Nível de acesso atualizado com sucesso!");
      utils.usuariosManus.listar.invalidate();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar nível de acesso", {
        description: error.message
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e9d9f]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usuários Manus (OAuth)</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie níveis de acesso dos usuários autenticados via Manus OAuth
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!usuarios || usuarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Método de Login</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Cadastrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.name || '(sem nome)'}</TableCell>
                  <TableCell>{usuario.email || '(sem email)'}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {usuario.loginMethod || 'oauth'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        usuario.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => {
                        const novaRole = usuario.role === 'admin' ? 'user' : 'admin';
                        if (confirm(`Alterar nível de acesso de ${usuario.name || usuario.email} para ${novaRole === 'admin' ? 'Admin' : 'Usuário'}?`)) {
                          atualizarRoleMutation.mutate({
                            userId: usuario.id,
                            novaRole: novaRole,
                          });
                        }
                      }}
                      title="Clique para alterar nível de acesso"
                      disabled={atualizarRoleMutation.isPending}
                    >
                      {usuario.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(usuario.lastSignedIn).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function UsuariosAutorizadosTab() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<{ id?: number; email: string; nome: string; senha?: string; nivelAcesso?: "admin" | "visualizador" } | null>(null);

  const { data: usuarios, isLoading } = trpc.usuariosAutorizados.listar.useQuery();

  const criarMutation = trpc.usuariosAutorizados.criar.useMutation({
    onSuccess: () => {
      toast.success("Usuário autorizado adicionado com sucesso!");
      utils.usuariosAutorizados.listar.invalidate();
      setDialogOpen(false);
      setEditingUsuario(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar usuário", {
        description: error.message
      });
    },
  });

  const atualizarMutation = trpc.usuariosAutorizados.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      utils.usuariosAutorizados.listar.invalidate();
      setDialogOpen(false);
      setEditingUsuario(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar usuário", {
        description: error.message
      });
    },
  });

  const excluirMutation = trpc.usuariosAutorizados.excluir.useMutation({
    onSuccess: () => {
      toast.success("Usuário removido com sucesso!");
      utils.usuariosAutorizados.listar.invalidate();
    },
    onError: (error: any) => {
      toast.error("Erro ao remover usuário", {
        description: error.message
      });
    },
  });

  const resetarSenhaMutation = trpc.usuariosAutorizados.resetarSenha.useMutation({
    onSuccess: (data) => {
      toast.success("Senha resetada com sucesso!", {
        description: `Nova senha: ${data.novaSenha}`
      });
      // Copiar automaticamente para clipboard
      navigator.clipboard.writeText(data.novaSenha);
    },
    onError: (error: any) => {
      toast.error("Erro ao resetar senha", {
        description: error.message
      });
    },
  });

  const handleSalvar = () => {
    if (!editingUsuario) return;

    if (editingUsuario.id) {
      atualizarMutation.mutate({
        id: editingUsuario.id,
        email: editingUsuario.email,
        nome: editingUsuario.nome,
        nivelAcesso: editingUsuario.nivelAcesso,
      });
    } else {
      if (!editingUsuario.senha || editingUsuario.senha.length < 6) {
        toast.error("Senha deve ter no mínimo 6 caracteres");
        return;
      }
      criarMutation.mutate({
        email: editingUsuario.email,
        nome: editingUsuario.nome,
        senha: editingUsuario.senha,
        nivelAcesso: editingUsuario.nivelAcesso || "visualizador",
      });
    }
  };

  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja remover este usuário do acesso a dados internos?")) {
      excluirMutation.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários Autorizados</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie quem pode acessar a área /dados-internos com informações de descontos
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingUsuario({ email: "", nome: "" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUsuario?.id ? "Editar Usuário" : "Adicionar Usuário Autorizado"}
                  </DialogTitle>
                </DialogHeader>
                {editingUsuario && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={editingUsuario.nome}
                        onChange={(e) => setEditingUsuario({ ...editingUsuario, nome: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingUsuario.email}
                        onChange={(e) => setEditingUsuario({ ...editingUsuario, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Este email poderá acessar /dados-internos após fazer login
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="nivelAcesso">Nível de Acesso *</Label>
                      <Select
                        value={editingUsuario.nivelAcesso || "visualizador"}
                        onValueChange={(value) => setEditingUsuario({ ...editingUsuario, nivelAcesso: value as "admin" | "visualizador" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visualizador">Visualizador - Apenas ver dados internos</SelectItem>
                          <SelectItem value="admin">Admin - Acesso total ao painel administrativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visualizador: acessa apenas /dados-internos | Admin: acessa /admin completo
                      </p>
                    </div>
                    {!editingUsuario.id && (
                      <div>
                        <Label htmlFor="senha">Senha *</Label>
                        <Input
                          id="senha"
                          type="password"
                          value={editingUsuario.senha || ""}
                          onChange={(e) => setEditingUsuario({ ...editingUsuario, senha: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Senha para acesso à área de dados internos
                        </p>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSalvar}
                        disabled={!editingUsuario.email || !editingUsuario.nome || criarMutation.isPending || atualizarMutation.isPending}
                      >
                        {editingUsuario.id ? "Atualizar" : "Adicionar"}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : !usuarios || usuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário autorizado cadastrado.
              <br />
              <span className="text-xs">Adicione emails para permitir acesso à área de dados internos.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nível de Acesso</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (usuario as any).nivelAcesso === 'admin' 
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                          onClick={() => {
                            const novoNivel = (usuario as any).nivelAcesso === 'admin' ? 'visualizador' : 'admin';
                            if (confirm(`Alterar nível de acesso de ${usuario.nome} para ${novoNivel === 'admin' ? 'Admin' : 'Visualizador'}?`)) {
                              atualizarMutation.mutate({
                                id: usuario.id,
                                email: usuario.email,
                                nome: usuario.nome,
                                nivelAcesso: novoNivel,
                              });
                            }
                          }}
                          title="Clique para alterar nível de acesso"
                        >
                          {(usuario as any).nivelAcesso === 'admin' ? 'Admin' : 'Visualizador'}
                        </Button>
                      </TableCell>
                      <TableCell>{new Date(usuario.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUsuario({
                                id: usuario.id,
                                email: usuario.email,
                                nome: usuario.nome,
                                nivelAcesso: (usuario as any).nivelAcesso,
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Resetar senha de ${usuario.nome}? Uma nova senha será gerada.`)) {
                                resetarSenhaMutation.mutate(usuario.id);
                              }
                            }}
                            disabled={resetarSenhaMutation.isPending}
                            title="Resetar senha"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleExcluir(usuario.id)}
                            disabled={excluirMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}


function AtualizacoesPendentesTab() {
  const utils = trpc.useUtils();
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [atualizacaoSelecionada, setAtualizacaoSelecionada] = useState<any>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const { data: atualizacoes, isLoading } = trpc.atualizacao.listar.useQuery({ status: "pendente" });

  const aprovarMutation = trpc.atualizacao.aprovar.useMutation({
    onSuccess: () => {
      toast.success("Atualização aprovada e aplicada com sucesso!");
      utils.atualizacao.listar.invalidate();
      utils.medicos.listar.invalidate();
      utils.instituicoes.listar.invalidate();
      setDetalhesDialogOpen(false);
      setAtualizacaoSelecionada(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao aprovar atualização", { description: error.message });
    },
  });

  const rejeitarMutation = trpc.atualizacao.rejeitar.useMutation({
    onSuccess: () => {
      toast.success("Atualização rejeitada");
      utils.atualizacao.listar.invalidate();
      setDetalhesDialogOpen(false);
      setAtualizacaoSelecionada(null);
      setMotivoRejeicao("");
    },
    onError: (error: any) => {
      toast.error("Erro ao rejeitar atualização", { description: error.message });
    },
  });

  const handleAprovar = (id: number) => {
    if (confirm("Deseja aprovar esta atualização? Os dados do credenciado serão atualizados.")) {
      aprovarMutation.mutate(id);
    }
  };

  const handleRejeitar = (id: number) => {
    rejeitarMutation.mutate({ id, motivo: motivoRejeicao });
  };

  const getTipoLabel = (tipo: string) => {
    return tipo === "medico" ? "Médico" : "Clínica";
  };

  return (
    <>
      <Card className={atualizacoes && atualizacoes.length > 0 ? "border-2 border-red-500 shadow-lg" : ""}>
        <CardHeader className={atualizacoes && atualizacoes.length > 0 ? "bg-red-50" : ""}>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atualizações Pendentes de Credenciados
            {atualizacoes && atualizacoes.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                {atualizacoes.length} {atualizacoes.length === 1 ? 'pendente' : 'pendentes'}
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Solicitações de atualização enviadas pelos próprios parceiros
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !atualizacoes || atualizacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma atualização pendente
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Credenciado</TableHead>
                    <TableHead>Campos Atualizados</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atualizacoes.map((atualizacao: any) => {
                    const camposAtualizados = [];
                    if (atualizacao.telefone) camposAtualizados.push("Telefone");
                    if (atualizacao.whatsapp) camposAtualizados.push("WhatsApp");
                    if (atualizacao.email) camposAtualizados.push("Email");
                    if (atualizacao.endereco) camposAtualizados.push("Endereço");
                    if (atualizacao.precoConsulta) camposAtualizados.push("Preço");
                    if (atualizacao.descontoPercentual !== null) camposAtualizados.push("Desconto");
                    if (atualizacao.observacoes) camposAtualizados.push("Observações");

                    return (
                      <TableRow key={atualizacao.id}>
                        <TableCell className="font-medium">{getTipoLabel(atualizacao.tipoCredenciado)}</TableCell>
                        <TableCell>{atualizacao.nomeCredenciado}</TableCell>
                        <TableCell className="text-sm">{camposAtualizados.join(", ")}</TableCell>
                        <TableCell>{new Date(atualizacao.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAtualizacaoSelecionada(atualizacao);
                                setDetalhesDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAprovar(atualizacao.id)}
                              disabled={aprovarMutation.isPending}
                            >
                              {aprovarMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Detalhes */}
      <Dialog open={detalhesDialogOpen} onOpenChange={setDetalhesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Atualização</DialogTitle>
          </DialogHeader>
          {atualizacaoSelecionada && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Informações do Credenciado</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    <span className="font-medium">{getTipoLabel(atualizacaoSelecionada.tipoCredenciado)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nome:</span>{" "}
                    <span className="font-medium">{atualizacaoSelecionada.nomeCredenciado}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Dados Atualizados pelo Parceiro</h3>
                <div className="grid grid-cols-2 gap-4">
                  {atualizacaoSelecionada.telefone && (
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="font-medium">{atualizacaoSelecionada.telefone}</p>
                    </div>
                  )}
                  {atualizacaoSelecionada.whatsapp && (
                    <div>
                      <Label className="text-muted-foreground">WhatsApp</Label>
                      <p className="font-medium">{atualizacaoSelecionada.whatsapp}</p>
                    </div>
                  )}
                  {atualizacaoSelecionada.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{atualizacaoSelecionada.email}</p>
                    </div>
                  )}
                  {atualizacaoSelecionada.precoConsulta && (
                    <div>
                      <Label className="text-muted-foreground">Preço da Consulta</Label>
                      <p className="font-medium">{atualizacaoSelecionada.precoConsulta}</p>
                    </div>
                  )}
                  {atualizacaoSelecionada.descontoPercentual !== null && (
                    <div>
                      <Label className="text-muted-foreground">Desconto Vital</Label>
                      <p className="font-medium">{atualizacaoSelecionada.descontoPercentual}%</p>
                    </div>
                  )}
                  {atualizacaoSelecionada.endereco && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Endereço</Label>
                      <p className="font-medium">{atualizacaoSelecionada.endereco}</p>
                    </div>
                  )}
                  {atualizacaoSelecionada.observacoes && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Observações</Label>
                      <p className="font-medium">{atualizacaoSelecionada.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="motivoRejeicao">Motivo da Rejeição (opcional)</Label>
                <Textarea
                  id="motivoRejeicao"
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  placeholder="Descreva o motivo caso vá rejeitar..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleRejeitar(atualizacaoSelecionada.id)}
                  disabled={rejeitarMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleAprovar(atualizacaoSelecionada.id)}
                  disabled={aprovarMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar e Aplicar Atualização
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


function SolicitacoesAcessoTab() {
  const utils = trpc.useUtils();
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [emailSenha, setEmailSenha] = useState<string | null>(null);

  const { data: solicitacoes, isLoading } = trpc.solicitacoesAcesso.listar.useQuery();

  const aprovarMutation = trpc.solicitacoesAcesso.aprovar.useMutation({
    onSuccess: (data) => {
      setSenhaGerada(data.senhaTemporaria);
      setEmailSenha(solicitacoes?.find(s => s.status === "pendente")?.email || null);
      toast.success("Solicitação aprovada! Usuário criado com sucesso.");
      utils.solicitacoesAcesso.listar.invalidate();
      utils.usuariosAutorizados.listar.invalidate();
    },
    onError: (error: any) => {
      toast.error("Erro ao aprovar solicitação", { description: error.message });
    },
  });

  const rejeitarMutation = trpc.solicitacoesAcesso.rejeitar.useMutation({
    onSuccess: () => {
      toast.success("Solicitação rejeitada");
      utils.solicitacoesAcesso.listar.invalidate();
    },
    onError: (error: any) => {
      toast.error("Erro ao rejeitar solicitação", { description: error.message });
    },
  });

  const handleAprovar = (id: number) => {
    if (confirm("Deseja aprovar esta solicitação? Um usuário será criado automaticamente.")) {
      aprovarMutation.mutate(id);
    }
  };

  const handleRejeitar = (id: number) => {
    const motivo = prompt("Motivo da rejeição (opcional):");
    rejeitarMutation.mutate({ id, motivo: motivo || "Não especificado" });
  };

  const solicitacoesPendentes = solicitacoes?.filter(s => s.status === "pendente") || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Solicitações de Acesso Público
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Pedidos de acesso à área de dados internos enviados pelo formulário público
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : solicitacoesPendentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação pendente
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Justificativa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoesPendentes.map((solicitacao) => (
                    <TableRow key={solicitacao.id}>
                      <TableCell className="font-medium">{solicitacao.nome}</TableCell>
                      <TableCell>{solicitacao.email}</TableCell>
                      <TableCell>{solicitacao.telefone || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{solicitacao.justificativa}</TableCell>
                      <TableCell>{new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAprovar(solicitacao.id)}
                            disabled={aprovarMutation.isPending}
                          >
                            {aprovarMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejeitar(solicitacao.id)}
                            disabled={rejeitarMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Senha Gerada */}
      <Dialog open={!!senhaGerada} onOpenChange={() => setSenhaGerada(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha Temporária Gerada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-sm text-muted-foreground">Email do usuário</Label>
              <p className="font-mono font-semibold text-lg">{emailSenha}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <Label className="text-sm text-muted-foreground">Senha temporária</Label>
              <p className="font-mono font-bold text-xl text-yellow-900">{senhaGerada}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              ⚠️ <strong>Importante:</strong> Copie e envie esta senha para o usuário por email manualmente. 
              Esta senha não será exibida novamente.
            </p>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${emailSenha}\nSenha: ${senhaGerada}`);
                toast.success("Credenciais copiadas!");
              }}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Credenciais
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


function ConfiguracoesTab() {
  const [mensagemWhatsApp, setMensagemWhatsApp] = useState(
    `📏 *Atualização do Guia do Assinante Vital*\n\nOlá, {NOME}! 👋\n\nPara mantermos nosso *Guia de Credenciados* sempre atualizado, solicitamos a atualização dos seus dados cadastrais.\n\n🔗 *Acesse o link abaixo para atualizar:*\n{LINK}\n\n*Vital Serviços Médicos*\n*Sua Saúde Vital - sempre ao seu lado.*`
  );
  const [templateEmail, setTemplateEmail] = useState(
    `Olá {NOME},\n\nSolicitamos a atualização dos seus dados cadastrais no Guia de Credenciados Vital.\n\nAcesse: {LINK}\n\nAtenciosamente,\nEquipe Vital`
  );

  const exportarBackup = () => {
    toast.promise(
      fetch('/api/trpc/medicos.listar').then(r => r.json()).then(medicos => {
        fetch('/api/trpc/instituicoes.listar').then(r => r.json()).then(instituicoes => {
          const backup = {
            data: new Date().toISOString(),
            medicos,
            instituicoes,
          };
          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup_vital_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
        });
      }),
      {
        loading: 'Gerando backup...',
        success: 'Backup exportado com sucesso!',
        error: 'Erro ao gerar backup',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Textos Personalizáveis */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Textos Personalizáveis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Edite os templates de mensagens enviadas aos parceiros
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-2 block">Mensagem WhatsApp</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Variáveis: {'{NOME}'}, {'{LINK}'}
            </p>
            <textarea
              className="w-full min-h-[200px] p-3 border rounded-lg font-mono text-sm"
              value={mensagemWhatsApp}
              onChange={(e) => setMensagemWhatsApp(e.target.value)}
            />
            <Button
              size="sm"
              className="mt-2"
              onClick={() => {
                localStorage.setItem('vital_template_whatsapp', mensagemWhatsApp);
                toast.success('Template WhatsApp salvo!');
              }}
            >
              Salvar Template WhatsApp
            </Button>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">Template de Email</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Variáveis: {'{NOME}'}, {'{LINK}'}
            </p>
            <textarea
              className="w-full min-h-[150px] p-3 border rounded-lg font-mono text-sm"
              value={templateEmail}
              onChange={(e) => setTemplateEmail(e.target.value)}
            />
            <Button
              size="sm"
              className="mt-2"
              onClick={() => {
                localStorage.setItem('vital_template_email', templateEmail);
                toast.success('Template de email salvo!');
              }}
            >
              Salvar Template Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup e Exportação */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Backup e Exportação</CardTitle>
          <p className="text-sm text-muted-foreground">
            Exporte todos os dados do sistema para backup
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={exportarBackup} className="w-full">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Backup Completo (JSON)
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Inclui todos os médicos e instituições cadastradas
          </p>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
            <span className="text-sm font-medium">Título do Sistema</span>
            <span className="text-sm text-muted-foreground">Guia de Credenciados - Sua Saúde Vital</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
            <span className="text-sm font-medium">Região de Atuação</span>
            <span className="text-sm text-muted-foreground">Vale do Itajaí - Santa Catarina</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
            <span className="text-sm font-medium">Versão</span>
            <span className="text-sm text-muted-foreground">2.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// Componente de formulário de Instituição/Serviço para o Admin
function InstituicaoFormDialog({
  instituicao,
  onSave,
  onCancel,
}: {
  instituicao: InstituicaoForm | null;
  onSave: (data: InstituicaoForm) => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [usarImagemPadrao, setUsarImagemPadrao] = useState(false);
  const uploadImagem = trpc.upload.imagem.useMutation();

  const [formData, setFormData] = useState<InstituicaoForm>(
    instituicao || {
      nome: "",
      tipoServico: "servicos_saude",
      categoria: "",
      municipio: "",
      endereco: "",
      telefone: "",
      whatsappSecretaria: "",
      email: "",
      logoUrl: "",
      fotoUrl: "",
      observacoes: "",
      contatoParceria: "",
      whatsappParceria: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const updatedData = { ...formData };

      // Upload logo se houver arquivo selecionado
      if (formData.logoFile) {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.logoFile!);
        });

        const { url } = await uploadImagem.mutateAsync({
          base64: base64Data,
          filename: formData.logoFile.name,
          contentType: formData.logoFile.type,
        });
        updatedData.logoUrl = url;
      }

      // Upload foto se houver arquivo selecionado
      if (formData.fotoFile) {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.fotoFile!);
        });

        const { url } = await uploadImagem.mutateAsync({
          base64: base64Data,
          filename: formData.fotoFile.name,
          contentType: formData.fotoFile.type,
        });
        updatedData.fotoUrl = url;
      }

      onSave(updatedData);
    } catch (error) {
      toast.error("Erro ao fazer upload das imagens: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const categorias = formData.tipoServico === "servicos_saude" 
    ? CATEGORIAS_SERVICOS_SAUDE 
    : CATEGORIAS_OUTROS_SERVICOS;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome do Estabelecimento *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
          <Select
            value={formData.tipoServico}
            onValueChange={(v: any) => setFormData({ ...formData, tipoServico: v, categoria: "" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="servicos_saude">Serviços de Saúde</SelectItem>
              <SelectItem value="outros_servicos">Outros Serviços</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={formData.categoria}
            onValueChange={(v) => setFormData({ ...formData, categoria: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={String(cat)} value={String(cat)}>
                  {String(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="municipio">Município *</Label>
          <Select
            value={formData.municipio}
            onValueChange={(v) => setFormData({ ...formData, municipio: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o município" />
            </SelectTrigger>
            <SelectContent>
              {MUNICIPIOS_VALE_ITAJAI.map((mun) => (
                <SelectItem key={String(mun)} value={String(mun)}>
                  {String(mun)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="endereco">Endereço *</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone Fixo</Label>
          <Input
            id="telefone"
            value={formData.telefone || ""}
            onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
            placeholder="(47) 3333-4444"
          />
        </div>

        <div>
          <Label htmlFor="whatsappSecretaria">WhatsApp Comercial/Agendamento *</Label>
          <Input
            id="whatsappSecretaria"
            value={formData.whatsappSecretaria || ""}
            onChange={(e) => setFormData({ ...formData, whatsappSecretaria: maskTelefone(e.target.value) })}
            placeholder="(47) 99999-8888"
            required
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contato@estabelecimento.com.br"
          />
        </div>

        {/* Checkbox Usar Imagem Padrão */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="usarImagemPadraoInstituicao"
              checked={usarImagemPadrao}
              onChange={(e) => {
                setUsarImagemPadrao(e.target.checked);
                if (e.target.checked) {
                  setFormData({ 
                    ...formData, 
                    fotoUrl: "",
                    logoUrl: "",
                    fotoFile: undefined,
                    logoFile: undefined
                  });
                }
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="usarImagemPadraoInstituicao" className="text-sm text-muted-foreground cursor-pointer">
              Usar imagem padrão (vou inserir imagem em breve)
            </label>
          </div>
        </div>

        {!usarImagemPadrao && (
          <>
            <div>
              <ImageUpload
                label="Logo do Estabelecimento"
                value={formData.logoUrl}
                onChange={(file, preview) => {
                  setFormData({ 
                    ...formData, 
                    logoFile: file || undefined,
                    logoUrl: preview || formData.logoUrl
                  });
                }}
              />
            </div>

            <div>
              <ImageUpload
                label="Foto do Estabelecimento"
                value={formData.fotoUrl}
                onChange={(file, preview) => {
                  setFormData({ 
                    ...formData, 
                    fotoFile: file || undefined,
                    fotoUrl: preview || formData.fotoUrl
                  });
                }}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="contatoParceria">Nome do Responsável pelo Cadastro</Label>
          <Input
            id="contatoParceria"
            placeholder="Nome do responsável"
            value={formData.contatoParceria || ""}
            onChange={(e) => setFormData({ ...formData, contatoParceria: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="whatsappParceria">WhatsApp do Responsável pelo Cadastro *</Label>
          <Input
            id="whatsappParceria"
            value={formData.whatsappParceria || ""}
            onChange={(e) => setFormData({ ...formData, whatsappParceria: maskTelefone(e.target.value) })}
            placeholder="(47) 99999-6666"
            required
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes || ""}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
