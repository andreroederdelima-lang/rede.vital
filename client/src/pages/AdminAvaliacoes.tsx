import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, User, Mail, Phone } from "lucide-react";
import { VITAL_COLORS } from "@shared/colors";
import { toast } from "sonner";

export default function AdminAvaliacoes() {
  const { data: avaliacoes = [], isLoading, refetch } = trpc.avaliacoes.listar.useQuery();
  const { data: stats } = trpc.avaliacoes.estatisticas.useQuery();

  const aprovarMutation = trpc.avaliacoes.aprovar.useMutation({
    onSuccess: () => {
      toast.success("Avaliação aprovada!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao aprovar: " + error.message);
    },
  });

  const rejeitarMutation = trpc.avaliacoes.rejeitar.useMutation({
    onSuccess: () => {
      toast.success("Avaliação rejeitada!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao rejeitar: " + error.message);
    },
  });

  const renderStars = (nota: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <Star
            key={estrela}
            size={16}
            fill={estrela <= nota ? VITAL_COLORS.gold : "transparent"}
            stroke={estrela <= nota ? VITAL_COLORS.gold : VITAL_COLORS.mediumGray}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (aprovada: number) => {
    if (aprovada === 1) {
      return <Badge className="bg-green-500">Aprovada</Badge>;
    } else if (aprovada === -1) {
      return <Badge className="bg-red-500">Rejeitada</Badge>;
    } else {
      return <Badge className="bg-yellow-500">Pendente</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: VITAL_COLORS.turquoise }}>
            Avaliações de Credenciados
          </h1>
          <p className="text-muted-foreground mt-2">
            Feedback dos clientes sobre atendimento e qualidade dos parceiros
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aprovadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.aprovadas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rejeitadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejeitadas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média de Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: VITAL_COLORS.gold }}>
                  {stats.mediaNotas.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando avaliações...</p>
            ) : avaliacoes.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
            ) : (
              <div className="space-y-4">
                {avaliacoes.map((avaliacao: any) => (
                  <Card key={avaliacao.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Cabeçalho */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
                              {avaliacao.nomeCredenciado}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {avaliacao.tipoCredenciado === "medico" ? "Médico" : "Instituição"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(avaliacao.nota)}
                            {getStatusBadge(avaliacao.aprovada)}
                          </div>
                        </div>

                        {/* Comentário */}
                        {avaliacao.comentario && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">{avaliacao.comentario}</p>
                          </div>
                        )}

                        {/* Dados do Avaliador */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {avaliacao.nomeAvaliador && (
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{avaliacao.nomeAvaliador}</span>
                            </div>
                          )}
                          {avaliacao.emailAvaliador && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{avaliacao.emailAvaliador}</span>
                            </div>
                          )}
                          {avaliacao.telefoneAvaliador && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{avaliacao.telefoneAvaliador}</span>
                            </div>
                          )}
                        </div>

                        {/* Data */}
                        <p className="text-xs text-muted-foreground">
                          Recebida em: {new Date(avaliacao.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {/* Botões de Ação (apenas para pendentes) */}
                        {avaliacao.aprovada === 0 && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarMutation.mutate({ id: avaliacao.id })}
                              disabled={aprovarMutation.isPending || rejeitarMutation.isPending}
                              className="flex items-center gap-1"
                              style={{
                                borderColor: VITAL_COLORS.turquoise,
                                color: VITAL_COLORS.turquoise,
                              }}
                            >
                              <ThumbsUp size={14} />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejeitarMutation.mutate({ id: avaliacao.id })}
                              disabled={aprovarMutation.isPending || rejeitarMutation.isPending}
                              className="flex items-center gap-1 border-red-500 text-red-500 hover:bg-red-50"
                            >
                              <ThumbsDown size={14} />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
