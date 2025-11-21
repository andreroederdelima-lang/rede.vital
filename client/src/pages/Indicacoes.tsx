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
  const indicacoesFechadas = minhasIndicacoes.filter((i: any) => i.status === "fechado").length;
  const comissoesPendentes = minhasComissoes.filter((c: any) => c.status === "pendente").length;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e9d9f] mb-2">
            Sistema de Indicações
          </h1>
          <p className="text-muted-foreground">
            Olá, {meuIndicador.nome}! Você está cadastrado como{" "}
            <Badge variant="outline">{meuIndicador.tipo}</Badge>
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIndicacoes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendas Fechadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{indicacoesFechadas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comissoesPendentes}</div>
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
                <DialogTitle>Criar Nova Indicação</DialogTitle>
              </DialogHeader>
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
