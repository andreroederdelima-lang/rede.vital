import { trpc } from "@/lib/trpc";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

/**
 * Página de estatísticas para vendedores/promotores
 * Mostra métricas de desempenho e indicações
 */
export default function IndicacoesEstatisticas() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: meuIndicador, isLoading: loadingIndicador } = trpc.indicacoes.meuIndicador.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: minhasIndicacoes = [], isLoading: loadingIndicacoes } = trpc.indicacoes.listarIndicacoes.useQuery(
    undefined,
    { enabled: isAuthenticated && !!meuIndicador }
  );

  const { data: minhasComissoes = [], isLoading: loadingComissoes } = trpc.indicacoes.listarComissoes.useQuery(
    undefined,
    { enabled: isAuthenticated && !!meuIndicador }
  );

  if (loading || loadingIndicador) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </PainelVendedorLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Faça login para acessar as estatísticas
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meuIndicador) {
    const AutoCadastroIndicador = require("@/components/AutoCadastroIndicador").default;
    return (
      <PainelVendedorLayout>
        <AutoCadastroIndicador />
      </PainelVendedorLayout>
    );
  }

  // Calcular estatísticas
  const totalIndicacoes = minhasIndicacoes.length;
  const indicacoesPendentes = minhasIndicacoes.filter((i: any) => i.status === "pendente").length;
  const indicacoesContatadas = minhasIndicacoes.filter((i: any) => i.status === "contatado").length;
  const indicacoesFechadas = minhasIndicacoes.filter((i: any) => i.status === "fechado").length;
  const indicacoesCanceladas = minhasIndicacoes.filter((i: any) => i.status === "cancelado").length;

  const totalComissoes = minhasComissoes.reduce((acc: number, c: any) => acc + Number(c.valor || 0), 0);
  const comissoesPagas = minhasComissoes.filter((c: any) => c.status === "pago").length;
  const comissoesPendentes = minhasComissoes.filter((c: any) => c.status === "pendente").length;

  const taxaConversao = totalIndicacoes > 0 
    ? ((indicacoesFechadas / totalIndicacoes) * 100).toFixed(1) 
    : "0.0";

  const stats = [
    {
      title: "Total de Indicações",
      value: totalIndicacoes,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Indicações Fechadas",
      value: indicacoesFechadas,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Em Andamento",
      value: indicacoesPendentes + indicacoesContatadas,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Taxa de Conversão",
      value: `${taxaConversao}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total em Comissões",
      value: `R$ ${totalComissoes.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Comissões Pagas",
      value: comissoesPagas,
      icon: CheckCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <PainelVendedorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estatísticas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu desempenho e resultados
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detalhamento por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento de Indicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">Pendentes</span>
                </div>
                <span className="text-2xl font-bold">{indicacoesPendentes}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">Contatadas</span>
                </div>
                <span className="text-2xl font-bold">{indicacoesContatadas}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Fechadas</span>
                </div>
                <span className="text-2xl font-bold">{indicacoesFechadas}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">Canceladas</span>
                </div>
                <span className="text-2xl font-bold">{indicacoesCanceladas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PainelVendedorLayout>
  );
}
