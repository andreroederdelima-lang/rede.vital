import { useState } from "react";
import { APP_LOGO } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function FormularioParceiro() {
  const [uploading, setUploading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  // Estados do formulário
  const [tipoCredenciado, setTipoCredenciado] = useState<"medico" | "instituicao">("instituicao");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [areaAtuacao, setAreaAtuacao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [precoConsulta, setPrecoConsulta] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");

  const solicitarParceriaMutation = trpc.parceria.solicitar.useMutation({
    onSuccess: () => {
      setSucesso(true);
      toast.success("Solicitação enviada com sucesso!", {
        description: "Entraremos em contato em breve para análise da parceria."
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!nomeResponsavel || !nomeEstabelecimento || !categoria || !endereco || !cidade || !telefone || !whatsapp || !precoConsulta || !descontoPercentual) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    let imagemUrl = "";
    
    // Upload da imagem se houver
    if (imagemFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", imagemFile);
        
        const response = await fetch("/api/upload", {
          method: "POST",
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
      tipoCredenciado,
      nomeResponsavel,
      nomeEstabelecimento,
      categoria,
      especialidade: tipoCredenciado === "medico" ? especialidade : undefined,
      areaAtuacao: tipoCredenciado === "instituicao" ? areaAtuacao : undefined,
      endereco,
      cidade,
      telefone,
      precoConsulta,
      descontoPercentual: parseFloat(descontoPercentual),
      imagemUrl: imagemUrl || undefined,
    });
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e9d9f]/10 to-[#c6bca4]/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1e9d9f] mb-2">
                Solicitação Enviada!
              </h2>
              <p className="text-muted-foreground">
                Recebemos sua solicitação de parceria. Nossa equipe entrará em contato em breve para análise e próximos passos.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-[#1e9d9f] hover:bg-[#178a8c]"
            >
              Voltar para Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e9d9f]/10 to-[#c6bca4]/10">
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container py-6">
          <div className="flex flex-col items-center gap-4">
            <img src={APP_LOGO} alt="Vital Logo" className="h-20" />
            <div className="text-center">
              <h1 className="text-3xl font-bold" style={{ color: '#1e9d9f' }}>
                Cadastro de Parceiro Vital
              </h1>
              <p className="text-muted-foreground mt-2">
                Seja parte deste movimento que está transformando o acesso à saúde privada!
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            <div className="mb-6 p-4 bg-[#1e9d9f]/10 border-l-4 border-[#1e9d9f] rounded">
              <p className="text-[#1e9d9f] font-semibold text-center">
                Preencha com atenção as informações, para que possamos indicar o máximo de clientes possível!
                <br />
                Nosso ecossistema é feito para gerar benefícios ao Parceiro e ao Cliente!
              </p>
            </div>

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
                <Label htmlFor="nomeEstabelecimento">
                  {tipoCredenciado === "medico" ? "Nome do Médico *" : "Nome do Estabelecimento *"}
                </Label>
                <Input
                  id="nomeEstabelecimento"
                  value={nomeEstabelecimento}
                  onChange={(e) => setNomeEstabelecimento(e.target.value)}
                  placeholder={tipoCredenciado === "medico" ? "Dr(a). Nome Completo" : "Nome da clínica, farmácia, etc."}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder={tipoCredenciado === "medico" ? "Ex: Cardiologia, Pediatria" : "Ex: Clínica, Farmácia, Laboratório"}
                  required
                />
              </div>

              {tipoCredenciado === "medico" && (
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade *</Label>
                  <Input
                    id="especialidade"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    placeholder="Ex: Cardiologia, Pediatria, Ortopedia"
                    required
                  />
                </div>
              )}

              {tipoCredenciado === "instituicao" && (
                <div className="space-y-2">
                  <Label htmlFor="areaAtuacao">Área de Atuação</Label>
                  <Input
                    id="areaAtuacao"
                    value={areaAtuacao}
                    onChange={(e) => setAreaAtuacao(e.target.value)}
                    placeholder="Ex: Exames laboratoriais, Medicamentos, Fisioterapia"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo *</Label>
                <Input
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Blumenau, Itajaí, Balneário Camboriú"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(47) 3333-3333"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(47) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precoConsulta">
                    {tipoCredenciado === "medico" ? "Preço da Consulta *" : "Preço Médio dos Serviços *"}
                  </Label>
                  <Input
                    id="precoConsulta"
                    value={precoConsulta}
                    onChange={(e) => setPrecoConsulta(e.target.value)}
                    placeholder="R$ 150,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descontoPercentual">Desconto Oferecido (%) *</Label>
                  <Input
                    id="descontoPercentual"
                    type="number"
                    min="0"
                    max="100"
                    value={descontoPercentual}
                    onChange={(e) => setDescontoPercentual(e.target.value)}
                    placeholder="Ex: 20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagem">Logo ou Foto do Estabelecimento (Opcional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="imagem"
                    type="file"
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="flex-1"
                  />
                  {imagemPreview && (
                    <img src={imagemPreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1e9d9f] hover:bg-[#178a8c] text-lg py-6"
                disabled={uploading || solicitarParceriaMutation.isPending}
              >
                {uploading || solicitarParceriaMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitação de Parceria"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gradient-to-r from-[#1e9d9f] to-[#178a8c] py-8 mt-12">
        <div className="container text-center text-white">
          <p className="text-sm">
            © 2025 Vital - Sua Saúde Vital. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
