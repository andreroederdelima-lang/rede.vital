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
import { Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { APP_LOGO } from "@/const";
import { maskTelefone, maskMoeda, unmaskMoeda, calcularDesconto } from "@/lib/masks";
import { MUNICIPIOS_VALE_ITAJAI } from "@shared/colors";
import { ESPECIALIDADES_MEDICAS, UFS, TIPOS_CONSELHO } from "@shared/especialidades";
import ImageUpload from "@/components/ImageUpload";

const SUPORTE_WHATSAPP = "5547992052016";
const SUPORTE_LABEL = "(47) 99205-2016";

type Titulo = "Dr." | "Dra." | "";

function stripTitulo(nomeCompleto: string): { titulo: Titulo; nomeSemTitulo: string } {
  const match = nomeCompleto.match(/^(Dr\.?|Dra\.?)\s+(.*)$/i);
  if (match) {
    const titulo: Titulo = match[1].toLowerCase().startsWith("dra") ? "Dra." : "Dr.";
    return { titulo, nomeSemTitulo: match[2] };
  }
  return { titulo: "", nomeSemTitulo: nomeCompleto };
}

export default function CadastroMedico() {
  const [, params] = useRoute("/cadastro-medico/:token");
  const token = params?.token || "";
  
  const [formData, setFormData] = useState({
    titulo: "" as Titulo,
    nome: "",
    especialidade: "",
    tipoConselho: "CRM",
    numeroRegistroConselho: "",
    ufConselho: "SC",
    areaAtuacao: "",
    municipio: "",
    endereco: "",
    telefoneFixo: "",
    whatsappSecretaria: "",
    email: "",
    tipoAtendimento: "presencial" as "presencial" | "telemedicina" | "ambos",
    valorParticular: "",
    valorAssinanteVital: "",
    observacoes: "",
    contatoParceria: "",
    whatsappParceria: "",
    fotoUrl: "",
    logoUrl: "",
  });
  
  const [enviado, setEnviado] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [usarImagemPadraoLogo, setUsarImagemPadraoLogo] = useState(false);
  const [usarImagemPadraoFoto, setUsarImagemPadraoFoto] = useState(false);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  
  // Upload de imagem
  const uploadMutation = trpc.upload.imagem.useMutation();
  
  // Verificar validade do token
  const { data: tokenData, isLoading: loadingToken } = trpc.tokens.verificar.useQuery(
    { token },
    { enabled: !!token }
  );
  
  // Carregar dados do médico se for atualização
  const { data: medicoExistente, isLoading: loadingMedico } = trpc.medicos.obter.useQuery(
    tokenData?.token?.credenciadoId || 0,
    { enabled: tokenData?.valido && tokenData?.token?.tipoCredenciado === "medico" && tokenData?.token?.tipo === "atualizacao" }
  );
  
  // Pré-preencher formulário com dados existentes
  useEffect(() => {
    if (medicoExistente) {
      const { titulo, nomeSemTitulo } = stripTitulo(medicoExistente.nome || "");
      const registroRaw = medicoExistente.numeroRegistroConselho || "";
      // Tenta extrair "CRM/SC 12345" ou "CRM 12345/SC" em partes
      const registroMatch = registroRaw.match(/^(CRM|CRO|CREFITO|CRN|CRP|CRF|CRFa|COREN|CRBM)[\s\/]*([A-Z]{2})?[\s\/]*(\d+)/i);
      const tipoConselho = registroMatch?.[1]?.toUpperCase() || "CRM";
      const ufConselho = registroMatch?.[2]?.toUpperCase() || "SC";
      const numeroRegistro = registroMatch?.[3] || registroRaw;

      setFormData({
        titulo,
        nome: nomeSemTitulo,
        especialidade: medicoExistente.especialidade || "",
        tipoConselho,
        numeroRegistroConselho: numeroRegistro,
        ufConselho,
        areaAtuacao: medicoExistente.areaAtuacao || "",
        municipio: medicoExistente.municipio || "",
        endereco: medicoExistente.endereco || "",
        telefoneFixo: medicoExistente.telefone || "",
        whatsappSecretaria: medicoExistente.whatsapp || "",
        email: medicoExistente.email || "",
        tipoAtendimento: (medicoExistente.tipoAtendimento as any) || "presencial",
        valorParticular: medicoExistente.valorParticular || "",
        valorAssinanteVital: medicoExistente.valorAssinanteVital || "",
        observacoes: medicoExistente.observacoes || "",
        contatoParceria: "",
        whatsappParceria: medicoExistente.whatsapp || "",
        fotoUrl: medicoExistente.fotoUrl || "",
        logoUrl: medicoExistente.logoUrl || "",
      });
      setAceitouTermos(true); // Auto-aceitar termos para atualização
    }
  }, [medicoExistente]);
  
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
    
    if (!formData.nome) camposFaltantes.push("Nome do Médico");
    if (!formData.especialidade) camposFaltantes.push("Especialidade");
    if (!formData.municipio) camposFaltantes.push("Município");
    if (!formData.endereco) camposFaltantes.push("Endereço");
    
    // Validar que pelo menos um meio de contato foi fornecido
    if (!formData.telefoneFixo && !formData.whatsappSecretaria) {
      camposFaltantes.push("Pelo menos um meio de contato (Telefone Fixo OU WhatsApp)");
    }
    
    if (!formData.whatsappParceria) camposFaltantes.push("WhatsApp Responsável Cadastro");
    if (!formData.valorParticular) camposFaltantes.push("Valor Particular");
    if (!formData.valorAssinanteVital) camposFaltantes.push("Valor Assinante Vital");
    if (!fotoBase64 && !usarImagemPadraoFoto) camposFaltantes.push("Foto do Médico ou marque 'Usar imagem padrão'");
    
    if (camposFaltantes.length > 0) {
      toast.error("Campos obrigatórios não preenchidos", {
        description: `Por favor, preencha: ${camposFaltantes.join(", ")}.`,
        duration: 6000,
      });
      return;
    }
    
    try {
      // Upload da foto se houver
      let fotoUrl = formData.fotoUrl;
      if (fotoBase64) {
        const uploadResult = await uploadMutation.mutateAsync({
          base64: fotoBase64,
          filename: `foto-medico-${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });
        fotoUrl = uploadResult.url;
      }
      
      // Upload do logo se houver
      let logoUrl = formData.logoUrl;
      if (logoBase64) {
        const uploadResult = await uploadMutation.mutateAsync({
          base64: logoBase64,
          filename: `logo-medico-${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });
        logoUrl = uploadResult.url;
      }
      
      const nomeCompleto = formData.titulo
        ? `${formData.titulo} ${formData.nome}`.trim()
        : formData.nome.trim();
      const registroCompleto = formData.numeroRegistroConselho
        ? `${formData.tipoConselho}/${formData.ufConselho} ${formData.numeroRegistroConselho}`
        : "";

      enviarMutation.mutate({
        tipoCredenciado: "medico",
        nomeResponsavel: formData.contatoParceria || nomeCompleto,
        nomeEstabelecimento: nomeCompleto,
        especialidade: formData.especialidade,
        numeroRegistroConselho: registroCompleto,
        areaAtuacao: formData.areaAtuacao,
        categoria: formData.especialidade,
        cidade: formData.municipio,
        endereco: formData.endereco,
        telefone: formData.telefoneFixo || formData.whatsappSecretaria || "",
        whatsappSecretaria: formData.whatsappSecretaria || "",
        email: formData.email,
        tipoAtendimento: formData.tipoAtendimento,
        valorParticular: unmaskMoeda(formData.valorParticular),
        valorAssinanteVital: unmaskMoeda(formData.valorAssinanteVital),
        descontoPercentual: calcularDesconto(formData.valorParticular, formData.valorAssinanteVital),
        observacoes: formData.observacoes,
        contatoParceria: formData.contatoParceria,
        whatsappParceria: formData.whatsappParceria,
        tipoServico: "servicos_saude",
        fotoUrl: fotoUrl,
        logoUrl: logoUrl,
      });
    } catch (error) {
      console.error("Erro detalhado ao processar cadastro:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao processar cadastro", {
        description: errorMessage,
        duration: 10000,
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt="Vital" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            Cadastro de Médico
          </h1>
          <p className="text-muted-foreground">
            Preencha seus dados para fazer parte da Rede Vital
          </p>
        </div>
        
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Médico</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios. Após envio, a equipe Vital irá revisar e aprovar seu cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.titulo || "_none"}
                    onValueChange={(value) => setFormData({ ...formData, titulo: value === "_none" ? "" : value as Titulo })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Sem título</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Dra.">Dra.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome e sobrenome"
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dr./Dra. só para médicos(as) e dentistas. Outros profissionais (fisio, nutri, psico, enfermagem, etc.) selecionem <strong>Sem título</strong>.
                </p>
              </div>

              <div>
                <Label htmlFor="especialidade">Especialidade *</Label>
                <Select
                  value={formData.especialidade}
                  onValueChange={(value) => setFormData({ ...formData, especialidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ESPECIALIDADES_MEDICAS.map((esp) => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta é a lista que os pacientes usam para te encontrar.
                </p>
              </div>

              <div>
                <Label>Registro no Conselho</Label>
                <div className="grid grid-cols-[1fr_80px_2fr] gap-2">
                  <Select
                    value={formData.tipoConselho}
                    onValueChange={(value) => setFormData({ ...formData, tipoConselho: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Conselho" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_CONSELHO.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.ufConselho}
                    onValueChange={(value) => setFormData({ ...formData, ufConselho: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {UFS.map((uf) => (
                        <SelectItem key={uf.value} value={uf.value}>{uf.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="numeroRegistroConselho"
                    value={formData.numeroRegistroConselho}
                    onChange={(e) => setFormData({ ...formData, numeroRegistroConselho: e.target.value.replace(/\D/g, "") })}
                    placeholder="Número"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ex: CRM/SC 12345. Selecione o conselho, o estado e digite apenas os números do registro.
                </p>
              </div>
              
              <div>
                <Label htmlFor="areaAtuacao">Área de Atuação Principal</Label>
                <Input
                  id="areaAtuacao"
                  value={formData.areaAtuacao}
                  onChange={(e) => setFormData({ ...formData, areaAtuacao: e.target.value })}
                  placeholder="Ex: foco em saúde mental, atendimento infantil, etc."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  👁️ Este campo aparece aos pacientes
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="tipoAtendimento">Tipo de Atendimento</Label>
                  <Select value={formData.tipoAtendimento} onValueChange={(value: any) => setFormData({ ...formData, tipoAtendimento: value })}>
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
                  <Label htmlFor="whatsappSecretaria">WhatsApp Secretária/Agendamento *</Label>
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
              
              {/* Logo do Consultório/Clínica */}
              <div>
                <Label>Logo do Consultório/Clínica (opcional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Envie o logo do seu consultório ou clínica, se houver.
                </p>
                <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="usarImagemPadraoLogo"
                      checked={usarImagemPadraoLogo}
                      onChange={(e) => {
                        setUsarImagemPadraoLogo(e.target.checked);
                        if (e.target.checked) {
                          setLogoBase64(null);
                          setFormData({ ...formData, logoUrl: "" });
                        }
                      }}
                      className="h-5 w-5 rounded border-teal-500 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="usarImagemPadraoLogo" className="text-sm font-medium text-teal-900 cursor-pointer">
                      ✓ Usar logo padrão temporariamente (vou enviar imagem em breve)
                    </label>
                  </div>
                </div>
                {!usarImagemPadraoLogo && (
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
                )}
              </div>
              
              {/* Foto do Médico */}
              <div>
                <Label>Foto do Médico *</Label>
                <div className="text-sm text-muted-foreground mb-2 space-y-1">
                  <p>Esta foto será exibida aos pacientes no guia de credenciados. Recomendações:</p>
                  <ul className="list-disc pl-5 text-xs">
                    <li>Foto do rosto, em plano aproximado</li>
                    <li>Aparência profissional (jaleco ou roupa de trabalho)</li>
                    <li>Iluminação boa e fundo neutro</li>
                    <li>Expressão acolhedora — é a primeira impressão do paciente</li>
                  </ul>
                </div>
                <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="usarImagemPadraoFoto"
                      checked={usarImagemPadraoFoto}
                      onChange={(e) => {
                        setUsarImagemPadraoFoto(e.target.checked);
                        if (e.target.checked) {
                          setFotoBase64(null);
                          setFormData({ ...formData, fotoUrl: "" });
                        }
                      }}
                      className="h-5 w-5 rounded border-teal-500 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="usarImagemPadraoFoto" className="text-sm font-medium text-teal-900 cursor-pointer">
                      ✓ Usar foto padrão temporariamente (vou enviar imagem em breve)
                    </label>
                  </div>
                </div>
                {!usarImagemPadraoFoto && (
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
                )}
              </div>
              
              {/* Responsável pelo Cadastro */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-1">Responsável pelo Cadastro na Rede</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Pode ser a secretária, assistente, outro membro da equipe ou o próprio profissional.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-900">
                  🔒 <strong>Esta informação não aparece no site.</strong> É usada apenas pela equipe Vital para atualizações futuras do cadastro.
                </div>

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
                  placeholder="Informações adicionais, horários de atendimento, etc."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  🔒 Este campo aparece apenas internamente para o comercial Vital
                </p>
              </div>
              
              {/* Suporte */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Precisa de ajuda?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Se estiver com dificuldade para preencher o cadastro, envie seus dados diretamente
                  para um membro da equipe Vital — a gente finaliza o cadastro pra você.
                </p>
                <a
                  href={`https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent("Olá! Preciso de ajuda com o cadastro de credenciado na Rede Vital.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar com a equipe Vital · {SUPORTE_LABEL}
                </a>
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
                      href="/termos-uso" 
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
