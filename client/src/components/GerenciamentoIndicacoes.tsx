import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, CheckCircle, Send, AlertCircle, XCircle, RefreshCw, StickyNote, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  em_contato: { label: "Em Contato", color: "bg-blue-500", icon: Send },
  link_enviado: { label: "Link Enviado", color: "bg-purple-500", icon: Send },
  aguardando_cadastro: { label: "Aguardando Cadastro", color: "bg-orange-500", icon: Clock },
  cadastrado: { label: "Cadastrado", color: "bg-green-500", icon: CheckCircle },
  nao_interessado: { label: "Não Interessado", color: "bg-red-500", icon: XCircle },
  retomar_depois: { label: "Retomar Depois", color: "bg-gray-500", icon: RefreshCw },
};

export default function GerenciamentoIndicacoes() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState<any>(null);
  const [novaNota, setNovaNota] = useState("");

  const utils = trpc.useUtils();
  const { data: sugestoes, isLoading } = trpc.sugestao.listar.useQuery();
  const { data: contadores } = trpc.sugestao.contarPorStatus.useQuery();

  const atualizarStatusMutation = trpc.sugestao.atualizarStatus.useMutation({
    onSuccess: () => {
      utils.sugestao.listar.invalidate();
      utils.sugestao.contarPorStatus.invalidate();
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const adicionarNotaMutation = trpc.sugestao.adicionarNota.useMutation({
    onSuccess: () => {
      utils.sugestao.listar.invalidate();
      setNovaNota("");
      setSugestaoSelecionada(null);
      toast.success("Nota adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar nota: " + error.message);
    },
  });

  const handleAtualizarStatus = (id: number, novoStatus: string) => {
    atualizarStatusMutation.mutate({ id, status: novoStatus as any });
  };

  const handleAdicionarNota = () => {
    if (!sugestaoSelecionada || !novaNota.trim()) return;
    adicionarNotaMutation.mutate({
      id: sugestaoSelecionada.id,
      nota: novaNota.trim(),
    });
  };

  const copiarLinkCadastro = () => {
    const link = `${window.location.origin}/cadastro-parceiro`;
    navigator.clipboard.writeText(link);
    toast.success("Link de cadastro copiado!");
  };

  // Filtrar sugestões
  const sugestoesFiltradas = sugestoes?.filter((s: any) => {
    const matchStatus = filtroStatus === "todos" || s.status === filtroStatus;
    const matchBusca = !busca || 
      s.nomeParceiro.toLowerCase().includes(busca.toLowerCase()) ||
      s.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
      s.municipio.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando indicações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Indicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e9d9f]">
              {contadores?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {contadores?.pendente || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {contadores?.em_contato || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Indicações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Indicações</CardTitle>
              <CardDescription>
                Acompanhe e gerencie todas as sugestões de novos parceiros
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copiarLinkCadastro}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Link de Cadastro
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, especialidade ou município..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_contato">Em Contato</SelectItem>
                <SelectItem value="link_enviado">Link Enviado</SelectItem>
                <SelectItem value="aguardando_cadastro">Aguardando Cadastro</SelectItem>
                <SelectItem value="cadastrado">Cadastrado</SelectItem>
                <SelectItem value="nao_interessado">Não Interessado</SelectItem>
                <SelectItem value="retomar_depois">Retomar Depois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {!sugestoesFiltradas || sugestoesFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma indicação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Parceiro</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sugestoesFiltradas.map((sugestao: any) => {
                    const statusConfig = STATUS_CONFIG[sugestao.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <TableRow key={sugestao.id}>
                        <TableCell className="font-medium">
                          {sugestao.nomeParceiro}
                        </TableCell>
                        <TableCell>{sugestao.especialidade}</TableCell>
                        <TableCell>{sugestao.municipio}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusConfig.color} text-white border-0`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(sugestao.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* Botão Alterar Status */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Alterar Status
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Alterar Status</DialogTitle>
                                  <DialogDescription>
                                    {sugestao.nomeParceiro} - {sugestao.especialidade}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <Select
                                    defaultValue={sugestao.status}
                                    onValueChange={(value) => handleAtualizarStatus(sugestao.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                          {config.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Botão Adicionar Nota */}
                            <Dialog
                              open={sugestaoSelecionada?.id === sugestao.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setSugestaoSelecionada(null);
                                  setNovaNota("");
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSugestaoSelecionada(sugestao)}
                                >
                                  <StickyNote className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Notas e Histórico</DialogTitle>
                                  <DialogDescription>
                                    {sugestao.nomeParceiro} - {sugestao.especialidade}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {/* Notas Existentes */}
                                  {sugestao.notas && (
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                      <h4 className="font-medium mb-2">Histórico de Notas:</h4>
                                      <div className="whitespace-pre-wrap text-sm">
                                        {sugestao.notas}
                                      </div>
                                    </div>
                                  )}

                                  {/* Adicionar Nova Nota */}
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Nova Nota:</label>
                                    <Textarea
                                      placeholder="Digite sua nota sobre o contato..."
                                      value={novaNota}
                                      onChange={(e) => setNovaNota(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={handleAdicionarNota}
                                    disabled={!novaNota.trim() || adicionarNotaMutation.isPending}
                                  >
                                    {adicionarNotaMutation.isPending ? "Salvando..." : "Salvar Nota"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
