import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Power, PowerOff, TestTube, ChevronDown, ChevronUp, Copy, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const EVENTOS_DISPONIVEIS = [
  { value: "medico.criado", label: "Médico Criado" },
  { value: "medico.atualizado", label: "Médico Atualizado" },
  { value: "instituicao.criada", label: "Instituição Criada" },
  { value: "instituicao.atualizada", label: "Instituição Atualizada" },
];

export default function WebhooksTab() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [webhookExpandido, setWebhookExpandido] = useState<number | null>(null);
  const [novoWebhook, setNovoWebhook] = useState({
    apiKeyId: 0,
    nome: "",
    url: "",
    eventos: [] as ("medico.criado" | "medico.atualizado" | "instituicao.criada" | "instituicao.atualizada")[],
    maxRetries: 3,
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: webhooks = [], isLoading } = trpc.webhooks.listar.useQuery();
  const { data: apiKeys = [] } = trpc.apiKeys.listar.useQuery();

  // Mutations
  const criarMutation = trpc.webhooks.criar.useMutation({
    onSuccess: () => {
      toast.success("Webhook criado com sucesso!");
      utils.webhooks.listar.invalidate();
      setDialogAberto(false);
      setNovoWebhook({
        apiKeyId: 0,
        nome: "",
        url: "",
        eventos: [],
        maxRetries: 3,
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar webhook: ${error.message}`);
    },
  });

  const toggleMutation = trpc.webhooks.toggle.useMutation({
    onSuccess: () => {
      toast.success("Status do webhook atualizado!");
      utils.webhooks.listar.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deletarMutation = trpc.webhooks.deletar.useMutation({
    onSuccess: () => {
      toast.success("Webhook deletado!");
      utils.webhooks.listar.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const testarMutation = trpc.webhooks.testar.useMutation({
    onSuccess: () => {
      toast.success("Webhook disparado! Verifique os logs.");
      utils.webhooks.listar.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao testar: ${error.message}`);
    },
  });

  const handleCriar = () => {
    if (!novoWebhook.nome || !novoWebhook.url || novoWebhook.apiKeyId === 0 || novoWebhook.eventos.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    criarMutation.mutate(novoWebhook);
  };

  const toggleEvento = (evento: "medico.criado" | "medico.atualizado" | "instituicao.criada" | "instituicao.atualizada") => {
    setNovoWebhook(prev => ({
      ...prev,
      eventos: prev.eventos.includes(evento)
        ? prev.eventos.filter(e => e !== evento)
        : [...prev.eventos, evento]
    }));
  };

  const copiarSecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copiado!");
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando webhooks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1e9d9f]">Webhooks</h2>
          <p className="text-gray-600 mt-1">
            Configure notificações automáticas para sua plataforma externa
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="bg-[#1e9d9f] hover:bg-[#177a7c]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={novoWebhook.nome}
                  onChange={(e) => setNovoWebhook({ ...novoWebhook, nome: e.target.value })}
                  placeholder="Ex: Webhook Produção"
                />
              </div>

              <div>
                <Label>API Key *</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={novoWebhook.apiKeyId}
                  onChange={(e) => setNovoWebhook({ ...novoWebhook, apiKeyId: Number(e.target.value) })}
                >
                  <option value={0}>Selecione uma API Key</option>
                  {apiKeys.filter(k => k.ativa).map(key => (
                    <option key={key.id} value={key.id}>{key.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>URL do Webhook *</Label>
                <Input
                  value={novoWebhook.url}
                  onChange={(e) => setNovoWebhook({ ...novoWebhook, url: e.target.value })}
                  placeholder="https://sua-plataforma.com/webhook"
                />
              </div>

              <div>
                <Label>Eventos * (selecione pelo menos um)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {EVENTOS_DISPONIVEIS.map(evento => (
                    <label key={evento.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novoWebhook.eventos.includes(evento.value as any)}
                        onChange={() => toggleEvento(evento.value as any)}
                        className="rounded"
                      />
                      <span>{evento.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Máximo de Tentativas</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={novoWebhook.maxRetries}
                  onChange={(e) => setNovoWebhook({ ...novoWebhook, maxRetries: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCriar}
                disabled={criarMutation.isPending}
                className="bg-[#1e9d9f] hover:bg-[#177a7c]"
              >
                {criarMutation.isPending ? "Criando..." : "Criar Webhook"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Webhooks */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <p>Nenhum webhook configurado ainda.</p>
            <p className="text-sm mt-2">Crie seu primeiro webhook para receber notificações automáticas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook: any) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              expandido={webhookExpandido === webhook.id}
              onToggleExpand={() => setWebhookExpandido(webhookExpandido === webhook.id ? null : webhook.id)}
              onToggle={(ativo) => toggleMutation.mutate({ id: webhook.id, ativo })}
              onDeletar={() => {
                if (confirm("Tem certeza que deseja deletar este webhook?")) {
                  deletarMutation.mutate(webhook.id);
                }
              }}
              onTestar={() => testarMutation.mutate(webhook.id)}
              onCopiarSecret={copiarSecret}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de Card de Webhook
function WebhookCard({
  webhook,
  expandido,
  onToggleExpand,
  onToggle,
  onDeletar,
  onTestar,
  onCopiarSecret,
}: {
  webhook: any;
  expandido: boolean;
  onToggleExpand: () => void;
  onToggle: (ativo: boolean) => void;
  onDeletar: () => void;
  onTestar: () => void;
  onCopiarSecret: (secret: string) => void;
}) {
  const { data: estatisticas } = trpc.webhooks.estatisticas.useQuery(webhook.id);
  const { data: logs = [] } = trpc.webhooks.logs.useQuery(
    { webhookId: webhook.id, limit: 10 },
    { enabled: expandido }
  );

  const eventos = JSON.parse(webhook.eventos || '[]');

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            <div>
              <CardTitle className="text-lg">{webhook.nome}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{webhook.url}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {webhook.ativo ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Ativo
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                Desativado
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {expandido && (
        <CardContent className="space-y-4">
          {/* Informações */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Eventos</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {eventos.map((evento: string) => (
                  <span key={evento} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {evento}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Secret</p>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-xs bg-white px-2 py-1 rounded border">
                  {webhook.secret?.substring(0, 20)}...
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopiarSecret(webhook.secret)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          {estatisticas && (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Disparos</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.totalDisparos}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.sucessos}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Falhas</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.falhas}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Taxa Sucesso</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.taxaSucesso}%</p>
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Últimos Disparos</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tentativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{log.evento}</TableCell>
                      <TableCell>
                        {log.sucesso ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            {log.statusCode || "Erro"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{log.tentativa}/{webhook.maxRetries}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Ações */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggle(!webhook.ativo)}
            >
              {webhook.ativo ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Desativar
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Ativar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onTestar}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDeletar}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
