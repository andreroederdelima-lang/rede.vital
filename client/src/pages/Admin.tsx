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
import DashboardProspeccao from "@/components/DashboardProspeccao";
import ImageUpload from "@/components/ImageUpload";
// [REMOVIDO] import IndicacoesTab from "@/components/IndicacoesTab";
// [DESATIVADO] import ConfiguracoesTab from "@/components/ConfiguracoesTab";
import { Link } from "wouter";
import { toast } from "sonner";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";
import { validateMedicoForm, validateInstituicaoForm } from "@/lib/validation";
import { maskTelefone, maskMoeda, unmaskMoeda, calcularDesconto } from "@/lib/masks";
import { GerenciarProcedimentos } from "@/components/GerenciarProcedimentos";

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
  categoria: string; // Categoria flexível baseada em CATEGORIAS_SERVICOS_SAUDE ou CATEGORIAS_OUTROS_SERVICOS
  subcategoria?: string;
  municipio: string;
  endereco: string;
  telefone?: string;
  whatsappSecretaria?: string;
  telefoneOrganizacao?: string;
  logoUrl?: string;
  fotoUrl?: string;
  logoFile?: File;
  fotoFile?: File;
  email?: string;
  precoConsulta?: string;
  valorParticular?: string;
  valorAssinanteVital?: string;
  descontoPercentual: number;
  observacoes?: string;
  contatoParceria?: string;
  whatsappParceria?: string;
};

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  // Nota: Admin usa Manus OAuth e verifica user.role (não usuáriosAutorizados)

  const [medicoDialogOpen, setMedicoDialogOpen] = useState(false);
  const [instituicaoDialogOpen, setInstituicaoDialogOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<MedicoForm | null>(null);
  const [editingInstituicao, setEditingInstituicao] = useState<InstituicaoForm | null>(null);

  const { data: medicos = [] } = trpc.medicos.listar.useQuery({});
  const { data: instituicoes = [] } = trpc.instituicoes.listar.useQuery({});

  const criarMedico = trpc.medicos.criar.useMutation({
    onSuccess: () => {
      utils.medicos.listar.invalidate();
      setMedicoDialogOpen(false);
      setEditingMedico(null);
      toast.success("Médico adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar médico: " + error.message);
    },
  });

  const criarTokenAtualizacao = trpc.tokens.criar.useMutation({
    onError: (error) => {
      toast.error("Erro ao gerar token: " + error.message);
    },
  });

  const criarTokenCadastro = trpc.tokens.criarCadastro.useMutation({
    onError: (error) => {
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
    onError: (error) => {
      toast.error("Erro ao atualizar médico: " + error.message);
    },
  });

  const excluirMedico = trpc.medicos.excluir.useMutation({
    onSuccess: () => {
      utils.medicos.listar.invalidate();
      toast.success("Médico removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover médico: " + error.message);
    },
  });

  const criarInstituicao = trpc.instituicoes.criar.useMutation({
    onSuccess: () => {
      utils.instituicoes.listar.invalidate();
      setInstituicaoDialogOpen(false);
      setEditingInstituicao(null);
      toast.success("Clínica adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar clínica: " + error.message);
    },
  });

  const atualizarInstituicao = trpc.instituicoes.atualizar.useMutation({
    onSuccess: () => {
      utils.instituicoes.listar.invalidate();
      setInstituicaoDialogOpen(false);
      setEditingInstituicao(null);
      toast.success("Clínica atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar clínica: " + error.message);
    },
  });

  const excluirInstituicao = trpc.instituicoes.excluir.useMutation({
    onSuccess: () => {
      utils.instituicoes.listar.invalidate();
      toast.success("Clínica removida com sucesso!");
    },
    onError: (error) => {
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
        <Tabs defaultValue="medicos">
          <div className="max-w-6xl mx-auto mb-6 space-y-2">
            {/* Primeira linha */}
            <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent p-1">
              <TabsTrigger value="medicos" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Médicos</TabsTrigger>
              <TabsTrigger value="instituicoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Serviços</TabsTrigger>
              <TabsTrigger value="solicitacoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Solicitações</TabsTrigger>
              <TabsTrigger value="atualizacoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Atualizações</TabsTrigger>
              <TabsTrigger value="usuarios" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Usuários</TabsTrigger>
            </TabsList>
            {/* Segunda linha */}
            <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent p-1">
              <TabsTrigger value="acessos" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Acessos</TabsTrigger>
              <TabsTrigger value="prospeccao" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Prospecção</TabsTrigger>
              {/* [REMOVIDO] <TabsTrigger value="indicacoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Indicações</TabsTrigger> */}
              <TabsTrigger value="configuracoes" className="border-2 border-[#1e9d9f] data-[state=active]:bg-[#1e9d9f] data-[state=active]:text-white">Configurações</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Médicos */}
          <TabsContent value="medicos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Médicos Credenciados</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (medicos.length === 0) {
                          toast.error("Nenhum médico para exportar");
                          return;
                        }
                        exportToExcel(medicos, MEDICO_COLUMNS, `medicos_credenciados_${new Date().toISOString().split('T')[0]}`);
                        toast.success(`${medicos.length} médicos exportados com sucesso!`);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const result = await criarTokenCadastro.mutateAsync({
                            tipoCredenciado: "medico",
                          });
                          const baseUrl = window.location.origin;
                          const linkCadastro = `${baseUrl}/cadastro-medico/${result.token}`;
                          const mensagem = `🩺 *Cadastro no Guia do Assinante Vital*\n\nOlá! 👋\n\n🔗 Acesse o link abaixo para completar seu cadastro na plataforma de Credenciados Vital:\n${linkCadastro}\n\n*Sua Saúde Vital - sempre ao seu lado.*`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                          window.open(whatsappUrl, "_blank");
                          toast.success("Link de cadastro gerado com sucesso!");
                        } catch (error) {
                          console.error("Erro ao gerar token:", error);
                          toast.error("Erro ao gerar link de cadastro");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enviar Link de Cadastro
                    </Button>
                    <Dialog open={medicoDialogOpen} onOpenChange={setMedicoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingMedico(null)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Médico
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
                                      const result = await utils.client.atualizacao.gerarLink.mutate({
                                        tipo: "medico",
                                        id: medico.id
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
                <div className="flex items-center justify-between">
                  <CardTitle>Serviços Parceiros</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (instituicoes.length === 0) {
                          toast.error("Nenhum serviço para exportar");
                          return;
                        }
                        exportToExcel(instituicoes, INSTITUICAO_COLUMNS, `servicos_parceiros_${new Date().toISOString().split('T')[0]}`);
                        toast.success(`${instituicoes.length} serviços exportados com sucesso!`);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const result = await criarTokenCadastro.mutateAsync({
                            tipoCredenciado: "instituicao",
                          });
                          const baseUrl = window.location.origin;
                          const linkCadastro = `${baseUrl}/cadastro-servico/${result.token}`;
                          const mensagem = `🏪 *Cadastro no Guia do Assinante Vital*\n\nOlá! 👋\n\nConvido você para fazer parte da nossa *Rede de Serviços Parceiros* do Vale do Itajaí!\n\n🔗 *Acesse o link abaixo para completar seu cadastro:*\n${linkCadastro}\n\n*Vital Serviços Médicos*\n*Sua Saúde Vital - sempre ao seu lado.*`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                          window.open(whatsappUrl, "_blank");
                          toast.success("Link de cadastro gerado com sucesso!");
                        } catch (error) {
                          console.error("Erro ao gerar token:", error);
                          toast.error("Erro ao gerar link de cadastro");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enviar Link de Cadastro
                    </Button>
                    <Dialog open={instituicaoDialogOpen} onOpenChange={setInstituicaoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingInstituicao(null)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Clínica
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingInstituicao?.id ? "Editar Clínica" : "Adicionar Clínica"}
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
                                      const result = await utils.client.atualizacao.gerarLink.mutate({
                                        tipo: "instituicao",
                                        id: inst.id
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
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingInstituicao({
                                      ...inst,
                                      tipoServico: (inst as any).tipoServico || "servicos_saude"
                                    } as InstituicaoForm);
                                    setInstituicaoDialogOpen(true);
                                  }}
                                  title="Editar clínica"
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

          {/* Tab Usuários Autorizados */}
          <TabsContent value="usuarios">
            <UsuariosAutorizadosTab />
          </TabsContent>

          {/* Tab Solicitações de Acesso */}
          <TabsContent value="acessos">
            <SolicitacoesAcessoTab />
          </TabsContent>

          {/* Tab Prospecção */}
          <TabsContent value="prospeccao">
            <DashboardProspeccao />
          </TabsContent>

          {/* [REMOVIDO] Tab Indicações */}
          {/* <TabsContent value="indicacoes">
            <IndicacoesTab />
          </TabsContent> */}

          {/* Tab Configurações */}
          <TabsContent value="configuracoes">
            <ConfiguracoesTab />
          </TabsContent>
        </Tabs>
      </main>
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

        <div>
          <Label htmlFor="valorParticular">Valor Particular</Label>
          <Input
            id="valorParticular"
            value={formData.valorParticular || ""}
            onChange={(e) => setFormData({ ...formData, valorParticular: maskMoeda(e.target.value) })}
            placeholder="Ex: R$ 200,00"
          />
        </div>

        <div>
          <Label htmlFor="valorAssinanteVital">Valor Assinante Vital</Label>
          <Input
            id="valorAssinanteVital"
            value={formData.valorAssinanteVital || ""}
            onChange={(e) => setFormData({ ...formData, valorAssinanteVital: maskMoeda(e.target.value) })}
            placeholder="Ex: R$ 150,00"
          />
        </div>



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
  const uploadImagem = trpc.upload.imagem.useMutation();

  const [formData, setFormData] = useState<InstituicaoForm>(
    instituicao || {
      nome: "",
      tipoServico: "servicos_saude",
      categoria: "Clínica de Multiespecialidades",
      subcategoria: "",
      municipio: "",
      endereco: "",
      telefone: "",
      whatsappSecretaria: "",
      telefoneOrganizacao: "",
      fotoUrl: "",
      email: "",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome da Clínica *</Label>
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
            onValueChange={(v: any) => setFormData({ ...formData, tipoServico: v })}
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
            onValueChange={(v: any) => setFormData({ ...formData, categoria: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {(formData.tipoServico === "servicos_saude" 
                ? CATEGORIAS_SERVICOS_SAUDE 
                : CATEGORIAS_OUTROS_SERVICOS
              ).map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.tipoServico === "servicos_saude" 
              ? "Selecione o tipo específico de serviço de saúde" 
              : "Selecione a categoria do estabelecimento"}
          </p>
        </div>

        <div>
          <Label htmlFor="subcategoria">Subcategoria</Label>
          <Input
            id="subcategoria"
            value={formData.subcategoria || ""}
            onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
            placeholder="Ex: Fisioterapia Ortopédica"
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

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

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

        <div>
          <Label htmlFor="valorParticular">Valor Particular</Label>
          <Input
            id="valorParticular"
            value={formData.valorParticular || ""}
            onChange={(e) => setFormData({ ...formData, valorParticular: maskMoeda(e.target.value) })}
            placeholder="Ex: R$ 200,00"
          />
        </div>

        <div>
          <Label htmlFor="valorAssinanteVital">Valor Assinante Vital</Label>
          <Input
            id="valorAssinanteVital"
            value={formData.valorAssinanteVital || ""}
            onChange={(e) => setFormData({ ...formData, valorAssinanteVital: maskMoeda(e.target.value) })}
            placeholder="Ex: R$ 150,00"
          />
        </div>



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
            placeholder="(47) 99999-6666"
            value={formData.whatsappParceria || ""}
            onChange={(e) => setFormData({ ...formData, whatsappParceria: maskTelefone(e.target.value) })}
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
    onError: (error) => {
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
    onError: (error) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Solicitações Pendentes de Parceria
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
    onError: (error) => {
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
    onError: (error) => {
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
    onError: (error) => {
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
    onError: (error) => {
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (usuario as any).nivelAcesso === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(usuario as any).nivelAcesso === 'admin' ? 'Admin' : 'Visualizador'}
                        </span>
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
    onError: (error) => {
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
    onError: (error) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atualizações Pendentes de Credenciados
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
    onError: (error) => {
      toast.error("Erro ao aprovar solicitação", { description: error.message });
    },
  });

  const rejeitarMutation = trpc.solicitacoesAcesso.rejeitar.useMutation({
    onSuccess: () => {
      toast.success("Solicitação rejeitada");
      utils.solicitacoesAcesso.listar.invalidate();
    },
    onError: (error) => {
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
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.auth.me.useQuery();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Administradores Manus</CardTitle>
          <p className="text-sm text-muted-foreground">
            Para gerenciar quem tem acesso ao painel Admin, você precisa atualizar diretamente no banco de dados.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Como adicionar um novo Admin:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
              <li>Peça para o usuário fazer login no sistema pelo menos uma vez</li>
              <li>Acesse o banco de dados via Management UI → Database</li>
              <li>Encontre o usuário na tabela <code className="bg-yellow-100 px-1 rounded">users</code></li>
              <li>Altere o campo <code className="bg-yellow-100 px-1 rounded">role</code> de <code className="bg-yellow-100 px-1 rounded">user</code> para <code className="bg-yellow-100 px-1 rounded">admin</code></li>
              <li>O usuário terá acesso total ao painel Admin no próximo login</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Diferença entre sistemas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li><strong>Tabela users (Manus OAuth):</strong> Controla acesso ao painel /admin</li>
              <li><strong>Tabela usuariosAutorizados:</strong> Controla acesso à página /dados-internos</li>
              <li>São sistemas independentes e não se afetam mutuamente</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">🔧 Outras Configurações</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Configurações adicionais do sistema serão implementadas aqui conforme necessário.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm">Título do Sistema</span>
                <span className="text-sm text-muted-foreground">Guia de Credenciados - Sua Saúde Vital</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm">Região de Atuação</span>
                <span className="text-sm text-muted-foreground">Vale do Itajaí - Santa Catarina</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
