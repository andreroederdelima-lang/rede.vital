import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export function useDadosInternosAuth() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, logout: manusLogout } = useAuth();
  
  // Verificar se usuário está autorizado
  const { data: usuarioAutorizado, isLoading: checkingAuth } = trpc.usuariosAutorizados.verificarAcesso.useQuery(
    user?.email || "",
    { enabled: !!user?.email }
  );

  const isLoading = authLoading || checkingAuth;
  const isAuthenticated = !!user && !!usuarioAutorizado?.autorizado;

  useEffect(() => {
    if (!authLoading && !checkingAuth) {
      if (!user) {
        // Não autenticado, redirecionar para login
        setLocation("/login-dados-internos");
      } else if (user.email && !usuarioAutorizado?.autorizado) {
        // Autenticado mas não autorizado, redirecionar para login com mensagem
        setLocation("/login-dados-internos");
      }
    }
  }, [user, authLoading, usuarioAutorizado, checkingAuth, setLocation]);

  const logout = () => {
    manusLogout();
    setLocation("/login-dados-internos");
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    user,
    usuarioAutorizado: usuarioAutorizado?.usuario,
  };
}
