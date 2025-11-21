import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";

export default function LoginDadosInternos() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const loginMutation = trpc.usuariosAutorizados.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      setLocation("/dados-internos");
    },
    onError: (error) => {
      toast.error("Erro no login", {
        description: error.message
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ email, senha });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt="Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">Dados Internos</CardTitle>
          <CardDescription>
            Acesso restrito para usuários autorizados
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
                disabled={loginMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                disabled={loginMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1e9d9f] hover:bg-[#178a8c]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
            <div className="mt-4 text-center">
              <a 
                href="/recuperar-senha-dados-internos" 
                className="text-sm text-[#1e9d9f] hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>
            <div className="mt-2 text-center">
              <a 
                href="/solicitar-acesso" 
                className="text-sm text-muted-foreground hover:text-[#1e9d9f] hover:underline"
              >
                Não tem acesso? Solicite aqui
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
