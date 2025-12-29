import { useState } from "react";
import { APP_LOGO, APP_TITLE } from "@/const";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { maskTelefone, maskMoeda, calcularDesconto } from "@/lib/masks";
import { 
  Users, 
  TrendingUp, 
  Megaphone, 
  Shield, 
  Handshake, 
  HeadphonesIcon,
  CheckCircle2,
  ArrowRight,
  Building2,
  Upload,
  Loader2,
  Eye,
  Network,
  Home as HomeIcon,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";
import { storagePut } from "../../../server/storage";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const VITAL_COLORS = {
  turquoise: "#2D9B9B",
  beige: "#D4C5A0",
  lightGray: "#F5F5F5",
};

export default function Parceiros() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados do formulário
  const [tipoCredenciado, setTipoCredenciado] = useState<"medico" | "instituicao">("instituicao");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [tipoServico, setTipoServico] = useState<"servicos_saude" | "outros_servicos">("servicos_saude");
  const [categoria, setCategoria] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [areaAtuacao, setAreaAtuacao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsappSecretaria, setWhatsappSecretaria] = useState("");
  const [email, setEmail] = useState("");
  const [precoConsulta, setPrecoConsulta] = useState("");
  const [valorParticular, setValorParticular] = useState("");
  const [valorAssinanteVital, setValorAssinanteVital] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [usarImagemPadraoLogo, setUsarImagemPadraoLogo] = useState(false);
  const [usarImagemPadraoFoto, setUsarImagemPadraoFoto] = useState(false);
  
  // Novos campos padronizados
  const [numeroRegistroConselho, setNumeroRegistroConselho] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState<"presencial" | "telemedicina" | "ambos">("presencial");
  const [contatoParceria, setContatoParceria] = useState("");
  const [whatsappParceria, setWhatsappParceria] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const solicitarParceriaMutation = trpc.parceria.solicitar.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso!", {
        description: "Entraremos em contato em breve para análise da parceria."
      });
      limparFormulario();
      setMostrarFormulario(false);
    },
    onError: (error) => {
      toast.error("Erro ao enviar solicitação", {
        description: error.message
      });
    }
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setTipoCredenciado("instituicao");
    setNomeResponsavel("");
    setNomeEstabelecimento("");
    setCategoria("");
    setEspecialidade("");
    setAreaAtuacao("");
    setEndereco("");
    setCidade("");
    setTelefone("");
    setWhatsappSecretaria("");
    setEmail("");
    setPrecoConsulta("");
    setValorParticular("");
    setValorAssinanteVital("");
    setDescontoPercentual("");
    setLogoFile(null);
    setLogoPreview("");
    setFotoFile(null);
    setFotoPreview("");
    setAceitouTermos(false);
    setNumeroRegistroConselho("");
    setTipoAtendimento("presencial");
    setContatoParceria("");
    setWhatsappParceria("");
    setObservacoes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!nomeResponsavel || !nomeEstabelecimento || !categoria || !endereco || !cidade || !telefone || !whatsappSecretaria) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Validação de valores
    if (!valorParticular || !valorAssinanteVital) {
      toast.error("Informe o valor particular e o valor para assinante Vital");
      return;
    }
    
    // Validação de email para instituições
    if (tipoCredenciado === "instituicao" && !email) {
      toast.error("E-mail é obrigatório para instituições");
      return;
    }
    
    // Validação adicional para médicos
    if (tipoCredenciado === "medico" && (!especialidade || !areaAtuacao)) {
      toast.error("Para médicos, é obrigatório informar especialidade e área de atuação");
      return;
    }

    // Validação de aceite de termos
    if (!aceitouTermos) {
      toast.error("Você deve aceitar os Termos de Uso para prosseguir");
      return;
    }

    let logoUrl: string | undefined;
    let fotoUrl: string | undefined;

    // Upload do logo se fornecido
    if (logoFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', logoFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error("Erro no upload do logo");
        
        const data = await response.json();
        logoUrl = data.url;
      } catch (error) {
        toast.error("Erro ao fazer upload do logo");
        setUploading(false);
        return;
      }
    }

    // Upload da foto se fornecida
    if (fotoFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', fotoFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error("Erro no upload da foto");
        
        const data = await response.json();
        fotoUrl = data.url;
      } catch (error) {
        toast.error("Erro ao fazer upload da foto");
        setUploading(false);
        return;
      }
    }
    
    setUploading(false);

    solicitarParceriaMutation.mutate({
      tipoCredenciado,
      nomeResponsavel,
      nomeEstabelecimento,
      tipoServico: tipoCredenciado === "instituicao" ? tipoServico : undefined,
      categoria: categoria as any,
      especialidade: tipoCredenciado === "medico" ? especialidade : undefined,
      areaAtuacao: tipoCredenciado === "medico" ? areaAtuacao : undefined,
      numeroRegistroConselho: tipoCredenciado === "medico" && numeroRegistroConselho ? numeroRegistroConselho : undefined,
      tipoAtendimento,
      endereco,
      cidade,
      telefone,
      whatsappSecretaria,
      email: email || undefined,
      precoConsulta,
      valorParticular,
      valorAssinanteVital,
      descontoPercentual: parseInt(descontoPercentual),
      logoUrl,
      fotoUrl,
      contatoParceria: contatoParceria || undefined,
      whatsappParceria: whatsappParceria || undefined,
      observacoes: observacoes || undefined,
    });
  };

  const beneficios = [
    {
      icon: Eye,
      titulo: "Aumento de Visibilidade",
      descricao: "Seu estabelecimento será divulgado em nossa plataforma digital e materiais de comunicação, alcançando milhares de clientes Vital."
    },
    {
      icon: Users,
      titulo: "Mais Pacientes e Clientes Particulares",
      descricao: "Receba clientes Vital que pagam com valor reduzido, ampliando seu fluxo de atendimentos sem custo de captação."
    },
    {
      icon: Network,
      titulo: "Faça Parte do Ecossistema Vital",
      descricao: "Integre uma rede colaborativa de saúde que une qualidade, confiança e crescimento sustentável."
    },
    {
      icon: HomeIcon,
      titulo: "Crescimento com Atendimento Domiciliar",
      descricao: "Cresça junto com nosso ecossistema de atendimento domiciliar e geração de benefícios integrados."
    },
    {
      icon: Handshake,
      titulo: "Parceria de Verdade",
      descricao: "Não somos intermediários. Somos parceiros que cuidam com o mesmo coração Vital e crescem juntos."
    },
  ];

  const mantras = [
    "Somos VITAIS - Para a empresa, para os clientes, uns para os outros",
    "Aqui a gente cuida como se fosse da nossa família",
    "Cuidar bem é só o começo. Queremos mudar destinos.",
    "Se faz diferença na vida de alguém, vale a pena fazer bem feito",
    "Somos um só cuidado - Parceiros que cuidam com o mesmo coração Vital"
  ];

  if (mostrarFormulario) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b-4 border-primary shadow-sm">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={APP_LOGO} alt="Vital Logo" className="h-20" />
                <div>
                  <h1 className="text-2xl font-bold text-primary">Cadastro de Parceiro</h1>
                  <p className="text-sm text-muted-foreground">Preencha o formulário abaixo</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setMostrarFormulario(false)} className="border-primary text-primary hover:bg-primary hover:text-white">
                Voltar
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoCredenciado">Tipo de Credenciado *</Label>
                  <Select value={tipoCredenciado} onValueChange={(v: "medico" | "instituicao") => setTipoCredenciado(v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instituicao">Instituição (Clínica, Farmácia, Laboratório, etc.)</SelectItem>
                      <SelectItem value="medico">Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeResponsavel">Nome do Responsável *</Label>
                  <Input
                    id="nomeResponsavel"
                    value={nomeResponsavel}
                    onChange={(e) => setNomeResponsavel(e.target.value)}
                    placeholder="Quem está negociando a parceria"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeEstabelecimento">Nome do Estabelecimento *</Label>
                  <Input
                    id="nomeEstabelecimento"
                    value={nomeEstabelecimento}
                    onChange={(e) => setNomeEstabelecimento(e.target.value)}
                    placeholder="Nome da clínica, farmácia, etc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                  <Select value={tipoServico} onValueChange={(v: any) => setTipoServico(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servicos_saude">Serviços de Saúde (Fisio, Fono, Clínicas, Laboratórios, Diagnóstico por Imagem, Farmácias)</SelectItem>
                      <SelectItem value="outros_servicos">Outros Serviços (Artes Marciais, Academias, Lojas, Mercados, Padarias, Hotéis, Pet Shops)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Selecione se seu estabelecimento é da área da saúde ou oferece outros tipos de serviços.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={categoria} onValueChange={setCategoria} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {(tipoServico === "servicos_saude" 
                        ? CATEGORIAS_SERVICOS_SAUDE 
                        : CATEGORIAS_OUTROS_SERVICOS
                      ).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {tipoServico === "servicos_saude" 
                      ? "Selecione o tipo específico de serviço de saúde" 
                      : "Selecione a categoria do estabelecimento"}
                  </p>
                </div>

                {tipoCredenciado === "medico" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="especialidade">Especialidade *</Label>
                      <Input
                        id="especialidade"
                        value={especialidade}
                        onChange={(e) => setEspecialidade(e.target.value)}
                        placeholder="Ex: Cardiologia, Ortopedia, Clínica Geral..."
                        required={tipoCredenciado === "medico"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="areaAtuacao">Principal Área de Atuação *</Label>
                      <Input
                        id="areaAtuacao"
                        value={areaAtuacao}
                        onChange={(e) => setAreaAtuacao(e.target.value)}
                        placeholder="Ex: Dor crônica, Cirurgia plástica, Saúde da mulher..."
                        required={tipoCredenciado === "medico"}
                      />
                      <p className="text-sm text-muted-foreground">
                        Descreva sua principal área de atuação ou foco de trabalho.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroRegistroConselho">Número de Registro no Conselho (CRM, CRO, etc)</Label>
                      <Input
                        id="numeroRegistroConselho"
                        value={numeroRegistroConselho}
                        onChange={(e) => setNumeroRegistroConselho(e.target.value)}
                        placeholder="Ex: CRM 12345/SC"
                      />
                      <p className="text-sm text-muted-foreground">
                        Opcional. Informe seu registro profissional se desejar.
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Textarea
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Timbó, Indaial, Pomerode..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoAtendimento">Tipo de Atendimento *</Label>
                  <Select value={tipoAtendimento} onValueChange={(v: any) => setTipoAtendimento(v)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="telemedicina">Online/Telemedicina</SelectItem>
                      <SelectItem value="ambos">Ambos (Presencial e Online)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone de Contato *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                    placeholder="(47) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappSecretaria">
                    {tipoCredenciado === "medico" 
                      ? "WhatsApp da Secretária para Agendamento *" 
                      : "WhatsApp Comercial para Contato *"}
                  </Label>
                  <Input
                    id="whatsappSecretaria"
                    value={whatsappSecretaria}
                    onChange={(e) => setWhatsappSecretaria(maskTelefone(e.target.value))}
                    placeholder="(47) 99999-9999"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Este número será usado no botão "Fale com o Parceiro" nos cards
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail {tipoCredenciado === "medico" ? "(opcional)" : "*"}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@exemplo.com"
                    required={tipoCredenciado === "instituicao"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorParticular">Valor Particular (sem desconto) *</Label>
                  <Input
                    id="valorParticular"
                    value={valorParticular}
                    onChange={(e) => {
                      const masked = maskMoeda(e.target.value);
                      setValorParticular(masked);
                      // Calcular desconto automaticamente se ambos valores estiverem preenchidos
                      if (masked && valorAssinanteVital) {
                        const desconto = calcularDesconto(masked, valorAssinanteVital);
                        setDescontoPercentual(desconto.toString());
                      }
                    }}
                    placeholder="Ex: R$ 200,00"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor cobrado de pacientes não-assinantes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorAssinanteVital">Valor para Assinante Vital *</Label>
                  <Input
                    id="valorAssinanteVital"
                    value={valorAssinanteVital}
                    onChange={(e) => {
                      const masked = maskMoeda(e.target.value);
                      setValorAssinanteVital(masked);
                      // Calcular desconto automaticamente se ambos valores estiverem preenchidos
                      if (masked && valorParticular) {
                        const desconto = calcularDesconto(valorParticular, masked);
                        setDescontoPercentual(desconto.toString());
                      }
                    }}
                    placeholder="Ex: R$ 150,00"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor com desconto para assinantes Vital
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto Calculado (%)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    min="0"
                    max="100"
                    value={descontoPercentual}
                    onChange={(e) => setDescontoPercentual(e.target.value)}
                    placeholder="Calculado automaticamente"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Calculado automaticamente com base nos valores informados
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo do Estabelecimento (opcional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Logo da clínica, empresa ou estabelecimento
                  </p>
                  <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="usarImagemPadraoLogoParceiros"
                        checked={usarImagemPadraoLogo}
                        onChange={(e) => {
                          setUsarImagemPadraoLogo(e.target.checked);
                          if (e.target.checked) {
                            setLogoFile(null);
                            setLogoPreview("");
                          }
                        }}
                        className="h-5 w-5 rounded border-teal-500 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="usarImagemPadraoLogoParceiros" className="text-sm font-medium text-teal-900 cursor-pointer">
                        ✓ Usar logo padrão temporariamente (vou enviar imagem em breve)
                      </label>
                    </div>
                  </div>
                  {!usarImagemPadraoLogo && (
                    <>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      {logoPreview && (
                        <div className="mt-4">
                          <img src={logoPreview} alt="Preview Logo" className="max-w-xs rounded-lg border" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto">{tipoCredenciado === "medico" ? "Foto do Médico" : "Foto do Estabelecimento"} (opcional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tipoCredenciado === "medico" ? "Foto profissional do médico" : "Foto da fachada ou interior do estabelecimento"}
                  </p>
                  <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="usarImagemPadraoFotoParceiros"
                        checked={usarImagemPadraoFoto}
                        onChange={(e) => {
                          setUsarImagemPadraoFoto(e.target.checked);
                          if (e.target.checked) {
                            setFotoFile(null);
                            setFotoPreview("");
                          }
                        }}
                        className="h-5 w-5 rounded border-teal-500 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="usarImagemPadraoFotoParceiros" className="text-sm font-medium text-teal-900 cursor-pointer">
                        ✓ Usar foto padrão temporariamente (vou enviar imagem em breve)
                      </label>
                    </div>
                  </div>
                  {!usarImagemPadraoFoto && (
                    <>
                      <Input
                        id="foto"
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                      />
                      {fotoPreview && (
                        <div className="mt-4">
                          <img src={fotoPreview} alt="Preview Foto" className="max-w-xs rounded-lg border" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Dados Internos (não exibidos publicamente) */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
                    Dados Internos (uso administrativo)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Estas informações são apenas para controle interno e não serão exibidas publicamente.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="contatoParceria">Nome do Responsável pela Parceria</Label>
                    <Input
                      id="contatoParceria"
                      value={contatoParceria}
                      onChange={(e) => setContatoParceria(e.target.value)}
                      placeholder="Nome de quem está negociando a parceria"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappParceria">WhatsApp do Responsável pela Parceria</Label>
                    <Input
                      id="whatsappParceria"
                      value={whatsappParceria}
                      onChange={(e) => setWhatsappParceria(e.target.value)}
                      placeholder="(47) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações Internas</Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Anotações, condições especiais, histórico de negociação, etc."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Termos de Uso */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
                    Termos de Uso
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Para prosseguir com o cadastro, é necessário aceitar os termos abaixo:
                  </p>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: VITAL_COLORS.lightGray }}>
                    <input
                      type="checkbox"
                      id="termos"
                      checked={aceitouTermos}
                      onChange={(e) => setAceitouTermos(e.target.checked)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                      style={{ accentColor: VITAL_COLORS.turquoise }}
                    />
                    <label htmlFor="termos" className="text-sm cursor-pointer flex-1">
                      Li e aceito os{" "}
                      <a 
                        href="/termos-de-uso" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                        style={{ color: VITAL_COLORS.turquoise }}
                      >
                        Termos de Uso da Plataforma e/ou Prestadores de Saúde
                      </a>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrarFormulario(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={solicitarParceriaMutation.isPending || uploading}
                    className="flex-1"
                  >
                    {(solicitarParceriaMutation.isPending || uploading) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Solicitação
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-white border-b-4 border-primary overflow-hidden">

        <div className="container relative py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <img src={APP_LOGO} alt="Vital Logo" className="h-24" />
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-primary">
                Venha ser Vital e cresça conosco!
              </h1>
              <p className="text-xl text-muted-foreground">
                Faça parte do ecossistema que está revolucionando a saúde no Vale do Itajaí
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setMostrarFormulario(true)}
                className="text-lg px-8"
              >
                Quero Crescer com a Vital!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="hidden md:block">
              <img 
                src="/parceiros-hero.webp" 
                alt="Família feliz" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary">QUEM SOMOS</h2>
          <p className="text-lg">
            Somos um <strong>provedor de acesso à saúde privada e de qualidade</strong>.
          </p>
          <p className="text-muted-foreground">
            Atuamos no segmento da saúde na região do Vale do Itajaí, com sede em Timbó, SC, 
            e atendemos também cidades vizinhas e dependentes.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">NOSSA HISTÓRIA</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p>
                  A empresa nasceu da visão dos sócios em transformar a experiência de atendimento médico na região.
                </p>
                <p>
                  Iniciamos nossa operação em <strong>julho de 2024</strong>, assumindo a gestão do único 
                  hospital privado da região, o Hospital Censit.
                </p>
                <p>
                  Desde o início, a resposta foi surpreendente: a população demonstrou estar ávida por uma 
                  alternativa que unisse qualidade, rapidez e humanização.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  Foi aí que surgiu o <strong>Cartão Sua Saúde Vital</strong>, uma assinatura de benefícios em saúde, 
                  que oferece acesso a serviços médicos de excelência, estrutura hospitalar de referência e 
                  atendimento pré-hospitalar de suporte básico.
                </p>
                <p>
                  Nossa missão se expandiu: tornamo-nos uma ponte entre o cuidado de qualidade e a população que precisa dele.
                </p>
                <p className="font-semibold text-primary">
                  Mais do que oferecer consultas, entregamos tranquilidade, dignidade e a certeza de que, 
                  quando mais se precisa, haverá um porto seguro disponível.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mantras Vitais */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-primary">MANTRAS</span>{" "}
            <span className="text-muted-foreground">VITAIS</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Esses mantras não são apenas frases bonitas. Eles são lembretes vivos da forma como pensamos, 
            sentimos e agimos dentro e fora da empresa.
          </p>
          <div className="space-y-4">
            {mantras.map((mantra, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="text-lg">{mantra}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Missão e Visão */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-primary mb-4">NOSSA MISSÃO</h3>
                <p className="text-muted-foreground">
                  Proporcionar que filhos, pais e avós <strong>vivam por mais tempo, com qualidade de vida 
                  e com tranquilidade</strong>, sabendo que, quando precisarem, haverá um <strong>porto seguro</strong> esperando por elas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-primary mb-4">VISÃO DE FUTURO</h3>
                <p className="text-muted-foreground">
                  Até 2030 seremos a <strong>maior provedora de acesso à saúde privada</strong> de qualidade em Santa Catarina.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios para o Parceiro */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-muted-foreground">Benefícios</span>{" "}
            <span className="text-primary">para o Parceiro</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <strong>Venha ser Vital!</strong> Juntos, crescemos e transformamos a saúde no Vale do Itajaí
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {beneficios.map((beneficio, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <beneficio.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{beneficio.titulo}</h3>
                <p className="text-muted-foreground text-sm">{beneficio.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => setMostrarFormulario(true)}
            className="text-lg px-8"
          >
            <Handshake className="mr-2 h-5 w-5" />
            Quero Fazer Parte do Ecossistema Vital!
          </Button>
        </div>
      </section>

      {/* Seção Assinaturas Empresariais */}
      <section className="bg-gradient-to-br from-secondary/20 via-secondary/10 to-background py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-secondary shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="text-center space-y-6">
                  <div className="inline-block p-3 bg-secondary/20 rounded-full">
                    <Shield className="h-12 w-12 text-secondary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary">
                    Seja Parceiro + Assinante Empresarial
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Conheça os planos e valores das assinaturas empresariais Vital para sua empresa e funcionários.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 my-8 text-left">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Área Protegida Exclusiva</h3>
                        <p className="text-sm text-muted-foreground">
                          Garanta exclusividade territorial para seu estabelecimento na rede Vital
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Assinaturas para Funcionários</h3>
                        <p className="text-sm text-muted-foreground">
                          Ofereça saúde de qualidade para sua equipe com condições especiais
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Mais Credibilidade</h3>
                        <p className="text-sm text-muted-foreground">
                          Demonstre compromisso oferecendo aos seus colaboradores o mesmo benefício que você oferece aos clientes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Crescimento Conjunto</h3>
                        <p className="text-sm text-muted-foreground">
                          Faça parte de um ecossistema integrado de saúde e proteção no Vale do Itajaí
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <a href="https://www.suasaudevital.com.br/para-empresas" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8">
                        <Wallet className="mr-2 h-5 w-5" />
                        Conheça as Assinaturas Empresariais
                      </Button>
                    </a>
                    
                    <div className="mt-8 pt-6 border-t border-primary/20">
                      <Button 
                        size="lg" 
                        onClick={() => setMostrarFormulario(true)}
                        className="bg-primary text-white hover:bg-primary/90 text-xl px-12 py-6 font-bold shadow-2xl animate-pulse"
                      >
                        <ArrowRight className="mr-3 h-6 w-6" />
                        COMPLETE SEU CADASTRO DE PARCEIRO
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-4">
                      Fale com nossa equipe e descubra como potencializar sua parceria com a Vital
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
