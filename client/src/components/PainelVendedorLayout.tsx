import { ReactNode } from "react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, DollarSign, LogOut, User, Image, Plus, Bell } from "lucide-react";
import { toast } from "sonner";

interface PainelVendedorLayoutProps {
  children: ReactNode;
}

/**
 * Layout com sidebar para o painel do vendedor/promotor
 * Similar ao sistema antigo de indicações
 */
export default function PainelVendedorLayout({ children }: PainelVendedorLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso!");
      setLocation("/login-indicador");
    },
  });

  const { data: meuIndicador } = trpc.indicacoes.meuIndicador.useQuery();

  // Buscar indicações com mudança de status recente (últimas 24h)
  const { data: minhasIndicacoes = [] } = trpc.indicacoes.listarIndicacoes.useQuery(
    undefined,
    { enabled: !!meuIndicador, refetchInterval: 30000 } // Atualiza a cada 30s
  );

  // Contar indicações com status atualizado nas últimas 24h
  const notificacoesCount = minhasIndicacoes.filter((ind: any) => {
    if (!ind.dataAtualizacao) return false;
    const dataAtualizacao = new Date(ind.dataAtualizacao);
    const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return dataAtualizacao > umDiaAtras && ind.status !== "pendente";
  }).length;

  const menuItems = [
    {
      icon: FileText,
      label: "Indicações",
      path: "/indicacoes",
    },
    {
      icon: BarChart3,
      label: "Estatísticas",
      path: "/indicacoes/estatisticas",
    },
    {
      icon: DollarSign,
      label: "Comissões",
      path: "/indicacoes/comissoes",
    },
    {
      icon: Image,
      label: "Materiais de Divulgação",
      path: "/materiais-divulgacao",
    },
  ];

  const actionButtons = [
    {
      icon: Plus,
      label: "Nova Indicação",
      path: "/indicacoes",
      action: "create",
    },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Vital" className="h-16" />
              <div>
                <h1 className="text-xl font-bold text-[#1e9d9f]">Sua Saúde Vital</h1>
                <p className="text-sm text-gray-600">Sistema de Indicações</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Badge de Notificações */}
              <button
                onClick={() => setLocation("/indicacoes")}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Notificações de indicações"
              >
                <Bell className="h-6 w-6 text-gray-700" />
                {notificacoesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificacoesCount > 9 ? "9+" : notificacoesCount}
                  </span>
                )}
              </button>

              <div className="w-8 h-8 bg-[#1e9d9f] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {meuIndicador?.nome?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-88px)] p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Painel do {meuIndicador?.tipo === "promotor" ? "Promotor" : "Vendedor"}
            </h2>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-[#1e9d9f] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Botão de Ação Rápida */}
          <div className="mt-6 pt-6 border-t">
            {actionButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.label}
                  onClick={() => setLocation(btn.path)}
                  className="w-full bg-[#1e9d9f] hover:bg-[#178789] text-white"
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {btn.label}
                </Button>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="mt-auto pt-6 border-t">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <User className="h-5 w-5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {meuIndicador?.nome || "Admin"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
