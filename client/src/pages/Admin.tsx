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
import { Plus, Pencil, Trash2, Home, LogOut, CheckCircle, XCircle, Clock, Eye, Users, Copy, Key } from "lucide-react";
import DashboardProspeccao from "@/components/DashboardProspeccao";
import { Link } from "wouter";
import { toast } from "sonner";

type MedicoForm = {
  id?: number;
  nome: string;
  especialidade: string;
  subespecialidade?: string;
  municipio: string;
  endereco: string;
  telefone?: string;
  whatsapp?: string;
  tipoAtendimento: "presencial" | "telemedicina" | "ambos";
  precoConsulta?: string;
  descontoPercentual: number;
  observacoes?: string;
  contatoParceria?: string;
};

type InstituicaoForm = {
  id?: number;
  nome: string;
  tipoServico: "servicos_saude" | "outros_servicos";
  categoria: "clinica" | "farmacia" | "laboratorio" | "academia" | "hospital" | "outro";
  municipio: string;
  endereco: string;
  telefone?: string;
  email?: string;
  precoConsulta?: string;
  descontoPercentual: number;
  observacoes?: string;
  contatoParceria?: string;
};

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const utils = trpc.useUtils();

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
    if (data.id) {
      atualizarMedico.mutate({ id: data.id, data });
    } else {
      criarMedico.mutate(data);
    }
  };

  const handleSalvarInstituicao = (data: InstituicaoForm) => {
    if (data.id) {
      atualizarInstituicao.mutate({ id: data.id, data });
    } else {
      criarInstituicao.mutate(data);
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
            <div className="flex items-center gap-2">
              <Link href="/dados-internos">
                <Button variant="secondary" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dados Internos
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
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-7 mb-6">
            <TabsTrigger value="medicos">Médicos</TabsTrigger>
            <TabsTrigger value="instituicoes">Clínicas</TabsTrigger>
            <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
            <TabsTrigger value="atualizacoes">Atualizações</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="acessos">Acessos</TabsTrigger>
            <TabsTrigger value="prospeccao">Prospecção</TabsTrigger>
          </TabsList>

          {/* Tab Médicos */}
          <TabsContent value="medicos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Médicos Credenciados</CardTitle>
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
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingMedico(medico as MedicoForm);
                                    setMedicoDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover este médico?")) {
                                      excluirMedico.mutate(medico.id);
                                    }
                                  }}
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

          {/* Tab Clínicas */}
          <TabsContent value="instituicoes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Clínicas Parceiras</CardTitle>
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
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingInstituicao(inst as InstituicaoForm);
                                    setInstituicaoDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover esta clínica?")) {
                                      excluirInstituicao.mutate(inst.id);
                                    }
                                  }}
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
  const [formData, setFormData] = useState<MedicoForm>(
    medico || {
      nome: "",
      especialidade: "",
      subespecialidade: "",
      municipio: "",
      endereco: "",
      telefone: "",
      whatsapp: "",
      tipoAtendimento: "presencial",
      precoConsulta: "",
      descontoPercentual: 0,
      observacoes: "",
      contatoParceria: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          <Label htmlFor="subespecialidade">Subespecialidade</Label>
          <Input
            id="subespecialidade"
            value={formData.subespecialidade || ""}
            onChange={(e) => setFormData({ ...formData, subespecialidade: e.target.value })}
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
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone || ""}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp || ""}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="precoConsulta">Preço da Consulta *</Label>
          <Input
            id="precoConsulta"
            value={formData.precoConsulta || ""}
            onChange={(e) => setFormData({ ...formData, precoConsulta: e.target.value })}
            placeholder="Ex: R$ 150,00 ou A combinar"
            required
          />
        </div>

        <div>
          <Label htmlFor="desconto">% Desconto *</Label>
          <Input
            id="desconto"
            type="number"
            min="0"
            max="100"
            value={formData.descontoPercentual}
            onChange={(e) => setFormData({ ...formData, descontoPercentual: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <Label htmlFor="contatoParceria">Contato da Parceria</Label>
          <Input
            id="contatoParceria"
            placeholder="Ex: Secretária Ana"
            value={formData.contatoParceria || ""}
            onChange={(e) => setFormData({ ...formData, contatoParceria: e.target.value })}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
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
  const [formData, setFormData] = useState<InstituicaoForm>(
    instituicao || {
      nome: "",
      tipoServico: "servicos_saude",
      categoria: "clinica",
      municipio: "",
      endereco: "",
      telefone: "",
      email: "",
      precoConsulta: "",
      descontoPercentual: 0,
      observacoes: "",
      contatoParceria: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinica">Clínica</SelectItem>
              <SelectItem value="farmacia">Farmácia</SelectItem>
              <SelectItem value="laboratorio">Laboratório</SelectItem>
              <SelectItem value="academia">Academia</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
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
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone || ""}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
          <Label htmlFor="precoConsulta">Preço do Serviço *</Label>
          <Input
            id="precoConsulta"
            value={formData.precoConsulta || ""}
            onChange={(e) => setFormData({ ...formData, precoConsulta: e.target.value })}
            placeholder="Ex: R$ 150,00 ou A combinar"
            required
          />
        </div>

        <div>
          <Label htmlFor="desconto">% Desconto *</Label>
          <Input
            id="desconto"
            type="number"
            min="0"
            max="100"
            value={formData.descontoPercentual}
            onChange={(e) => setFormData({ ...formData, descontoPercentual: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <Label htmlFor="contatoParceria">Contato da Parceria</Label>
          <Input
            id="contatoParceria"
            placeholder="Ex: Gerente João"
            value={formData.contatoParceria || ""}
            onChange={(e) => setFormData({ ...formData, contatoParceria: e.target.value })}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
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
    const labels: Record<string, string> = {
      clinica: "Clínica",
      farmacia: "Farmácia",
      laboratorio: "Laboratório",
      academia: "Academia",
      hospital: "Hospital",
      outro: "Outro",
    };
    return labels[categoria] || categoria;
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
                            <CheckCircle className="h-4 w-4" />
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

              {solicitacaoSelecionada.imagemUrl && (
                <div>
                  <Label className="text-muted-foreground">Imagem do Estabelecimento</Label>
                  <img 
                    src={solicitacaoSelecionada.imagemUrl} 
                    alt="Estabelecimento" 
                    className="mt-2 max-w-full rounded-lg border"
                  />
                </div>
              )}

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
  const [editingUsuario, setEditingUsuario] = useState<{ id?: number; email: string; nome: string; senha?: string } | null>(null);

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

  const handleSalvar = () => {
    if (!editingUsuario) return;

    if (editingUsuario.id) {
      atualizarMutation.mutate({
        id: editingUsuario.id,
        email: editingUsuario.email,
        nome: editingUsuario.nome,
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
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
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
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
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
                              <CheckCircle className="h-4 w-4" />
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
                            <CheckCircle className="h-4 w-4 mr-1" />
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
