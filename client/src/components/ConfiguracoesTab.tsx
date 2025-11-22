import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesTab() {
  const utils = trpc.useUtils();
  
  // Estados para configurações de comissão
  const [comissaoPromotor, setComissaoPromotor] = useState("");
  const [comissaoVendedor, setComissaoVendedor] = useState("");
  const [descricaoPromotor, setDescricaoPromotor] = useState("");
  const [descricaoVendedor, setDescricaoVendedor] = useState("");

  // Buscar configurações existentes
  const { data: configuracoes = [], isLoading } = trpc.configuracoes.listar.useQuery();

  // Mutation para atualizar configurações
  const atualizarConfig = trpc.configuracoes.atualizar.useMutation({
    onSuccess: () => {
      utils.configuracoes.listar.invalidate();
      toast.success("Configuração atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar configuração: " + error.message);
    },
  });

  // Carregar valores iniciais quando as configurações forem carregadas
  useState(() => {
    if (configuracoes.length > 0) {
      const promotor = configuracoes.find((c: any) => c.chave === "comissao_promotor");
      const vendedor = configuracoes.find((c: any) => c.chave === "comissao_vendedor");
      
      if (promotor) {
        setComissaoPromotor(promotor.valor);
        setDescricaoPromotor(promotor.descricao || "");
      }
      if (vendedor) {
        setComissaoVendedor(vendedor.valor);
        setDescricaoVendedor(vendedor.descricao || "");
      }
    }
  });

  const salvarComissaoPromotor = () => {
    if (!comissaoPromotor) {
      toast.error("Informe o percentual de comissão");
      return;
    }

    atualizarConfig.mutate({
      chave: "comissao_promotor",
      valor: comissaoPromotor,
      descricao: descricaoPromotor || "Percentual de comissão para promotores",
    });
  };

  const salvarComissaoVendedor = () => {
    if (!comissaoVendedor) {
      toast.error("Informe o percentual de comissão");
      return;
    }

    atualizarConfig.mutate({
      chave: "comissao_vendedor",
      valor: comissaoVendedor,
      descricao: descricaoVendedor || "Percentual de comissão para vendedores",
    });
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
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
          <p className="text-muted-foreground">Gerencie percentuais de comissão e outras configurações</p>
        </div>
      </div>

      {/* Configurações de Comissão */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Comissão Promotor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Comissão - Promotor
            </CardTitle>
            <CardDescription>
              Define o percentual de comissão para promotores que indicam e aquecem clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comissao-promotor">Percentual (%)</Label>
              <Input
                id="comissao-promotor"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Ex: 5.0"
                value={comissaoPromotor}
                onChange={(e) => setComissaoPromotor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao-promotor">Descrição (opcional)</Label>
              <Textarea
                id="descricao-promotor"
                placeholder="Ex: Comissão aplicada quando o cliente indicado realiza a primeira compra"
                value={descricaoPromotor}
                onChange={(e) => setDescricaoPromotor(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={salvarComissaoPromotor}
              disabled={atualizarConfig.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Comissão Promotor
            </Button>
          </CardContent>
        </Card>

        {/* Comissão Vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Comissão - Vendedor
            </CardTitle>
            <CardDescription>
              Define o percentual de comissão para vendedores que fecham vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comissao-vendedor">Percentual (%)</Label>
              <Input
                id="comissao-vendedor"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Ex: 10.0"
                value={comissaoVendedor}
                onChange={(e) => setComissaoVendedor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao-vendedor">Descrição (opcional)</Label>
              <Textarea
                id="descricao-vendedor"
                placeholder="Ex: Comissão aplicada quando o vendedor fecha a venda com o cliente"
                value={descricaoVendedor}
                onChange={(e) => setDescricaoVendedor(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={salvarComissaoVendedor}
              disabled={atualizarConfig.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Comissão Vendedor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Atuais</CardTitle>
          <CardDescription>Histórico de todas as configurações do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {configuracoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma configuração cadastrada ainda
            </p>
          ) : (
            <div className="space-y-4">
              {configuracoes.map((config: any) => (
                <div key={config.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{config.chave}</h3>
                    <span className="text-sm text-muted-foreground">
                      {config.chave.includes("comissao") ? `${config.valor}%` : config.valor}
                    </span>
                  </div>
                  {config.descricao && (
                    <p className="text-sm text-muted-foreground">{config.descricao}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Atualizado por: {config.updatedBy || "Sistema"}</span>
                    <span>{new Date(config.updatedAt).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
