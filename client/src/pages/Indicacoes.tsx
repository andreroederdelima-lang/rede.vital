import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { TrendingUp, Plus, Users, DollarSign, QrCode, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Indicacoes() {
  const { user, isAuthenticated, loading } = useAuth();
  const [novaIndicacaoOpen, setNovaIndicacaoOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [selectedIndicacao, setSelectedIndicacao] = useState<any>(null);

  // Buscar indicador do usuário atual
  const { data: meuIndicador, isLoading: loadingIndicador } = trpc.indicacoes.meuIndicador.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Buscar indicações do usuário
  const { data: minhasIndicacoes = [], isLoading: loadingIndicacoes } = trpc.indicacoes.listarIndicacoes.useQuery(
    undefined,
    { enabled: isAuthenticated && !!meuIndicador }
  );

  // Buscar comissões
  const { data: minhasComissoes = [], isLoading: loadingComissoes } = trpc.indicacoes.listarComissoes.useQuery(
    undefined,
    { enabled: isAuthenticated && !!meuIndicador }
  );

  const criarIndicacaoMutation = trpc.indicacoes.criarIndicacao.useMutation({
    onSuccess: () => {
      toast.success("Indicação criada com sucesso!");
      setNovaIndicacaoOpen(false);
      // Invalidar queries para atualizar lista
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar indicação");
    },
  });

  const handleNovaIndicacao = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    criarIndicacaoMutation.mutate({
      nomeCliente: formData.get("nomeCliente") as string,
      telefoneCliente: formData.get("telefoneCliente") as string,
      emailCliente: (formData.get("emailCliente") as string) || undefined,
      cidadeCliente: (formData.get("cidadeCliente") as string) || undefined,
      observacoes: (formData.get("observacoes") as string) || undefined,
    });
  };

  const gerarLinkWhatsApp = (telefone: string) => {
    const mensagem = encodeURIComponent("Recebi indicação para conhecer as assinaturas e benefícios da Vital ❤️🚑!");
    const telefoneFormatado = telefone.replace(/\D/g, "");
    return `https://wa.me/55${telefoneFormatado}?text=${mensagem}`;
  };

  const abrirQRCode = (indicacao: any) => {
    setSelectedIndicacao(indicacao);
    setQrCodeOpen(true);
  };

  if (loading || loadingIndicador) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container py-12 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Área Restrita</h1>
          <p className="text-muted-foreground mb-6">
            Faça login para acessar o sistema de indicações
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Fazer Login</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!meuIndicador) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Cadastro Pendente</h1>
          <p className="text-muted-foreground mb-6">
            Você ainda não está cadastrado como promotor ou vendedor. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  const totalIndicacoes = minhasIndicacoes.length;
  const indicacoesPendentes = minhasIndicacoes.filter((i: any) => i.status === "pendente").length;
  const indicacoesContatadas = minhasIndicacoes.filter((i: any) => i.status === "contatado").length;
  const indicacoesFechadas = minhasIndicacoes.filter((i: any) => i.status === "fechado").length;
  const taxaConversao = totalIndicacoes > 0 ? ((indicacoesFechadas / totalIndicacoes) * 100).toFixed(1) : "0.0";
  
  const comissoesPendentes = minhasComissoes.filter((c: any) => c.status === "pendente");
  const comissoesPagas = minhasComissoes.filter((c: any) => c.status === "pago");
  const valorPendente = comissoesPendentes.reduce((sum: number, c: any) => sum + (c.valor || 0), 0);
  const valorPago = comissoesPagas.reduce((sum: number, c: any) => sum + (c.valor || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-6">
          <img 
            src={(meuIndicador as any).fotoUrl || "/medico-padrao.png"} 
            alt={meuIndicador.nome}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#1e9d9f] shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#1e9d9f] mb-2">
              Sistema de Indicações
            </h1>
            <p className="text-muted-foreground">
              Olá, {meuIndicador.nome}! Acompanhe suas indicações e comissões
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalIndicacoes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {indicacoesPendentes} pendentes • {indicacoesContatadas} contatadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendas Fechadas</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{indicacoesFechadas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa de conversão: {taxaConversao}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                R$ {(valorPendente / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {comissoesPendentes.length} comissões aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#1e9d9f]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-5 w-5 text-[#1e9d9f]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1e9d9f]">
                R$ {(valorPago / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {comissoesPagas.length} comissões pagas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Nova Indicação */}
        <div className="mb-6">
          <Dialog open={novaIndicacaoOpen} onOpenChange={setNovaIndicacaoOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e9d9f] hover:bg-[#1a8a8c]">
                <Plus className="h-4 w-4 mr-2" />
                Nova Indicação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Indicação</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Preencha os dados da pessoa que você está indicando às assinaturas Vital
                </p>
              </DialogHeader>

              {/* QR Code para WhatsApp Comercial */}
              <div className="bg-gradient-to-br from-[#1e9d9f]/10 to-[#1e9d9f]/5 rounded-lg p-6 text-center border-2 border-[#1e9d9f]/20">
                <h3 className="font-semibold text-lg mb-2 text-[#1e9d9f]">Ou envie direto para o Comercial</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Escaneie o QR Code para enviar a indicação via WhatsApp
                </p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <QRCodeSVG
                      value="https://wa.me/5547933853726?text=Ol%C3%A1%2C%20recebi%20uma%20indica%C3%A7%C3%A3o%20para%20conhecer%20mais%20sobre%20as%20assinaturas%20Vital"
                      size={200}
                      level="H"
                      fgColor="#1e9d9f"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  📱 Aponte a câmera do celular para o QR Code
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou preencha o formulário</span>
                </div>
              </div>

              <form onSubmit={handleNovaIndicacao} className="space-y-4">
                <div>
                  <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
                  <Input id="nomeCliente" name="nomeCliente" required />
                </div>
                <div>
                  <Label htmlFor="telefoneCliente">Telefone do Cliente *</Label>
                  <Input 
                    id="telefoneCliente" 
                    name="telefoneCliente" 
                    placeholder="(47) 99999-9999"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="emailCliente">Email do Cliente</Label>
                  <Input id="emailCliente" name="emailCliente" type="email" />
                </div>
                <div>
                  <Label htmlFor="cidadeCliente">Cidade</Label>
                  <Input id="cidadeCliente" name="cidadeCliente" />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" name="observacoes" rows={3} />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#1e9d9f] hover:bg-[#1a8a8c]"
                  disabled={criarIndicacaoMutation.isPending}
                >
                  {criarIndicacaoMutation.isPending ? "Criando..." : "Criar Indicação"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Indicações */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Indicações</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingIndicacoes ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : minhasIndicacoes.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhuma indicação cadastrada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {minhasIndicacoes.map((indicacao: any) => (
                  <div
                    key={indicacao.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{indicacao.nomeCliente}</h3>
                        <p className="text-sm text-muted-foreground">
                          {indicacao.telefoneCliente}
                          {indicacao.cidadeCliente && ` • ${indicacao.cidadeCliente}`}
                        </p>
                        {indicacao.observacoes && (
                          <p className="text-sm mt-2">{indicacao.observacoes}</p>
                        )}
                        <div className="mt-2">
                          <Badge
                            variant={
                              indicacao.status === "fechado"
                                ? "default"
                                : indicacao.status === "perdido"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {indicacao.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirQRCode(indicacao)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={gerarLinkWhatsApp(indicacao.telefoneCliente)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog QR Code */}
        <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code para WhatsApp</DialogTitle>
            </DialogHeader>
            {selectedIndicacao && (
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-center text-sm text-muted-foreground">
                  Escaneie este QR Code para iniciar conversa no WhatsApp com:
                </p>
                <p className="font-semibold">{selectedIndicacao.nomeCliente}</p>
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={gerarLinkWhatsApp(selectedIndicacao.telefoneCliente)}
                    size={256}
                    level="H"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Mensagem: "Recebi indicação para conhecer as assinaturas e benefícios da Vital ❤️🚑!"
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
