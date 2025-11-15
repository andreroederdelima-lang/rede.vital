import { useState } from "react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
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
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { storagePut } from "../../../server/storage";

export default function Parceiros() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados do formulário
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");

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

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setNomeResponsavel("");
    setNomeEstabelecimento("");
    setCategoria("");
    setEndereco("");
    setCidade("");
    setTelefone("");
    setDescontoPercentual("");
    setImagemFile(null);
    setImagemPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeResponsavel || !nomeEstabelecimento || !categoria || !endereco || !cidade || !telefone || !descontoPercentual) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    let imagemUrl: string | undefined;

    // Upload da imagem se fornecida
    if (imagemFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', imagemFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error("Erro no upload");
        
        const data = await response.json();
        imagemUrl = data.url;
      } catch (error) {
        toast.error("Erro ao fazer upload da imagem");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    solicitarParceriaMutation.mutate({
      nomeResponsavel,
      nomeEstabelecimento,
      categoria: categoria as any,
      endereco,
      cidade,
      telefone,
      descontoPercentual: parseInt(descontoPercentual),
      imagemUrl,
    });
  };

  const beneficios = [
    {
      icon: Users,
      titulo: "Mais pacientes, sem custo de captação",
      descricao: "O cliente Vital busca diretamente os serviços da rede, ampliando o fluxo de atendimentos para sua clínica."
    },
    {
      icon: Megaphone,
      titulo: "Divulgação institucional gratuita",
      descricao: "A Vital promove continuamente seus parceiros em campanhas digitais e materiais impressos."
    },
    {
      icon: Shield,
      titulo: "Gestão simplificada e transparente",
      descricao: "A Vital faz a intermediação de agendamentos e pagamentos, oferecendo segurança e controle para o parceiro."
    },
    {
      icon: Building2,
      titulo: "Integração com planos empresariais",
      descricao: "Os colaboradores das empresas conveniadas tornam-se clientes ativos da rede credenciada."
    },
    {
      icon: HeadphonesIcon,
      titulo: "Suporte e relacionamento contínuo",
      descricao: "Nossa equipe acompanha de perto cada parceiro, garantindo alinhamento e fortalecimento da rede."
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <header className="bg-primary text-primary-foreground py-6">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={APP_LOGO} alt="Vital Logo" className="h-12" />
                <div>
                  <h1 className="text-2xl font-bold">Seja Nosso Parceiro</h1>
                  <p className="text-sm opacity-90">Preencha o formulário abaixo</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setMostrarFormulario(false)}>
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
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={categoria} onValueChange={setCategoria} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
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
                  <Label htmlFor="telefone">Telefone de Contato *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(47) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto Oferecido (%) *</Label>
                  <Input
                    id="desconto"
                    type="number"
                    min="0"
                    max="100"
                    value={descontoPercentual}
                    onChange={(e) => setDescontoPercentual(e.target.value)}
                    placeholder="Ex: 10, 15, 20..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem do Estabelecimento (opcional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Foto do estabelecimento, logo ou produto
                  </p>
                  <Input
                    id="imagem"
                    type="file"
                    accept="image/*"
                    onChange={handleImagemChange}
                  />
                  {imagemPreview && (
                    <div className="mt-4">
                      <img src={imagemPreview} alt="Preview" className="max-w-xs rounded-lg border" />
                    </div>
                  )}
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="container relative py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <img src={APP_LOGO} alt="Vital Logo" className="h-16" />
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Seja parte da rede que está transformando o acesso à saúde
              </h1>
              <p className="text-xl opacity-90">
                Parceira de quem cuida com propósito
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setMostrarFormulario(true)}
                className="text-lg px-8"
              >
                Quero ser Parceiro
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
            Mais do que descontos, <strong>Sua Saúde Vital é um ecossistema colaborativo</strong>
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
            Solicitar Parceria Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted mt-12 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Sua Saúde Vital - Todos os direitos reservados</p>
          <p className="mt-1">Atendendo Timbó, Indaial, Pomerode, Rodeio, Benedito Novo, Rio dos Cedros, Apiúna e Ascurra</p>
        </div>
      </footer>
    </div>
  );
}
