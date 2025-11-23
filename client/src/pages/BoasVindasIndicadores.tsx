import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

/**
 * Página de boas-vindas para promotores e vendedores
 * Explica os papéis e direciona para login
 */
export default function BoasVindasIndicadores() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <img src={APP_LOGO} alt="Vital" className="h-20" />
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e9d9f]">
                Sistema de Indicações
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Boas-vindas Promotor e/ou Vendedor!
            </h2>
            
            <p className="text-lg text-gray-700">
              Faça login para começar a registrar suas indicações
            </p>

            {/* Descrições dos Papéis */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg space-y-4 text-left">
              <p className="text-sm md:text-base">
                <strong className="text-green-700">Promotor:</strong>{" "}
                <span className="text-gray-700">
                  Indica clientes e recebe comissão quando estes concluem o processo de compra.
                </span>
              </p>
              <p className="text-sm md:text-base">
                <strong className="text-green-700">Vendedor:</strong>{" "}
                <span className="text-gray-700">
                  Quem conclui o processo de venda.
                </span>
              </p>
              
              {/* Informação sobre Inversão de Percentuais */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs md:text-sm text-gray-600 italic">
                  <strong>Observação importante:</strong> Em casos de lead frio ou com múltiplas objeções, 
                  as porcentagens de comissão podem ser invertidas. Esta definição é feita exclusivamente por:
                </p>
                <ul className="text-xs md:text-sm text-gray-600 mt-2 ml-4 space-y-1">
                  <li>• Email master: <strong>administrativo@suasaudevital.com.br</strong></li>
                  <li>• Vendedor Pedro: <strong>comercial@suasaudevital.com.br</strong></li>
                </ul>
                <p className="text-xs md:text-sm text-gray-600 mt-2 italic">
                  Todas as indicações devem ser qualificadas na plataforma por estes responsáveis.
                </p>
              </div>
            </div>

            {/* Botão de Login */}
            <Button
              onClick={() => setLocation("/login-indicador")}
              className="bg-[#1e9d9f] hover:bg-[#178a8c] text-white px-8 py-6 text-lg"
            >
              Fazer Login
            </Button>

            {/* Link para Cadastro */}
            <div className="pt-4">
              <p className="text-sm text-gray-600">
                Ainda não tem cadastro?{" "}
                <button
                  onClick={() => setLocation("/cadastro-indicador")}
                  className="text-[#1e9d9f] hover:underline font-semibold"
                >
                  Cadastre-se aqui
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
