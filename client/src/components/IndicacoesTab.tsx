import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, QrCode } from "lucide-react";

/**
 * Componente da aba Indicações no painel Admin
 * Gerencia listagem, filtros, estatísticas e ações sobre indicações
 */
export default function IndicacoesTab() {
  const [filtros, setFiltros] = useState({
    status: "",
    vendedorId: "",
    dataInicio: "",
    dataFim: "",
  });

  // Queries tRPC
  const { data: indicacoes, isLoading: loadingIndicacoes } =
    trpc.indicacoes.listarTodasAdmin.useQuery();
  
  const { data: estatisticas, isLoading: loadingEstatisticas } =
    trpc.indicacoes.estatisticas.useQuery();

  const { data: indicadores } = trpc.indicacoes.listarIndicadores.useQuery();

  // Mutations
  const utils = trpc.useUtils();
  const atualizarIndicacao = trpc.indicacoes.atualizarIndicacao.useMutation({
    onSuccess: () => {
      toast.success("Indicação atualizada com sucesso!");
      utils.indicacoes.listarTodasAdmin.invalidate();
      utils.indicacoes.estatisticas.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar indicação: ${error.message}`);
    },
  });

  const handleAtualizarStatus = (indicacaoId: number, novoStatus: string) => {
    atualizarIndicacao.mutate({
      id: indicacaoId,
      status: novoStatus as any,
    });
  };

  // Filtrar indicações localmente
  const indicacoesFiltradas = indicacoes?.filter((ind: any) => {
    if (filtros.status && ind.status !== filtros.status) return false;
    if (filtros.vendedorId && ind.vendedorId?.toString() !== filtros.vendedorId)
      return false;
    if (filtros.dataInicio && ind.createdAt < new Date(filtros.dataInicio))
      return false;
    if (filtros.dataFim && ind.createdAt > new Date(filtros.dataFim))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Indicações</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/qr-codes', '_blank')}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Baixar QR Codes
          </Button>
          <Button onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
            Cadastrar Promotor/Vendedor
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEstatisticas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {estatisticas?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de Indicações
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {estatisticas?.pendentes || 0}
                </div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {estatisticas?.fechadas || 0}
                </div>
                <div className="text-sm text-muted-foreground">Fechadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {estatisticas?.taxaConversao
                    ? `${estatisticas.taxaConversao.toFixed(1)}%`
                    : "0%"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Taxa de Conversão
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={filtros.status}
                onChange={(e) =>
                  setFiltros({ ...filtros, status: e.target.value })
                }
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="contatado">Contatado</option>
                <option value="em_negociacao">Em Negociação</option>
                <option value="lead_com_resistencia">Lead com Resistência</option>
                <option value="lead_frio">Lead Frio</option>
                <option value="nao_comprou">Não Comprou</option>
                <option value="venda_feita">Venda Feita</option>
                <option value="fechado">Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Promotor/Vendedor</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={filtros.vendedorId}
                onChange={(e) =>
                  setFiltros({ ...filtros, vendedorId: e.target.value })
                }
              >
                <option value="">Todos</option>
                {indicadores?.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Data Início</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataInicio: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Fim</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataFim: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Indicações */}
      <Card>
        <CardHeader>
          <CardTitle>Indicações ({indicacoesFiltradas?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingIndicacoes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : indicacoesFiltradas && indicacoesFiltradas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicacoesFiltradas.map((indicacao: any) => (
                  <TableRow key={indicacao.id}>
                    <TableCell>#{indicacao.id}</TableCell>
                    <TableCell>{indicacao.nomeCliente}</TableCell>
                    <TableCell>{indicacao.telefoneCliente}</TableCell>
                    <TableCell>
                      {indicadores?.find((i) => i.id === indicacao.vendedorId)
                        ?.nome || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          indicacao.status === "pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : indicacao.status === "contatado"
                            ? "bg-blue-100 text-blue-800"
                            : indicacao.status === "fechado"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {indicacao.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(indicacao.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <select
                          className="p-1 border rounded text-xs min-w-[160px]"
                          value={indicacao.status}
                          onChange={(e) =>
                            handleAtualizarStatus(indicacao.id, e.target.value)
                          }
                        >
                          <option value="pendente">Pendente</option>
                          <option value="contatado">Contatado</option>
                          <option value="em_negociacao">Em Negociação</option>
                          <option value="lead_com_resistencia">Lead com Resistência</option>
                          <option value="lead_frio">Lead Frio</option>
                          <option value="nao_comprou">Não Comprou</option>
                          <option value="venda_feita">Venda Feita</option>
                          <option value="fechado">Fechado</option>
                          <option value="perdido">Perdido</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast.info("Funcionalidade em desenvolvimento")
                          }
                        >
                          Comissão
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma indicação encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
