import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { Lock, Mail } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function LoginAdmin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      // Redirecionar para login Manus OAuth
      window.location.href = getLoginUrl();
    } catch (error) {
      setErro("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={APP_LOGO} alt="Logo Vital" className="h-16" />
          </div>
          <CardTitle className="text-2xl text-center">Área Administrativa</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Faça login com sua conta Manus para acessar o painel administrativo
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {erro && (
              <div className="text-sm text-destructive text-center">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#1e9d9f] hover:bg-[#178a8c]"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <button
              onClick={() => setLocation("/recuperar-senha-admin")}
              className="text-sm text-[#1e9d9f] hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Apenas administradores autorizados podem acessar esta área
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
