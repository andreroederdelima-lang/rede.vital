import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Send, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

export default function AdminNotificacoes() {
  const [enviando, setEnviando] = useState(false);
  
  const { data: desatualizados, isLoading, refetch } = trpc.notificacoes.listarDesatualizados.useQuery();
  const enviarTodasMutation = trpc.notificacoes.enviarTodas.useMutation();
  const enviarIndividualMutation = trpc.notificacoes.enviarIndividual.useMutation();

  const handleEnviarTodas = async () => {
    setEnviando(true);
    try {
      const resultado = await enviarTodasMutation.mutateAsync();
      toast.success(resultado.message);
      refetch();
    } catch (error) {
      toast.error("Erro ao enviar notificações");
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarIndividual = async (tipo: "medico" | "instituicao", id: number, nome: string) => {
    try {
      const resultado = await enviarIndividualMutation.mutateAsync({ tipo, id });
      toast.success(`Notificação enviada para ${nome}`);
      refetch();
    } catch (error) {
      toast.error("Erro ao enviar notificação");
    }
  };

  const calcularMesesDesatualizado = (updatedAt: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(updatedAt).getTime();
    const meses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    return meses;
  };

  const totalDesatualizados = (desatualizados?.medicos.length || 0) + (desatualizados?.instituicoes.length || 0);

  if (isLoading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a7b7b] mb-2">Notificações Semestrais</h1>
        <p className="text-muted-foreground">
          Gerenciar lembretes de atualização de dados para credenciados
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Desatualizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <span className="text-3xl font-bold">{totalDesatualizados}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-8 w-8 text-[#1a7b7b]" />
              <span className="text-3xl font-bold">{desatualizados?.medicos.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Instituições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-8 w-8 text-[#1a7b7b]" />
              <span className="text-3xl font-bold">{desatualizados?.instituicoes.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ação em Massa */}
      {totalDesatualizados > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enviar Notificações em Massa</CardTitle>
            <CardDescription>
              Enviar lembretes de atualização para todos os credenciados desatualizados (+6 meses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleEnviarTodas}
              disabled={enviando}
              className="bg-[#1a7b7b] hover:bg-[#156565]"
            >
              <Send className="mr-2 h-4 w-4" />
              {enviando ? "Enviando..." : `Enviar ${totalDesatualizados} Notificações`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de Médicos Desatualizados */}
      {desatualizados && desatualizados.medicos.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Médicos Desatualizados</CardTitle>
            <CardDescription>Médicos que não atualizam dados há mais de 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {desatualizados.medicos.map((medico) => (
                <div
                  key={medico.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{medico.nome}</h3>
                    <p className="text-sm text-muted-foreground">{medico.especialidade}</p>
                    <p className="text-sm text-muted-foreground">{medico.municipio}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Última atualização: {new Date(medico.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {calcularMesesDesatualizado(medico.updatedAt)} meses
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnviarIndividual("medico", medico.id, medico.nome)}
                    disabled={enviarIndividualMutation.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Lembrete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Instituições Desatualizadas */}
      {desatualizados && desatualizados.instituicoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Instituições Desatualizadas</CardTitle>
            <CardDescription>Instituições que não atualizam dados há mais de 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {desatualizados.instituicoes.map((instituicao) => (
                <div
                  key={instituicao.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{instituicao.nome}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{instituicao.categoria}</p>
                    <p className="text-sm text-muted-foreground">{instituicao.municipio}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Última atualização: {new Date(instituicao.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {calcularMesesDesatualizado(instituicao.updatedAt)} meses
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnviarIndividual("instituicao", instituicao.id, instituicao.nome)}
                    disabled={enviarIndividualMutation.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Lembrete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há desatualizados */}
      {totalDesatualizados === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tudo em dia!</h3>
              <p className="text-muted-foreground">
                Nenhum credenciado precisa de lembrete de atualização no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
