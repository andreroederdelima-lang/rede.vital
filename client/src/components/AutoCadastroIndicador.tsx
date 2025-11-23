import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Componente de auto-cadastro para promotores/vendedores
 * Permite que usuários se cadastrem imediatamente sem aprovação prévia
 */
export default function AutoCadastroIndicador() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "promotor" as "promotor" | "vendedor",
    observacoes: "",
  });

  const utils = trpc.useUtils();
  
  const cadastrar = trpc.indicacoes.cadastrarIndicador.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso!");
      utils.indicacoes.meuIndicador.invalidate();
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    cadastrar.mutate(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cadastro de Promotor/Vendedor</CardTitle>
        <CardDescription>
          Complete seu cadastro para começar a indicar clientes e ganhar comissões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Cadastro *</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) =>
                setFormData({ ...formData, tipo: value as "promotor" | "vendedor" })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="promotor" id="promotor" />
                <Label htmlFor="promotor" className="font-normal cursor-pointer">
                  <span className="font-semibold">Promotor</span> - Indica clientes e recebe comissão quando concluem a compra
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vendedor" id="vendedor" />
                <Label htmlFor="vendedor" className="font-normal cursor-pointer">
                  <span className="font-semibold">Vendedor</span> - Conclui o processo de venda
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <textarea
              id="observacoes"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre sua atuação"
            />
          </div>

          <Button type="submit" className="w-full" disabled={cadastrar.isPending}>
            {cadastrar.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Completar Cadastro"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
