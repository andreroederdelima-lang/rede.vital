import { trpc } from "@/lib/trpc";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

/**
 * Página de comissões para vendedores/promotores
 * Mostra histórico de comissões e valores a receber
 */
export default function IndicacoesComissoes() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: meuIndicador, isLoading: loadingIndicador } = trpc.indicacoes.meuIndicador.useQuery(
    undefined,
    { enabled: isAuthenticated }
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
              Faça login para acessar suas comissões
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
    return (
      <PainelVendedorLayout>
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você ainda não está cadastrado como promotor ou vendedor.
            </p>
          </CardContent>
        </Card>
      </PainelVendedorLayout>
    );
  }

  // Calcular totais
  const totalComissoes = minhasComissoes.reduce((acc: number, c: any) => acc + Number(c.valor || 0), 0);
  const comissoesPagas = minhasComissoes
    .filter((c: any) => c.status === "pago")
    .reduce((acc: number, c: any) => acc + Number(c.valor || 0), 0);
  const comissoesPendentes = minhasComissoes
    .filter((c: any) => c.status === "pendente")
    .reduce((acc: number, c: any) => acc + Number(c.valor || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <PainelVendedorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comissões</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seus ganhos e pagamentos
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Acumulado
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    R$ {totalComissoes.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Já Recebido
                  </p>
                  <p className="text-3xl font-bold mt-2 text-green-600">
                    R$ {comissoesPagas.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    A Receber
                  </p>
                  <p className="text-3xl font-bold mt-2 text-yellow-600">
                    R$ {comissoesPendentes.toFixed(2)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Comissões */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingComissoes ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : minhasComissoes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma comissão registrada ainda
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minhasComissoes.map((comissao: any) => (
                      <TableRow key={comissao.id}>
                        <TableCell>{formatDate(comissao.dataGeracao)}</TableCell>
                        <TableCell className="font-medium">
                          {comissao.indicacao?.nomeCliente || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {meuIndicador.tipo === "promotor" ? "Promotor" : "Vendedor"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          R$ {Number(comissao.valor || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(comissao.status)}</TableCell>
                        <TableCell>
                          {comissao.dataPagamento ? formatDate(comissao.dataPagamento) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Pagamento */}
        {meuIndicador.pix && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Chave PIX Cadastrada
                  </h3>
                  <p className="text-sm text-blue-700">
                    Suas comissões serão pagas via PIX para: <strong>{meuIndicador.pix}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Para alterar sua chave PIX, entre em contato com o administrador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PainelVendedorLayout>
  );
}
