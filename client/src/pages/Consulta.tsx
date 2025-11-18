import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Percent, User, Building2, Search, X, MessageCircle, FileDown, FileText, Handshake, Wallet, Users, Share2, Copy, Lock } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Consulta() {
  const [busca, setBusca] = useState("");
  const [especialidade, setEspecialidade] = useState<string>("");
  const [municipio, setMunicipio] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  // Removido filtro de desconto para consulta pública
  const [tipoCredenciado, setTipoCredenciado] = useState<"medicos" | "instituicoes">("medicos");

  const { data: medicos = [], isLoading: loadingMedicos } = trpc.medicos.listar.useQuery({
    busca: busca || undefined,
    especialidade: especialidade || undefined,
    municipio: municipio || undefined,
    // descontoMinimo removido
  }, { enabled: tipoCredenciado === "medicos" });

  const { data: instituicoes = [], isLoading: loadingInstituicoes } = trpc.instituicoes.listar.useQuery({
    busca: busca || undefined,
    categoria: categoria || undefined,
    municipio: municipio || undefined,
    // descontoMinimo removido
  }, { enabled: tipoCredenciado === "instituicoes" });

  const { data: especialidades = [] } = trpc.medicos.listarEspecialidades.useQuery();
  const { data: municipios = [] } = trpc.municipios.listar.useQuery();

  const limparFiltros = () => {
    setBusca("");
    setEspecialidade("");
    setMunicipio("");
    setCategoria("");
    // setDescontoMinimo removido
  };

  const filtrosAtivos = useMemo(() => {
    return !!(busca || especialidade || municipio || categoria);
  }, [busca, especialidade, municipio, categoria]);

  /* Função de exportar PDF removida para consulta pública
  const exportarParaPDF = () => {
    const dados = tipoCredenciado === "medicos" ? medicos : instituicoes;
    const tipo = tipoCredenciado === "medicos" ? "Médicos" : "Instituições";
    
    // Criar conteúdo HTML para impressão
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Lista de Credenciados - ${tipo}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: Arial, sans-serif; font-size: 10pt; }
          h1 { color: #2d7a7a; text-align: center; margin-bottom: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .item { margin-bottom: 15px; page-break-inside: avoid; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .nome { font-weight: bold; font-size: 12pt; color: #2d7a7a; }
          .info { margin: 5px 0; }
          .badge { display: inline-block; padding: 2px 8px; background: #e0e0e0; border-radius: 4px; font-size: 9pt; margin-right: 5px; }
          .desconto { background: #d4af37; color: white; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Guia de Parceiros Vital - Vale do Itajaí</h1>
          <p><strong>${tipo} Credenciados</strong></p>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
    `;

    if (tipoCredenciado === "medicos") {
      medicos.forEach((medico: any) => {
        html += `
          <div class="item">
            <div class="nome">${medico.nome}</div>
            <div class="info"><strong>Especialidade:</strong> ${medico.especialidade}${medico.subespecialidade ? ` • ${medico.subespecialidade}` : ''}</div>
            <div class="info"><strong>Município:</strong> ${medico.municipio}</div>
            <div class="info"><strong>Endereço:</strong> ${medico.endereco}</div>
            ${medico.telefone || medico.whatsapp ? `<div class="info"><strong>Telefone:</strong> ${medico.telefone || medico.whatsapp}</div>` : ''}
            <div class="info">
              <span class="badge">${medico.tipoAtendimento === 'presencial' ? 'Presencial' : medico.tipoAtendimento === 'telemedicina' ? 'Telemedicina' : 'Presencial e Telemedicina'}</span>
              
            </div>
            ${medico.observacoes ? `<div class="info"><em>${medico.observacoes}</em></div>` : ''}
          </div>
        `;
      });
    } else {
      instituicoes.forEach((inst: any) => {
        html += `
          <div class="item">
            <div class="nome">${inst.nome}</div>
            <div class="info"><strong>Categoria:</strong> ${inst.categoria.charAt(0).toUpperCase() + inst.categoria.slice(1)}</div>
            <div class="info"><strong>Município:</strong> ${inst.municipio}</div>
            <div class="info"><strong>Endereço:</strong> ${inst.endereco}</div>
            ${inst.telefone ? `<div class="info"><strong>Telefone:</strong> ${inst.telefone}</div>` : ''}
            ${inst.email ? `<div class="info"><strong>E-mail:</strong> ${inst.email}</div>` : ''}
            
            ${inst.observacoes ? `<div class="info"><em>${inst.observacoes}</em></div>` : ''}
          </div>
        `;
      });
    }

    html += `
        <div style="margin-top: 30px; text-align: center; font-size: 9pt; color: #666;">
          <p>© 2025 Sua Saúde Vital - Todos os direitos reservados</p>
          <p>Atendendo Timbó, Indaial, Pomerode, Rodeio, Benedito Novo, Rio dos Cedros, Apiúna e Ascurra</p>
        </div>
      </body>
      </html>
    `;

    // Abrir janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };
  */



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b-4 border-primary shadow-sm">
        <div className="container py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <img src={APP_LOGO} alt="Vital Logo" className="h-20 md:h-32 w-auto" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-primary">Guia de Parceiros Vital - Vale do Itajaí</h1>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Rede credenciada para encaminhamentos e orientações médicas
                </p>
                <p className="text-xs text-primary/80 mt-2 font-medium">
                  Para acessar a Busca de Parceiros a nível Nacional - acesse sua área do cliente (+34.100 farmácias | +3.100 médicos, clínicas e hospitais | +350 laboratórios).
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-end w-full lg:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Building2 className="h-5 w-5 mr-2" />
                    Sugerir um Parceiro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Sugestão de Parceiro</DialogTitle>
                  </DialogHeader>
                  <SugestaoParceiro />
                </DialogContent>
              </Dialog>
              <a 
                href={`${formatWhatsAppLink("+5547933853726")}?text=${encodeURIComponent("Olá! Gostaria de falar com um especialista sobre os credenciados Vital.")}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Fale Conosco
                </Button>
              </a>
              <Link href="/dados-internos">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <Lock className="h-5 w-5 mr-2" />
                  Acesso Interno
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Tabs: Médicos / Instituições */}
        <Tabs value={tipoCredenciado} onValueChange={(v) => {
          setTipoCredenciado(v as "medicos" | "instituicoes");
          limparFiltros();
        }} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="medicos" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Médicos
            </TabsTrigger>
            <TabsTrigger value="instituicoes" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Instituições
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Busca e Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Credenciados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de busca global */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tipoCredenciado === "medicos" 
                  ? "Buscar por nome do médico, especialidade ou clínica..." 
                  : "Buscar por nome, setor (Pet Shop, Jiu-jitsu, etc) ou endereço..."}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tipoCredenciado === "medicos" ? (
                <Select value={especialidade || "all"} onValueChange={(v) => setEspecialidade(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as especialidades</SelectItem>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={categoria || "all"} onValueChange={(v) => setCategoria(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="clinica">Clínica</SelectItem>
                    <SelectItem value="farmacia">Farmácia</SelectItem>
                    <SelectItem value="laboratorio">Laboratório</SelectItem>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={municipio || "all"} onValueChange={(v) => setMunicipio(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os municípios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os municípios</SelectItem>
                  {municipios.map((mun) => (
                    <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                  ))}
                </SelectContent>
              </Select>


            </div>

            {filtrosAtivos && (
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        {tipoCredenciado === "medicos" ? (
          <div className="space-y-4">
            {loadingMedicos ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando...
              </div>
            ) : medicos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum médico encontrado com os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              medicos.map((medico) => (
                <Card key={medico.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-primary">{medico.nome}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {medico.especialidade}
                            {medico.subespecialidade && ` • ${medico.subespecialidade}`}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {medico.municipio}
                          </Badge>
                          <Badge variant="outline">
                            {medico.tipoAtendimento === "presencial" ? "Presencial" :
                             medico.tipoAtendimento === "telemedicina" ? "Telemedicina" : "Presencial e Telemedicina"}
                          </Badge>

                        </div>

                        <div className="text-sm space-y-1">
                          <p className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span>{medico.endereco}</span>
                          </p>
                          {(medico.telefone || medico.whatsapp) && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{medico.telefone || medico.whatsapp}</span>
                              {medico.whatsapp && (
                                <a
                                  href={formatWhatsAppLink(medico.whatsapp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  Fale com o vendedor
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {medico.observacoes && (
                          <p className="text-sm text-muted-foreground italic">
                            {medico.observacoes}
                          </p>
                        )}

                        {medico.contatoParceria && (
                          <p className="text-xs text-muted-foreground">
                            Parceria: {medico.contatoParceria}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const mensagem = `*${medico.nome}*\n\n` +
                              `Especialidade: ${medico.especialidade}${medico.subespecialidade ? ` • ${medico.subespecialidade}` : ''}\n` +
                              `Município: ${medico.municipio}\n` +
                              `Endereço: ${medico.endereco}\n` +
                              `${medico.telefone || medico.whatsapp ? `Telefone: ${medico.telefone || medico.whatsapp}\n` : ''}` +
                              `Atendimento: ${medico.tipoAtendimento === 'presencial' ? 'Presencial' : medico.tipoAtendimento === 'telemedicina' ? 'Telemedicina' : 'Presencial e Telemedicina'}\n\n` +
                              `💚 *Vital, sempre ao seu lado* 💚\n` +
                              `Credenciado Vital - Guia de Parceiros Vital - Vale do Itajaí`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/?medico=${medico.id}`;
                            navigator.clipboard.writeText(url).then(() => {
                              toast.success('Link copiado com sucesso!');
                            }).catch(() => {
                              toast.error('Erro ao copiar link');
                            });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loadingInstituicoes ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando...
              </div>
            ) : instituicoes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma instituição encontrada com os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              instituicoes.map((inst) => (
                <Card key={inst.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-primary">{inst.nome}</h3>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {inst.categoria}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {inst.municipio}
                          </Badge>

                        </div>

                        <div className="text-sm space-y-1">
                          <p className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span>{inst.endereco}</span>
                          </p>
                          {inst.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{inst.telefone}</span>
                              <a
                                href={formatWhatsAppLink(inst.telefone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <MessageCircle className="h-3 w-3" />
                                Fale com o vendedor
                              </a>
                            </div>
                          )}
                          {inst.email && (
                            <p className="text-sm">
                              Email: {inst.email}
                            </p>
                          )}
                        </div>

                        {inst.observacoes && (
                          <p className="text-sm text-muted-foreground italic">
                            {inst.observacoes}
                          </p>
                        )}

                        {inst.contatoParceria && (
                          <p className="text-xs text-muted-foreground">
                            Parceria: {inst.contatoParceria}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const mensagem = `*${inst.nome}*\n\n` +
                              `Categoria: ${inst.categoria}\n` +
                              `Município: ${inst.municipio}\n` +
                              `Endereço: ${inst.endereco}\n` +
                              `${inst.telefone ? `Telefone: ${inst.telefone}\n` : ''}` +
                              `${inst.email ? `Email: ${inst.email}\n` : ''}\n` +
                              `💚 *Vital, sempre ao seu lado* 💚\n` +
                              `Credenciado Vital - Guia de Parceiros Vital - Vale do Itajaí`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/?instituicao=${inst.id}`;
                            navigator.clipboard.writeText(url).then(() => {
                              toast.success('Link copiado com sucesso!');
                            }).catch(() => {
                              toast.error('Erro ao copiar link');
                            });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>



      {/* Rodapé removido da página de consulta pública */}

    </div>
  );
}

// Componente de sugestão de parceiro
function SugestaoParceiro() {
  const [nomeParceiro, setNomeParceiro] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [municipio, setMunicipio] = useState("");
  
  const sugestaoMutation = trpc.sugestao.enviarSugestaoParceiro.useMutation({
    onSuccess: () => {
      toast.success("Sugest\u00e3o enviada com sucesso!", {
        description: "Obrigado por contribuir com nossa rede"
      });
      setNomeParceiro("");
      setEspecialidade("");
      setMunicipio("");
    },
    onError: (error) => {
      toast.error("Erro ao enviar sugestão", {
        description: error.message
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sugestaoMutation.mutate({
      nomeParceiro,
      especialidade,
      municipio,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeParceiro">Nome do Parceiro *</Label>
        <Input
          id="nomeParceiro"
          value={nomeParceiro}
          onChange={(e) => setNomeParceiro(e.target.value)}
          placeholder="Nome do profissional ou estabelecimento"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="especialidade">Especialidade/Categoria *</Label>
        <Input
          id="especialidade"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          placeholder="Ex: Cardiologia, Farmácia, Laboratório..."
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="municipio">Município *</Label>
        <Input
          id="municipio"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          placeholder="Ex: Timbó, Indaial, Pomerode..."
          required
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={sugestaoMutation.isPending}
          className="w-full"
        >
          {sugestaoMutation.isPending ? "Enviando..." : "Enviar Sugestão"}
        </Button>
      </div>
    </form>
  );
}
