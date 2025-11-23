import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Save, DollarSign, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesTab() {
  const utils = trpc.useUtils();
  
  // Estados para edição de comissões
  const [editandoTipo, setEditandoTipo] = useState<string | null>(null);
  const [valorEditando, setValorEditando] = useState("");
  const [percentualIndicadorEditando, setPercentualIndicadorEditando] = useState("");
  const [percentualVendedorEditando, setPercentualVendedorEditando] = useState("");

  // Buscar comissões de assinaturas
  const { data: comissoes = [], isLoading } = trpc.comissoesAssinaturas.listar.useQuery();

  // Mutation para atualizar comissão
  const atualizarComissao = trpc.comissoesAssinaturas.atualizar.useMutation({
    onSuccess: () => {
      utils.comissoesAssinaturas.listar.invalidate();
      toast.success("Comissão atualizada com sucesso!");
      setEditandoTipo(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar comissão: " + error.message);
    },
  });

  const iniciarEdicao = (comissao: any) => {
    setEditandoTipo(comissao.tipoAssinatura);
    setValorEditando((comissao.valorComissaoTotal / 100).toFixed(2));
    setPercentualIndicadorEditando(comissao.percentualIndicador.toString());
    setPercentualVendedorEditando(comissao.percentualVendedor.toString());
  };

  const cancelarEdicao = () => {
    setEditandoTipo(null);
    setValorEditando("");
    setPercentualIndicadorEditando("");
    setPercentualVendedorEditando("");
  };

  const salvarEdicao = () => {
    if (!editandoTipo) return;

    const valorTotal = Math.round(parseFloat(valorEditando) * 100);
    const percIndicador = parseInt(percentualIndicadorEditando);
    const percVendedor = parseInt(percentualVendedorEditando);

    // Validar que percentuais somam 100%
    if (percIndicador + percVendedor !== 100) {
      toast.error("Os percentuais de indicador e vendedor devem somar 100%");
      return;
    }

    atualizarComissao.mutate({
      tipoAssinatura: editandoTipo,
      valorComissaoTotal: valorTotal,
      percentualIndicador: percIndicador,
      percentualVendedor: percVendedor,
    });
  };

  // Calcular valores de comissão para indicador e vendedor
  const calcularValorIndicador = (valorTotal: number, percentual: number) => {
    return (valorTotal * percentual / 100) / 100;
  };

  const calcularValorVendedor = (valorTotal: number, percentual: number) => {
    return (valorTotal * percentual / 100) / 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-[#1e9d9f]" />
        <div>
          <h2 className="text-2xl font-bold text-[#1e9d9f]">Configurações do Sistema</h2>
          <p className="text-muted-foreground">Gerencie comissões por tipo de assinatura</p>
        </div>
      </div>

      {/* Tabela de Comissões por Tipo de Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#1e9d9f]" />
            Comissões por Tipo de Assinatura
          </CardTitle>
          <CardDescription>
            Valores de comissão e divisão entre indicador (70%) e vendedor (30%) para cada tipo de assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comissoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma comissão cadastrada ainda
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Assinatura</TableHead>
                    <TableHead className="text-right">Preço Mensal</TableHead>
                    <TableHead className="text-right">Comissão Total</TableHead>
                    <TableHead className="text-right">% Indicador</TableHead>
                    <TableHead className="text-right">Valor Indicador</TableHead>
                    <TableHead className="text-right">% Vendedor</TableHead>
                    <TableHead className="text-right">Valor Vendedor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.map((comissao: any) => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">{comissao.nomeExibicao}</TableCell>
                      <TableCell className="text-right">
                        R$ {(comissao.precoMensal / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTipo === comissao.tipoAssinatura ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={valorEditando}
                            onChange={(e) => setValorEditando(e.target.value)}
                            className="w-24 text-right"
                          />
                        ) : (
                          <span className="font-semibold text-green-600">
                            R$ {(comissao.valorComissaoTotal / 100).toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTipo === comissao.tipoAssinatura ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={percentualIndicadorEditando}
                            onChange={(e) => setPercentualIndicadorEditando(e.target.value)}
                            className="w-16 text-right"
                          />
                        ) : (
                          `${comissao.percentualIndicador}%`
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[#1e9d9f] font-medium">
                        R$ {calcularValorIndicador(comissao.valorComissaoTotal, comissao.percentualIndicador).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTipo === comissao.tipoAssinatura ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={percentualVendedorEditando}
                            onChange={(e) => setPercentualVendedorEditando(e.target.value)}
                            className="w-16 text-right"
                          />
                        ) : (
                          `${comissao.percentualVendedor}%`
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[#c6bca4] font-medium">
                        R$ {calcularValorVendedor(comissao.valorComissaoTotal, comissao.percentualVendedor).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {editandoTipo === comissao.tipoAssinatura ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={salvarEdicao}
                              disabled={atualizarComissao.isPending}
                              className="bg-[#1e9d9f] hover:bg-[#178a8c]"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelarEdicao}
                              disabled={atualizarComissao.isPending}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => iniciarEdicao(comissao)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Indicador (70%):</strong> Pessoa que indica e aquece o cliente, facilitando o contato inicial</p>
            <p><strong>Vendedor (30%):</strong> Pessoa que fecha a venda e finaliza o processo de assinatura</p>
            <p className="text-xs mt-4">
              💡 <strong>Dica:</strong> Os percentuais de indicador e vendedor devem sempre somar 100%. 
              Ajuste os valores conforme a estratégia comercial da Vital.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
