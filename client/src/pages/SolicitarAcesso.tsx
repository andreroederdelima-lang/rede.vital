import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { CheckCircle2, Lock } from "lucide-react";

export default function SolicitarAcesso() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [enviado, setEnviado] = useState(false);

  const solicitarMutation = trpc.solicitacoesAcesso.criar.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso!");
      setEnviado(true);
    },
    onError: (error) => {
      toast.error("Erro ao enviar solicitação", {
        description: error.message
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !justificativa) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (justificativa.length < 10) {
      toast.error("A justificativa deve ter pelo menos 10 caracteres");
      return;
    }

    solicitarMutation.mutate({
      nome,
      email,
      telefone,
      justificativa,
    });
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-600">Solicitação Enviada!</CardTitle>
            <CardDescription>
              Sua solicitação de acesso foi recebida com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Nossa equipe irá analisar sua solicitação e você receberá um email em <strong>{email}</strong> com as credenciais de acesso caso seja aprovado.
            </p>
            <p className="text-sm text-muted-foreground">
              O processo de análise pode levar até 48 horas úteis.
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="w-full"
            >
              Voltar para Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt="Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Lock className="h-6 w-6" />
            Solicitar Acesso - Dados Internos
          </CardTitle>
          <CardDescription>
            Preencha o formulário abaixo para solicitar acesso à área restrita com informações de descontos e valores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  disabled={solicitarMutation.isPending}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={solicitarMutation.isPending}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                disabled={solicitarMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="justificativa">Justificativa *</Label>
              <Textarea
                id="justificativa"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Explique o motivo da solicitação de acesso (mínimo 10 caracteres)"
                rows={4}
                disabled={solicitarMutation.isPending}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {justificativa.length}/10 caracteres mínimos
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Importante:</strong> Esta área contém informações confidenciais sobre descontos e valores dos credenciados. 
                O acesso será concedido apenas para usuários autorizados pela administração.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={solicitarMutation.isPending}
            >
              {solicitarMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
