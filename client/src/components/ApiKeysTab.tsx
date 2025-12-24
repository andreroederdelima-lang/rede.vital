import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Key, Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function ApiKeysTab() {
  const [novaApiKeyNome, setNovaApiKeyNome] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [apiKeyVisivel, setApiKeyVisivel] = useState<Record<number, boolean>>({});
  const [apiKeyExpandida, setApiKeyExpandida] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: apiKeys, isLoading } = trpc.apiKeys.listar.useQuery();
  const criarMutation = trpc.apiKeys.criar.useMutation({
    onSuccess: () => {
      toast.success("API Key criada com sucesso!");
      utils.apiKeys.listar.invalidate();
      setNovaApiKeyNome("");
      setDialogAberto(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar API Key: ${error.message}`);
    },
  });

  const toggleMutation = trpc.apiKeys.toggle.useMutation({
    onSuccess: () => {
      toast.success("Status da API Key atualizado!");
      utils.apiKeys.listar.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar API Key: ${error.message}`);
    },
  });

  const deletarMutation = trpc.apiKeys.deletar.useMutation({
    onSuccess: () => {
      toast.success("API Key deletada com sucesso!");
      utils.apiKeys.listar.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar API Key: ${error.message}`);
    },
  });

  const { data: logs } = trpc.apiKeys.logs.useQuery(
    { apiKeyId: apiKeyExpandida!, limit: 50 },
    { enabled: apiKeyExpandida !== null }
  );

  const { data: estatisticas } = trpc.apiKeys.estatisticas.useQuery(
    apiKeyExpandida!,
    { enabled: apiKeyExpandida !== null }
  );

  const copiarApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API Key copiada para área de transferência!");
  };

  const toggleVisibilidade = (id: number) => {
    setApiKeyVisivel(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCriar = () => {
    if (!novaApiKeyNome.trim()) {
      toast.error("Por favor, informe um nome para a API Key");
      return;
    }
    criarMutation.mutate({ nome: novaApiKeyNome });
  };

  const handleToggle = (id: number, ativa: boolean) => {
    if (window.confirm(`Deseja ${ativa ? 'desativar' : 'ativar'} esta API Key?`)) {
      toggleMutation.mutate({ id, ativa: !ativa });
    }
  };

  const handleDeletar = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar esta API Key? Esta ação não pode ser desfeita.")) {
      deletarMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de criar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie chaves de API para integração externa
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova API Key</DialogTitle>
              <DialogDescription>
                Informe um nome descritivo para identificar esta API Key
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da API Key</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Plataforma Cartão Benefícios"
                  value={novaApiKeyNome}
                  onChange={(e) => setNovaApiKeyNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCriar();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleCriar}
                disabled={criarMutation.isPending}
                className="w-full"
              >
                {criarMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Criar API Key
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de API Keys */}
      {apiKeys && apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma API Key criada</p>
            <p className="text-sm text-muted-foreground">
              Crie sua primeira API Key para começar a integração
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys?.map((key) => (
            <Card key={key.id} className={apiKeyExpandida === key.id ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{key.nome}</CardTitle>
                      <Badge variant={key.ativa ? "default" : "secondary"}>
                        {key.ativa ? "Ativa" : "Desativada"}
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs">
                      {apiKeyVisivel[key.id] ? key.apiKey : "•".repeat(64)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibilidade(key.id)}
                    >
                      {apiKeyVisivel[key.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copiarApiKey(key.apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(key.id, key.ativa === 1)}
                      disabled={toggleMutation.isPending}
                    >
                      {key.ativa ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletar(key.id)}
                      disabled={deletarMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Requisições</p>
                    <p className="font-medium">{key.requestCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Criada em</p>
                    <p className="font-medium">
                      {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Último uso</p>
                    <p className="font-medium">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString('pt-BR')
                        : "Nunca"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Criada por</p>
                    <p className="font-medium">{key.createdBy || "admin"}</p>
                  </div>
                </div>

                {/* Botão para expandir detalhes */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setApiKeyExpandida(apiKeyExpandida === key.id ? null : key.id)}
                  >
                    {apiKeyExpandida === key.id ? "Ocultar Detalhes" : "Ver Detalhes"}
                  </Button>
                </div>

                {/* Detalhes expandidos */}
                {apiKeyExpandida === key.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {/* Estatísticas */}
                    {estatisticas && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Total de Requisições</CardDescription>
                            <CardTitle className="text-2xl">{estatisticas.totalRequests}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Taxa de Sucesso</CardDescription>
                            <CardTitle className="text-2xl">{estatisticas.successRate}%</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Tempo Médio</CardDescription>
                            <CardTitle className="text-2xl">{estatisticas.avgResponseTime}ms</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Último Uso</CardDescription>
                            <CardTitle className="text-sm">
                              {estatisticas.lastUsed
                                ? new Date(estatisticas.lastUsed).toLocaleString('pt-BR')
                                : "Nunca"}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      </div>
                    )}

                    {/* Logs recentes */}
                    {logs && logs.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Logs Recentes (últimas 50 requisições)</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted sticky top-0">
                                <tr>
                                  <th className="text-left p-2">Data/Hora</th>
                                  <th className="text-left p-2">Endpoint</th>
                                  <th className="text-left p-2">Método</th>
                                  <th className="text-left p-2">Status</th>
                                  <th className="text-left p-2">Tempo (ms)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {logs.map((log) => (
                                  <tr key={log.id} className="border-t">
                                    <td className="p-2">
                                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="p-2 font-mono text-xs">{log.endpoint}</td>
                                    <td className="p-2">
                                      <Badge variant="outline">{log.method}</Badge>
                                    </td>
                                    <td className="p-2">
                                      <Badge
                                        variant={log.statusCode < 400 ? "default" : "destructive"}
                                      >
                                        {log.statusCode}
                                      </Badge>
                                    </td>
                                    <td className="p-2">{log.responseTime}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
