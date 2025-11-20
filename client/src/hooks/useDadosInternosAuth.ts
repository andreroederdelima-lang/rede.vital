import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export function useDadosInternosAuth() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há cookie de sessão
  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const hasSession = cookies.some(cookie => 
        cookie.trim().startsWith('dados_internos_session=')
      );
      
      if (!hasSession) {
        setLocation("/login-dados-internos");
        setIsLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [setLocation]);

  const logoutMutation = trpc.usuariosAutorizados.logout.useMutation({
    onSuccess: () => {
      setLocation("/login-dados-internos");
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
}
