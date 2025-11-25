import { useState, useEffect } from "react";
import { MainNav } from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VITAL_COLORS } from "@shared/colors";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SugerirParceiro() {

  const [tipoServico, setTipoServico] = useState("");
  const [nome, setNome] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [observacoes, setObservacoes] = useState("");



  const enviarSugestao = trpc.system.notifyOwner.useMutation({
    onSuccess: () => {
      toast.success("Sugestão enviada com sucesso! Obrigado pela contribuição.");
      // Limpar formulário
      setTipoServico("");
      setNome("");
      setMunicipio("");
      setObservacoes("");
    },
    onError: (error) => {
      toast.error("Erro ao enviar sugestão: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoServico.trim() || !nome.trim() || !municipio.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const mensagem = `
📋 NOVA SUGESTÃO DE PARCEIRO

Tipo de Serviço: ${tipoServico}
Nome: ${nome}
Município: ${municipio}
${observacoes ? `\nObservações: ${observacoes}` : ""}
    `.trim();

    enviarSugestao.mutate({
      title: "Nova Sugestão de Parceiro",
      content: mensagem,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-1 container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle style={{ color: VITAL_COLORS.turquoise }} className="text-2xl">
              Sugira um Parceiro
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Conhece um serviço ou médico de confiança? Compartilhe conosco!
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Serviço */}
              <div className="space-y-2">
                <Label htmlFor="tipoServico">
                  Tipo de Serviço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tipoServico"
                  type="text"
                  placeholder="Ex: Médico, Clínica, Farmácia, Academia..."
                  value={tipoServico}
                  onChange={(e) => setTipoServico(e.target.value)}
                  required
                />
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome do Profissional ou Estabelecimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Ex: Dr. João Silva, Clínica Saúde Total..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              {/* Município */}
              <div className="space-y-2">
                <Label htmlFor="municipio">
                  Município <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="municipio"
                  type="text"
                  placeholder="Ex: Blumenau, Itajaí, Balneário Camboriú..."
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  required
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais que possam ajudar (endereço, telefone, especialidade...)"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Botão Enviar */}
              <Button
                type="submit"
                className="w-full"
                disabled={enviarSugestao.isPending}
                style={{
                  backgroundColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.white,
                }}
              >
                {enviarSugestao.isPending ? "Enviando..." : "Enviar Sugestão"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />


    </div>
  );
}
