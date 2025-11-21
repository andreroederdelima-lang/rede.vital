import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function RecuperarSenhaDadosInternos() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const solicitarMutation = trpc.recuperacaoSenha.solicitar.useMutation({
    onSuccess: () => {
      setEnviado(true);
      toast.success("Email enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
    },
    onError: (error) => {
      toast.error("Erro ao enviar email", {
        description: error.message
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu email");
      return;
    }
    solicitarMutation.mutate(email);
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1e9d9f] mb-2">
                Email Enviado!
              </h2>
              <p className="text-muted-foreground">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = "/login-dados-internos"}
              className="bg-[#1e9d9f] hover:bg-[#178a8c]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt="Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber instruções de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={solicitarMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1e9d9f] hover:bg-[#178a8c]"
              disabled={solicitarMutation.isPending}
            >
              {solicitarMutation.isPending ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
            <div className="mt-4 text-center">
              <a 
                href="/login-dados-internos" 
                className="text-sm text-muted-foreground hover:text-[#1e9d9f] hover:underline inline-flex items-center"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Voltar para Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
