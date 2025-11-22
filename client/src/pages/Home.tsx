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
import { Phone, MapPin, Percent, User, Building2, Search, X, MessageCircle, FileDown, FileText, Handshake, Wallet, Users, Share2, Copy, Globe, Link2, Home as HomeIcon, TrendingUp } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";
import { useDadosInternosAuth } from "@/hooks/useDadosInternosAuth";

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, logout } = useDadosInternosAuth();
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Redireciona para login
  }

  const [busca, setBusca] = useState("");
  const [especialidade, setEspecialidade] = useState<string>("");
  const [municipio, setMunicipio] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [descontoMinimo, setDescontoMinimo] = useState<number | undefined>();
  const [tipoCredenciado, setTipoCredenciado] = useState<"medicos" | "servicos_saude" | "outros_servicos">("medicos");
  const [encaminhamentoDialog, setEncaminhamentoDialog] = useState(false);
  const [medicoSelecionado, setMedicoSelecionado] = useState<any>(null);
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState<any>(null);
  const [motivoEncaminhamento, setMotivoEncaminhamento] = useState("");

  const { data: medicos = [], isLoading: loadingMedicos } = trpc.medicos.listar.useQuery({
    busca: busca || undefined,
    especialidade: especialidade || undefined,
    municipio: municipio || undefined,
    descontoMinimo,
  }, { enabled: tipoCredenciado === "medicos" });

  const { data: instituicoes = [], isLoading: loadingInstituicoes } = trpc.instituicoes.listar.useQuery({
    busca: busca || undefined,
    categoria: categoria || undefined,
    municipio: municipio || undefined,
    descontoMinimo,
    tipoServico: tipoCredenciado === "servicos_saude" || tipoCredenciado === "outros_servicos" ? tipoCredenciado : undefined,
  }, { enabled: tipoCredenciado === "servicos_saude" || tipoCredenciado === "outros_servicos" });

  const { data: especialidades = [] } = trpc.medicos.listarEspecialidades.useQuery();
  const { data: municipios = [] } = trpc.municipios.listar.useQuery();

  const gerarLinkMutation = trpc.atualizacao.gerarLink.useMutation({
    onSuccess: async (data) => {
      const link = `${window.location.origin}/atualizar-dados/${data.token}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado! Envie para o parceiro atualizar os dados.');
    },
    onError: () => {
      toast.error('Erro ao gerar link de atualização');
    }
  });

  const limparFiltros = () => {
    setBusca("");
    setEspecialidade("");
    setMunicipio("");
    setCategoria("");
    setDescontoMinimo(undefined);
  };

  const filtrosAtivos = useMemo(() => {
    return !!(busca || especialidade || municipio || categoria || descontoMinimo);
  }, [busca, especialidade, municipio, categoria, descontoMinimo]);

  const exportarParaPDF = () => {
    const dados = tipoCredenciado === "medicos" ? medicos : instituicoes;
    const tipo = tipoCredenciado === "medicos" ? "Médicos" : (tipoCredenciado === "servicos_saude" ? "Serviços de Saúde" : "Outros Serviços");
    
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
              ${medico.descontoPercentual > 0 ? `<span class="badge desconto">${medico.descontoPercentual}% desconto</span>` : ''}
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
            ${inst.descontoPercentual > 0 ? `<div class="info"><span class="badge desconto">${inst.descontoPercentual}% desconto</span></div>` : ''}
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

  const gerarEncaminhamento = () => {
    if (!medicoSelecionado || !motivoEncaminhamento.trim()) {
      alert("Por favor, preencha o motivo do encaminhamento.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Encaminhamento Médico</title>
        <style>
          @page { size: A4; margin: 3cm; }
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2d7a7a; padding-bottom: 20px; }
          .header h1 { color: #2d7a7a; margin: 0; font-size: 20pt; }
          .header p { margin: 5px 0; color: #666; }
          .content { margin: 30px 0; }
          .field { margin: 20px 0; }
          .field label { font-weight: bold; color: #2d7a7a; display: block; margin-bottom: 5px; }
          .field .value { border-bottom: 1px solid #333; padding: 5px 0; min-height: 25px; }
          .motivo { margin-top: 30px; }
          .motivo .value { border: 1px solid #333; padding: 15px; min-height: 150px; border-radius: 4px; }
          .footer { margin-top: 60px; text-align: center; font-style: italic; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ENCAMINHAMENTO MÉDICO</h1>
          <p>Ambulatório - Hospital Censit</p>
          <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="content">
          <div class="field">
            <label>Especialista:</label>
            <div class="value">${medicoSelecionado.nome} - ${medicoSelecionado.especialidade}${medicoSelecionado.subespecialidade ? ` / ${medicoSelecionado.subespecialidade}` : ''}</div>
          </div>
          
          <div class="field">
            <label>Telefone da clínica (somente fixo):</label>
            <div class="value">${medicoSelecionado.telefone || '_______________________'}</div>
          </div>
          
          <div class="field">
            <label>Endereço:</label>
            <div class="value">${medicoSelecionado.endereco}</div>
          </div>
          
          <div class="field">
            <label>Cidade:</label>
            <div class="value">${medicoSelecionado.municipio}</div>
          </div>
          
          <div class="motivo">
            <label>Motivo do encaminhamento:</label>
            <div class="value">${motivoEncaminhamento.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Agradecemos a parceria no cuidado ao paciente.</p>
          <p><strong>Ambulatório - Hospital Censit</strong></p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    // Limpar e fechar diálogo
    setMotivoEncaminhamento("");
    setEncaminhamentoDialog(false);
  };

  // Mostrar loading enquanto verifica autenticação e acesso
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }



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
                <p className="text-muted-foreground text-xs md:text-sm mt-1 text-center">
                  Guia de uso interno para consultas e informações. Conteúdo sigiloso.
                </p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
              {/* Informações do usuário */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Usuário Interno</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={logout}
                className="border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 w-full lg:w-auto mt-3 lg:mt-0">
              <Link href="/" className="flex-1 sm:flex-none">
                <Button size="sm" className="bg-primary text-white hover:bg-primary/90 w-full sm:w-auto">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  <span className="text-xs md:text-sm">Área do Cliente</span>
                </Button>
              </Link>
              <Link href="/indicacoes" className="flex-1 sm:flex-none">
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="text-xs md:text-sm">Indicações</span>
                </Button>
              </Link>
              <Link href="/cadastro-indicador" className="flex-1 sm:flex-none">
                <Button size="sm" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white w-full sm:w-auto">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="text-xs md:text-sm">Seja Parceiro</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Tabs: Médicos / Clínicas */}
        <Tabs value={tipoCredenciado} onValueChange={(v) => {
          setTipoCredenciado(v as "medicos" | "servicos_saude" | "outros_servicos");
          limparFiltros();
        }} className="mb-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="medicos" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Médicos
            </TabsTrigger>
            <TabsTrigger value="servicos_saude" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Serviços de Saúde
            </TabsTrigger>
            <TabsTrigger value="outros_servicos" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Outros Serviços
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
                  : tipoCredenciado === "servicos_saude"
                  ? "Buscar por nome (Fisioterapia, Laboratório, Farmácia, Clínica...)" 
                  : "Buscar por nome (Academia, Padaria, Mercado, Hotel, Pet Shop...)"}
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
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                    <SelectItem value="psicologia">Psicologia</SelectItem>
                    <SelectItem value="odontologia">Odontologia</SelectItem>
                    <SelectItem value="nutricao">Nutrição</SelectItem>
                    <SelectItem value="exames_imagem">Exames de Imagem</SelectItem>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="otica">Ótica</SelectItem>
                    <SelectItem value="home_care">Home Care</SelectItem>
                    <SelectItem value="estetica">Estética</SelectItem>
                    <SelectItem value="pilates">Pilates</SelectItem>
                    <SelectItem value="podologia">Podologia</SelectItem>
                    <SelectItem value="fonoaudiologia">Fonoaudiologia</SelectItem>
                    <SelectItem value="terapia_ocupacional">Terapia Ocupacional</SelectItem>
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
                      <div className="flex-shrink-0">
                        <img 
                          src={(medico as any).fotoUrl || "/medico-padrao.png"} 
                          alt={medico.nome}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </div>
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
                                  WhatsApp
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

                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {(medico as any).precoConsulta || "Não informado"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {(medico as any).descontoPercentual || 0}% desconto Vital
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setMedicoSelecionado(medico);
                            setEncaminhamentoDialog(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Gerar Encaminhamento
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            gerarLinkMutation.mutate({
                              tipo: 'medico',
                              id: medico.id
                            });
                          }}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Enviar Link de Atualização
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
                  Nenhuma clínica encontrada com os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              instituicoes.map((inst) => (
                <Card key={inst.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={(inst as any).fotoUrl || "/medico-padrao.png"} 
                          alt={inst.nome}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </div>
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
                                WhatsApp
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

                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {(inst as any).precoConsulta || "Não informado"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {(inst as any).descontoPercentual || 0}% desconto Vital
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setInstituicaoSelecionada(inst);
                            setEncaminhamentoDialog(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Gerar Encaminhamento
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            gerarLinkMutation.mutate({
                              tipo: 'instituicao',
                              id: inst.id
                            });
                          }}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Enviar Link de Atualização
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

      {/* Diálogo de Encaminhamento Médico */}
      <Dialog open={encaminhamentoDialog} onOpenChange={setEncaminhamentoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Encaminhamento Médico</DialogTitle>
          </DialogHeader>
          
          {medicoSelecionado && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Especialista:</strong> {medicoSelecionado.nome}</p>
                <p><strong>Especialidade:</strong> {medicoSelecionado.especialidade}
                  {medicoSelecionado.subespecialidade && ` / ${medicoSelecionado.subespecialidade}`}
                </p>
                <p><strong>Telefone:</strong> {medicoSelecionado.telefone || "Não informado"}</p>
                <p><strong>Endereço:</strong> {medicoSelecionado.endereco}</p>
                <p><strong>Cidade:</strong> {medicoSelecionado.municipio}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo do encaminhamento *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Descreva o motivo do encaminhamento..."
                  value={motivoEncaminhamento}
                  onChange={(e) => setMotivoEncaminhamento(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEncaminhamentoDialog(false);
                    setMotivoEncaminhamento("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={gerarEncaminhamento}>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar e Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rodapé com botão Exportar PDF */}
      <footer className="container py-8 border-t mt-8">
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={exportarParaPDF} 
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <FileDown className="h-5 w-5 mr-2" />
            Exportar Lista de Credenciados em PDF
          </Button>
        </div>
      </footer>

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
