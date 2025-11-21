import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RecuperarSenhaAdmin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implementar envio de email com link de recuperação
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnviado(true);
      toast.success("Email de recuperação enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img src={APP_LOGO} alt="Logo Vital" className="h-16" />
            </div>
            <CardTitle className="text-2xl text-center">Email Enviado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Enviamos um link de recuperação para <strong>{email}</strong>.
              <br /><br />
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Button
              onClick={() => setLocation("/login-admin")}
              className="w-full"
              variant="outline"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={APP_LOGO} alt="Logo Vital" className="h-16" />
          </div>
          <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Digite seu email para receber instruções de recuperação
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEnviar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Administrativo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@vital.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enviaremos um link de recuperação para este email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1e9d9f] hover:bg-[#178a8c]"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setLocation("/login-admin")}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar para login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
