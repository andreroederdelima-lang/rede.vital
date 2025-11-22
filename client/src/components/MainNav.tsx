import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Building2, Shield, Handshake, MessageCircle, Lock } from "lucide-react";

export function MainNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  const navItems = [
    {
      href: "/parceiros",
      label: "Sugerir um Parceiro",
      icon: Handshake,
      public: true,
    },
    {
      href: "https://wa.me/5547933853726?text=Ol%C3%A1,%20gostaria%20de%20falar%20com%20o%20time%20Vital",
      label: "Fale Conosco",
      icon: MessageCircle,
      public: true,
      external: true,
    },
    {
      href: "/dados-internos",
      label: "Acesso Interno",
      icon: Lock,
      public: true,
    },
  ];

  if (isAdmin) {
    navItems.push({
      href: "/admin",
      label: "Admin",
      icon: Shield,
      public: false,
    });
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <img src={APP_LOGO} alt="Vital Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#1e9d9f]">
                  GUIA DO ASSINANTE
                </span>
                <span className="text-xs text-gray-600">
                  Rede Credenciada - Vale do Itajaí
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.startsWith(item.href);
              
              // Se não é público e usuário não está autenticado, não mostra
              if (!item.public && !isAuthenticated) {
                return null;
              }

              // Links externos (WhatsApp)
              if ((item as any).external) {
                return (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-[#1e9d9f] hover:bg-[#1e9d9f]/10"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={
                      isActive
                        ? "bg-[#1e9d9f] hover:bg-[#1a8a8c] text-white"
                        : "text-gray-700 hover:text-[#1e9d9f] hover:bg-[#1e9d9f]/10"
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu - Simplified for now */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
