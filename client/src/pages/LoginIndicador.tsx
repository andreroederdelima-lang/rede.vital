import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { Loader2 } from "lucide-react";

/**
 * Página de login para indicadores (sem senha)
 * Login via email cadastrado
 */
export default function LoginIndicador() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");

  const login = trpc.indicacoes.loginSemSenha.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      setLocation("/indicacoes");
    },
    onError: (error: any) => {
      toast.error(`Erro ao fazer login: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    login.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={APP_LOGO} alt="Vital" className="h-24" />
            </div>
            <CardTitle className="text-2xl">Login de Indicador</CardTitle>
            <CardDescription>
              Entre com o email cadastrado para acessar suas indicações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full bg-[#1e9d9f] hover:bg-[#178a8c]"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Ainda não tem cadastro?
              </p>
              <Button
                variant="outline"
                onClick={() => setLocation("/cadastro-indicador")}
                className="w-full"
              >
                Cadastrar como Indicador
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
