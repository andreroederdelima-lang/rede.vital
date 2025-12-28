import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { APP_LOGO } from "@/const";
import { maskTelefone, maskMoeda, unmaskMoeda, calcularDesconto } from "@/lib/masks";
import { MUNICIPIOS_VALE_ITAJAI } from "@shared/colors";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";
import ImageUpload from "@/components/ImageUpload";

export default function CadastroServico() {
  const [, params] = useRoute("/cadastro-servico/:token");
  const token = params?.token || "";
  
  const [formData, setFormData] = useState({
    nome: "",
    tipoServico: "servicos_saude" as "servicos_saude" | "outros_servicos",
    categoria: "",
    municipio: "",
    endereco: "",
    telefoneFixo: "",
    whatsappSecretaria: "",
    email: "",
    valorParticular: "",
    valorAssinanteVital: "",
    observacoes: "",
    contatoParceria: "",
    whatsappParceria: "",
    logoUrl: "",
    fotoUrl: "",
  });
  
  const [enviado, setEnviado] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  
  // Gerenciamento de procedimentos
  type Procedimento = {
    id?: number;
    nome: string;
    valorParticular: string;
    valorAssinanteVital: string;
    _action?: 'create' | 'update' | 'delete';
  };
  
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [novoProcedimento, setNovoProcedimento] = useState<Procedimento>({
    nome: "",
    valorParticular: "",
    valorAssinanteVital: "",
  });
  const [editandoProcedimentoId, setEditandoProcedimentoId] = useState<number | null>(null);
  
  // Upload de imagem
  const uploadMutation = trpc.upload.imagem.useMutation();
  
  // Verificar validade do token
  const { data: tokenData, isLoading: loadingToken } = trpc.tokens.verificar.useQuery(
    { token },
    { enabled: !!token }
  );
  
  // Carregar dados da instituição se for atualização
  const { data: instituicaoExistente, isLoading: loadingInstituicao } = trpc.instituicoes.obter.useQuery(
    tokenData?.token?.credenciadoId || 0,
    { enabled: tokenData?.valido && tokenData?.token?.tipoCredenciado === "instituicao" && tokenData?.token?.tipo === "atualizacao" }
  );
  
  // Carregar procedimentos existentes da instituição
  const { data: procedimentosExistentes } = trpc.procedimentos.listar.useQuery(
    { instituicaoId: tokenData?.token?.credenciadoId || 0 },
    { enabled: tokenData?.valido && tokenData?.token?.tipoCredenciado === "instituicao" && tokenData?.token?.tipo === "atualizacao" }
  );
  
  // Pré-preencher formulário com dados existentes
  useEffect(() => {
    if (instituicaoExistente) {
      setFormData({
        nome: instituicaoExistente.nome || "",
        tipoServico: (instituicaoExistente.tipoServico as any) || "servicos_saude",
        categoria: instituicaoExistente.categoria || "",
        municipio: instituicaoExistente.municipio || "",
        endereco: instituicaoExistente.endereco || "",
        telefoneFixo: instituicaoExistente.telefone || "",
        whatsappSecretaria: instituicaoExistente.whatsappSecretaria || "",
        email: instituicaoExistente.email || "",
        valorParticular: instituicaoExistente.valorParticular || "",
        valorAssinanteVital: instituicaoExistente.valorAssinanteVital || "",
        observacoes: instituicaoExistente.observacoes || "",
        contatoParceria: "",
        whatsappParceria: instituicaoExistente.whatsappSecretaria || "",
        logoUrl: instituicaoExistente.logoUrl || "",
        fotoUrl: instituicaoExistente.fotoUrl || "",
      });
      setAceitouTermos(true); // Auto-aceitar termos para atualização
    }
  }, [instituicaoExistente]);
  
  // Carregar procedimentos existentes
  useEffect(() => {
    if (procedimentosExistentes && procedimentosExistentes.length > 0) {
      setProcedimentos(procedimentosExistentes.map(p => ({
        id: p.id,
        nome: p.nome,
        valorParticular: p.valorParticular || "",
        valorAssinanteVital: p.valorAssinanteVital || "",
      })));
    }
  }, [procedimentosExistentes]);
  
  // Funções de gerenciamento de procedimentos
  const adicionarProcedimento = () => {
    if (!novoProcedimento.nome || !novoProcedimento.valorParticular || !novoProcedimento.valorAssinanteVital) {
      toast.error("Campos obrigatórios", {
        description: "Preencha nome e valores do procedimento.",
      });
      return;
    }
    
    setProcedimentos([...procedimentos, { ...novoProcedimento, _action: 'create' }]);
    setNovoProcedimento({ nome: "", valorParticular: "", valorAssinanteVital: "" });
    toast.success("Procedimento adicionado");
  };
  
  const editarProcedimento = (index: number) => {
    const proc = procedimentos[index];
    setEditandoProcedimentoId(proc.id || index);
  };
  
  const salvarEdicao = (index: number, procedimento: Procedimento) => {
    const novosProcs = [...procedimentos];
    novosProcs[index] = { ...procedimento, _action: procedimento.id ? 'update' : 'create' };
    setProcedimentos(novosProcs);
    setEditandoProcedimentoId(null);
    toast.success("Procedimento atualizado");
  };
  
  const removerProcedimento = (index: number) => {
    const proc = procedimentos[index];
    if (proc.id) {
      // Marcar para deleção se já existe no banco
      const novosProcs = [...procedimentos];
      novosProcs[index] = { ...proc, _action: 'delete' };
      setProcedimentos(novosProcs);
    } else {
      // Remover diretamente se ainda não foi salvo
      setProcedimentos(procedimentos.filter((_, i) => i !== index));
    }
    toast.success("Procedimento removido");
  };
  
  const enviarMutation = trpc.parceria.solicitar.useMutation({
    onSuccess: () => {
      setEnviado(true);
      toast.success("Cadastro enviado com sucesso!", {
        description: "Sua solicitação será analisada pela equipe Vital.",
      });
    },
    onError: (error) => {
      toast.error("Erro ao enviar cadastro", {
        description: error.message,
      });
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceitouTermos) {
      toast.error("Aceite obrigatório", {
        description: "Você precisa aceitar os Termos de Credenciamento para continuar.",
      });
      return;
    }
    
    // Validar campos obrigatórios com mensagens específicas
    const camposFaltantes: string[] = [];
    
    if (!formData.nome) camposFaltantes.push("Nome do Estabelecimento");
    if (!formData.categoria) camposFaltantes.push("Categoria");
    if (!formData.municipio) camposFaltantes.push("Município");
    if (!formData.endereco) camposFaltantes.push("Endereço");
    if (!formData.whatsappSecretaria) camposFaltantes.push("WhatsApp Comercial/Agendamento");
    if (!formData.whatsappParceria) camposFaltantes.push("WhatsApp Responsável Cadastro");
    if (!formData.valorParticular) camposFaltantes.push("Valor Particular");
    if (!formData.valorAssinanteVital) camposFaltantes.push("Valor Assinante Vital");
    if (!logoBase64) camposFaltantes.push("Logo do Estabelecimento");
    
    if (camposFaltantes.length > 0) {
      toast.error("Campos obrigatórios não preenchidos", {
        description: `Por favor, preencha: ${camposFaltantes.join(", ")}.`,
        duration: 6000,
      });
      return;
    }
    
    try {
      // Upload do logo se houver
      let logoUrl = formData.logoUrl;
      if (logoBase64) {
        const uploadResult = await uploadMutation.mutateAsync({
          base64: logoBase64,
          filename: `logo-servico-${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });
        logoUrl = uploadResult.url;
      }
      
      // Upload da foto se houver
      let fotoUrl = formData.fotoUrl;
      if (fotoBase64) {
        const uploadResult = await uploadMutation.mutateAsync({
          base64: fotoBase64,
          filename: `foto-servico-${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });
        fotoUrl = uploadResult.url;
      }
      
      // Salvar procedimentos se for atualização
      if (tokenData?.token?.tipo === "atualizacao" && procedimentos.length > 0) {
        const procsComAcao = procedimentos.filter(p => p._action);
        if (procsComAcao.length > 0) {
          const utils = trpc.useUtils();
          await utils.client.procedimentos.gerenciarComToken.mutate({
            token,
            procedimentos: procsComAcao,
          });
        }
      }
      
      enviarMutation.mutate({
        tipoCredenciado: "instituicao",
        nomeResponsavel: formData.contatoParceria || formData.nome,
        nomeEstabelecimento: formData.nome,
        tipoServico: formData.tipoServico,
        categoria: formData.categoria,
        cidade: formData.municipio,
        endereco: formData.endereco,
        telefone: formData.telefoneFixo || formData.whatsappSecretaria || "",
        whatsappSecretaria: formData.whatsappSecretaria || "",
        email: formData.email,
        valorParticular: unmaskMoeda(formData.valorParticular),
        valorAssinanteVital: unmaskMoeda(formData.valorAssinanteVital),
        descontoPercentual: calcularDesconto(formData.valorParticular, formData.valorAssinanteVital),
        observacoes: formData.observacoes,
        contatoParceria: formData.contatoParceria,
        whatsappParceria: formData.whatsappParceria,
        logoUrl: logoUrl,
        fotoUrl: fotoUrl,
      });
    } catch (error) {
      toast.error("Erro ao processar cadastro", {
        description: "Tente novamente.",
      });
    }
  };
  
  if (loadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!tokenData?.valido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Link Inválido</CardTitle>
            <CardDescription>
              Este link de cadastro não é válido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Entre em contato com a equipe Vital para solicitar um novo link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Cadastro Enviado!</CardTitle>
            <CardDescription>
              Sua solicitação de cadastro foi enviada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              A equipe Vital irá revisar suas informações e, após aprovação, você será incluído na plataforma.
            </p>
            <p className="text-sm font-medium text-primary">
              Bem-vindo à Rede Vital!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const descontoCalculado = calcularDesconto(formData.valorParticular, formData.valorAssinanteVital);
  
  const categoriasDisponiveis = formData.tipoServico === "servicos_saude" 
    ? CATEGORIAS_SERVICOS_SAUDE 
    : CATEGORIAS_OUTROS_SERVICOS;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt="Vital" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            Cadastro de Serviço Parceiro
          </h1>
          <p className="text-muted-foreground">
            Preencha seus dados para fazer parte da Rede Vital
          </p>
        </div>
        
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Estabelecimento</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios. Após envio, a equipe Vital irá revisar e aprovar seu cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="nome">Nome do Estabelecimento *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da clínica, farmácia, laboratório, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                  <Select value={formData.tipoServico} onValueChange={(value: any) => setFormData({ ...formData, tipoServico: value, categoria: "" })}>
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
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasDisponiveis.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="municipio">Município *</Label>
                <Select value={formData.municipio} onValueChange={(value) => setFormData({ ...formData, municipio: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o município" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPIOS_VALE_ITAJAI.map((mun: string) => (
                      <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço Completo *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro"
                  required
                />
              </div>
              
              {/* Campos de Telefone Simplificados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefoneFixo">Telefone Fixo</Label>
                  <Input
                    id="telefoneFixo"
                    value={formData.telefoneFixo}
                    onChange={(e) => setFormData({ ...formData, telefoneFixo: maskTelefone(e.target.value) })}
                    placeholder="(47) 3333-4444"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsappSecretaria">WhatsApp Comercial/Agendamento *</Label>
                  <Input
                    id="whatsappSecretaria"
                    value={formData.whatsappSecretaria}
                    onChange={(e) => setFormData({ ...formData, whatsappSecretaria: maskTelefone(e.target.value) })}
                    placeholder="(47) 99999-8888"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorParticular">Valor Particular *</Label>
                  <Input
                    id="valorParticular"
                    value={formData.valorParticular}
                    onChange={(e) => setFormData({ ...formData, valorParticular: maskMoeda(e.target.value) })}
                    placeholder="Ex: R$ 200,00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="valorAssinanteVital">Valor Assinante Vital *</Label>
                  <Input
                    id="valorAssinanteVital"
                    value={formData.valorAssinanteVital}
                    onChange={(e) => setFormData({ ...formData, valorAssinanteVital: maskMoeda(e.target.value) })}
                    placeholder="Ex: R$ 150,00"
                    required
                  />
                </div>
              </div>
              
              {descontoCalculado > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>Desconto calculado:</strong> {descontoCalculado}% para assinantes Vital
                  </p>
                </div>
              )}
              
              {/* Logo do Estabelecimento */}
              <div>
                <Label>Logo do Estabelecimento</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Envie o logo para exibição no guia de credenciados.
                </p>
                <ImageUpload
                  value={formData.logoUrl}
                  onChange={(file, previewUrl) => {
                    setFormData({ ...formData, logoUrl: previewUrl || "" });
                    if (previewUrl) {
                      setLogoBase64(previewUrl);
                    } else {
                      setLogoBase64(null);
                    }
                  }}
                  label="Logo"
                />
              </div>
              
              {/* Foto do Estabelecimento */}
              <div>
                <Label>Foto do Estabelecimento (opcional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Envie uma foto da fachada ou interior do estabelecimento.
                </p>
                <ImageUpload
                  value={formData.fotoUrl}
                  onChange={(file, previewUrl) => {
                    setFormData({ ...formData, fotoUrl: previewUrl || "" });
                    if (previewUrl) {
                      setFotoBase64(previewUrl);
                    } else {
                      setFotoBase64(null);
                    }
                  }}
                  label="Foto"
                />
              </div>
              
              {/* Procedimentos Oferecidos */}
              {
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-lg mb-3">Procedimentos Oferecidos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gerencie os procedimentos e serviços oferecidos pelo seu estabelecimento.
                  </p>
                  
                  {/* Lista de procedimentos existentes */}
                  {procedimentos.filter(p => p._action !== 'delete').length > 0 && (
                    <div className="space-y-2 mb-4">
                      {procedimentos.map((proc, index) => {
                        if (proc._action === 'delete') return null;
                        
                        const isEditing = editandoProcedimentoId === (proc.id || index);
                        
                        if (isEditing) {
                          return (
                            <div key={proc.id || index} className="p-3 border rounded-lg bg-muted/50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                <Input
                                  placeholder="Nome do procedimento"
                                  value={proc.nome}
                                  onChange={(e) => {
                                    const novosProcs = [...procedimentos];
                                    novosProcs[index] = { ...proc, nome: e.target.value };
                                    setProcedimentos(novosProcs);
                                  }}
                                />
                                <Input
                                  placeholder="Valor Particular"
                                  value={proc.valorParticular}
                                  onChange={(e) => {
                                    const novosProcs = [...procedimentos];
                                    novosProcs[index] = { ...proc, valorParticular: maskMoeda(e.target.value) };
                                    setProcedimentos(novosProcs);
                                  }}
                                />
                                <Input
                                  placeholder="Valor Vital"
                                  value={proc.valorAssinanteVital}
                                  onChange={(e) => {
                                    const novosProcs = [...procedimentos];
                                    novosProcs[index] = { ...proc, valorAssinanteVital: maskMoeda(e.target.value) };
                                    setProcedimentos(novosProcs);
                                  }}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => salvarEdicao(index, proc)}
                                >
                                  Salvar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditandoProcedimentoId(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={proc.id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium">{proc.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                Particular: {proc.valorParticular} | Vital: {proc.valorAssinanteVital}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => editarProcedimento(index)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removerProcedimento(index)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Formulário para adicionar novo procedimento */}
                  <div className="p-3 border rounded-lg bg-muted/10">
                    <p className="text-sm font-medium mb-2">Adicionar Novo Procedimento</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <Input
                        placeholder="Nome do procedimento *"
                        value={novoProcedimento.nome}
                        onChange={(e) => setNovoProcedimento({ ...novoProcedimento, nome: e.target.value })}
                      />
                      <Input
                        placeholder="Valor Particular *"
                        value={novoProcedimento.valorParticular}
                        onChange={(e) => setNovoProcedimento({ ...novoProcedimento, valorParticular: maskMoeda(e.target.value) })}
                      />
                      <Input
                        placeholder="Valor Assinante Vital *"
                        value={novoProcedimento.valorAssinanteVital}
                        onChange={(e) => setNovoProcedimento({ ...novoProcedimento, valorAssinanteVital: maskMoeda(e.target.value) })}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={adicionarProcedimento}
                      className="w-full md:w-auto"
                    >
                      Adicionar Procedimento
                    </Button>
                  </div>
                </div>
              }
              
              {/* Responsável pelo Cadastro */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">Responsável pelo Cadastro na Rede</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Informações de contato para atualizações futuras do cadastro.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contatoParceria">Nome do Responsável</Label>
                    <Input
                      id="contatoParceria"
                      value={formData.contatoParceria}
                      onChange={(e) => setFormData({ ...formData, contatoParceria: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsappParceria">WhatsApp do Responsável *</Label>
                    <Input
                      id="whatsappParceria"
                      value={formData.whatsappParceria}
                      onChange={(e) => setFormData({ ...formData, whatsappParceria: maskTelefone(e.target.value) })}
                      placeholder="(47) 99999-6666"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais, horários de funcionamento, etc."
                  rows={4}
                />
              </div>
              
              {/* Checkbox de Aceite de Termos */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termos"
                    checked={aceitouTermos}
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                    className="mt-1 h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <label htmlFor="termos" className="text-sm text-gray-700 cursor-pointer">
                    <span className="font-semibold text-teal-700">Li e aceito os Termos de Credenciamento e Uso dos Sistemas Vital.</span>
                    {" "}
                    <a 
                      href="/termos-de-uso" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 underline hover:text-teal-800"
                    >
                      Ver termos completos
                    </a>
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={enviarMutation.isPending || uploadMutation.isPending}
              >
                {(enviarMutation.isPending || uploadMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Cadastro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
