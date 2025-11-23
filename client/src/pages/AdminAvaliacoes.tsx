import { trpc } from "@/lib/trpc";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, Mail, Phone } from "lucide-react";
import { VITAL_COLORS } from "@shared/colors";

export default function AdminAvaliacoes() {
  const { data: avaliacoes = [], isLoading } = trpc.avaliacoes.listar.useQuery();
  const { data: stats } = trpc.avaliacoes.estatisticas.useQuery();

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Avaliações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média de Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold" style={{ color: VITAL_COLORS.gold }}>
                    {stats.media.toFixed(1)}
                  </div>
                  <Star size={20} fill={VITAL_COLORS.gold} stroke={VITAL_COLORS.gold} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avaliações Positivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {avaliacoes.filter((a: any) => a.nota >= 4).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">4-5 estrelas</p>
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
                            <Badge variant="outline">
                              {avaliacao.tipoCredenciado === "medico" ? "Médico" : "Instituição"}
                            </Badge>
                          </div>
                          {renderStars(avaliacao.nota)}
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
