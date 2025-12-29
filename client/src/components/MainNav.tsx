import { useState } from "react";
import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Phone, Instagram, Facebook, Menu, X } from "lucide-react";

export function MainNav() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  const navItems = [
    {
      href: "https://www.suasaudevital.com.br",
      label: "Início",
      public: true,
      external: true,
    },
    {
      href: "https://www.suasaudevital.com.br/seja-parceiro-cadastro",
      label: "Seja Parceiro",
      public: true,
      external: true,
    },
    {
      href: "/sugerir-parceiro",
      label: "Sugerir Parceiro",
      public: true,
    },
    {
      href: "https://wa.me/5547933853726?text=Ol%C3%A1,%20gostaria%20de%20falar%20com%20o%20time%20Vital",
      label: "Fale Conosco",
      public: true,
      external: true,
    },
    {
      href: "/dados-internos",
      label: "Acesso Interno",
      public: true,
    },
  ];

  if (isAdmin) {
    navItems.push({
      href: "/admin",
      label: "Admin",
      public: false,
    });
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        {/* LINHA 1: Logo | Telefone + Botão Assine Agora */}
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Logo - MAIOR */}
          <Link href="/">
            <div className="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
              <img 
                src={APP_LOGO} 
                alt="Vital Logo" 
                className="h-12 md:h-16 lg:h-20 w-auto" 
              />
            </div>
          </Link>

          {/* Lado direito desktop: WhatsApp + Botão */}
          <div className="hidden md:flex items-center gap-4">
            {/* WhatsApp + Telefone com ícone verde */}
            <a
              href="https://wa.me/5547933853726"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-[#25D366] rounded-full p-2">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-base text-gray-700">(47) 93385-3726</span>
            </a>

            {/* Botão Assine Agora */}
            <a
              href="https://www.suasaudevital.com.br/para-voce"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                className="bg-[#1E9D9F] hover:bg-[#1a8587] text-white rounded-full px-8 py-3 font-semibold text-base shadow-md"
              >
                Assine Agora
              </Button>
            </a>
          </div>

          {/* Mobile: Botão Menu Hamburguer */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#1E9D9F]" />
            ) : (
              <Menu className="h-6 w-6 text-[#1E9D9F]" />
            )}
          </button>
        </div>

        {/* LINHA 2: Menu de navegação | Redes Sociais */}
        <div className="hidden md:flex items-center justify-between py-3 border-t border-gray-100">
          {/* Menu horizontal */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location === item.href;
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E9D9F] hover:text-[#1a8587] font-medium transition-colors text-base whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`cursor-pointer font-medium transition-colors text-base whitespace-nowrap ${
                      isActive
                        ? "text-[#1E9D9F] border-b-2 border-[#1E9D9F] pb-1"
                        : "text-[#1E9D9F] hover:text-[#1a8587]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Siga-nos + Redes Sociais */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-base font-medium">Siga-nos:</span>
            <a
              href="https://www.instagram.com/suasaude.vital/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E9D9F] hover:text-[#1a8587] transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://www.facebook.com/people/Vital-Servi%C3%A7os-M%C3%A9dicos/61566568477892/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E9D9F] hover:text-[#1a8587] transition-colors"
            >
              <Facebook className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Menu Mobile - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2">
            {/* Links de navegação */}
            <div className="flex flex-col gap-3 py-4">
              {navItems.map((item) => {
                const isActive = location === item.href;
                
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1E9D9F] hover:text-[#1a8587] font-medium transition-colors text-base py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`cursor-pointer font-medium transition-colors text-base block py-2 ${
                        isActive
                          ? "text-[#1E9D9F] border-l-4 border-[#1E9D9F] pl-3"
                          : "text-[#1E9D9F] hover:text-[#1a8587]"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Telefone e Botão */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <a
                href="https://wa.me/5547933853726"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="bg-[#25D366] rounded-full p-2">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-base text-gray-700">(47) 93385-3726</span>
              </a>

              <a
                href="https://www.suasaudevital.com.br/para-voce"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button 
                  className="w-full bg-[#1E9D9F] hover:bg-[#1a8587] text-white rounded-full py-3 font-semibold text-base"
                >
                  Assine Agora
                </Button>
              </a>
            </div>

            {/* Redes Sociais */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
              <span className="text-gray-500 text-sm font-medium">Siga-nos:</span>
              <a
                href="https://www.instagram.com/suasaude.vital/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E9D9F] hover:text-[#1a8587] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/people/Vital-Servi%C3%A7os-M%C3%A9dicos/61566568477892/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E9D9F] hover:text-[#1a8587] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
