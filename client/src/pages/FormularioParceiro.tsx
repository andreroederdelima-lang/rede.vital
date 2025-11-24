import { useState } from "react";
import { APP_LOGO } from "@/const";
import { MainNav } from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function FormularioParceiro() {
  const [uploading, setUploading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
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
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
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
      setFormSubmitted(true);
      limparFormulario();
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
    if (!nomeResponsavel || !nomeEstabelecimento || !categoria || !endereco || !cidade || !telefone || !whatsappSecretaria || !precoConsulta || !descontoPercentual) {
      toast.error("Preencha todos os campos obrigatórios");
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
      descontoPercentual: parseInt(descontoPercentual),
      logoUrl,
      fotoUrl,
      contatoParceria: contatoParceria || undefined,
      whatsappParceria: whatsappParceria || undefined,
      observacoes: observacoes || undefined,
    });
  };

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainNav />
        <main className="flex-1 container py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-primary mb-4">Solicitação Enviada!</h1>
              <p className="text-muted-foreground mb-8">
                Recebemos sua solicitação de parceria. Nossa equipe entrará em contato em breve para análise e próximos passos.
              </p>
              <Button onClick={() => setFormSubmitted(false)} className="bg-primary hover:bg-primary/90">
                Enviar Nova Solicitação
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNav />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img src={APP_LOGO} alt="Vital Logo" className="h-16" />
            <div>
              <h1 className="text-3xl font-bold text-primary">Cadastro de Parceiro</h1>
              <p className="text-muted-foreground">Preencha o formulário abaixo para se tornar um parceiro Vital</p>
            </div>
          </div>
        </div>

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
                  onChange={(e) => setTelefone(e.target.value)}
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
                  onChange={(e) => setWhatsappSecretaria(e.target.value)}
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
                <Label htmlFor="preco">Preço da Consulta/Serviço *</Label>
                <Input
                  id="preco"
                  value={precoConsulta}
                  onChange={(e) => setPrecoConsulta(e.target.value)}
                  placeholder="Ex: R$ 150,00 ou A combinar"
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
                <Label htmlFor="logo">Logo do Estabelecimento (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-1"
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foto">Foto do Estabelecimento/Profissional (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="flex-1"
                  />
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contatoParceria">Contato para Parceria (opcional)</Label>
                <Input
                  id="contatoParceria"
                  value={contatoParceria}
                  onChange={(e) => setContatoParceria(e.target.value)}
                  placeholder="Nome e telefone para contato comercial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappParceria">WhatsApp para Parceria (opcional)</Label>
                <Input
                  id="whatsappParceria"
                  value={whatsappParceria}
                  onChange={(e) => setWhatsappParceria(e.target.value)}
                  placeholder="(47) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre sua parceria"
                  rows={4}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termos"
                  checked={aceitouTermos}
                  onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
                />
                <label
                  htmlFor="termos"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Aceito os termos de uso e autorizo o compartilhamento das minhas informações na plataforma Vital *
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={uploading || solicitarParceriaMutation.isPending}
              >
                {(uploading || solicitarParceriaMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitação"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
