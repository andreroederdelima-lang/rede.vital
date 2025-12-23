import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { APP_LOGO } from "@/const";

/**
 * Página de redirecionamento para atualização de dados
 * Redireciona para o formulário de cadastro correto baseado no tipo de credenciado
 */
export default function AtualizarDados() {
  const [, params] = useRoute("/atualizar-dados/:token");
  const [, setLocation] = useLocation();
  const token = params?.token || "";
  
  // Verificar validade do token e tipo de credenciado
  const { data: tokenData, isLoading } = trpc.tokens.verificar.useQuery(
    { token },
    { enabled: !!token }
  );

  useEffect(() => {
    if (tokenData?.valido && tokenData?.token) {
      // Redirecionar para o formulário correto baseado no tipo
      if (tokenData.token.tipoCredenciado === "medico") {
        setLocation(`/cadastro-medico/${token}`);
      } else if (tokenData.token.tipoCredenciado === "instituicao") {
        setLocation(`/cadastro-servico/${token}`);
      }
    }
  }, [tokenData, token, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src={APP_LOGO} alt="Vital" className="h-16 mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin text-[#2D9B9B] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!tokenData?.valido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <img src={APP_LOGO} alt="Vital" className="h-16 mx-auto mb-6" />
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Inválido</h1>
            <p className="text-gray-600 mb-6">
              Este link de atualização expirou ou não é válido. Entre em contato com a equipe Vital para solicitar um novo link.
            </p>
            <a
              href="https://wa.me/5547933853726"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2D9B9B] text-white rounded-lg hover:bg-[#257a7a] transition-colors"
            >
              Falar com Vital
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
