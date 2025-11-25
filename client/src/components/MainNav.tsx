import { useState } from "react";
import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Phone, Instagram, Facebook } from "lucide-react";

export function MainNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  const navItems = [
    {
      href: "https://www.suasaudevital.com.br",
      label: "In\u00edcio",
      public: true,
      external: true,
    },
    {
      href: "/parceiros",
      label: "Seja Parceiro",
      public: true,
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
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo à esquerda */}
          <Link href="/">
            <div className="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
              <img src={APP_LOGO} alt="Vital Logo" className="h-14 w-auto" />
            </div>
          </Link>

          {/* Menu horizontal no centro */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location === item.href;
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium transition-colors text-base whitespace-nowrap"
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
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-primary hover:text-primary/80"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Lado direito: WhatsApp, Botão Assine Agora, Redes Sociais */}
          <div className="hidden lg:flex items-center gap-4">
            {/* WhatsApp + Telefone */}
            <a
              href="https://wa.me/5547933853726"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span className="font-medium text-sm">(47) 93385-3726</span>
            </a>

            {/* Botão Assine Agora */}
            <a
              href="https://www.suasaudevital.com.br/para-voce"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 font-semibold">
                Assine Agora
              </Button>
            </a>

            {/* Siga-nos */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-gray-500 text-sm">Siga-nos:</span>
              <a
                href="https://www.instagram.com/suasaude.vital/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/people/Vital-Servi%C3%A7os-M%C3%A9dicos/61566568477892/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Menu Mobile - Simplificado */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="https://wa.me/5547933853726"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="rounded-full">
                <Phone className="h-4 w-4" />
              </Button>
            </a>
            <a
              href="https://www.suasaudevital.com.br/para-voce"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-4">
                Assinar
              </Button>
            </a>
          </div>
        </div>

        {/* Menu Mobile - Links Horizontais Compactos */}
        <div className="lg:hidden flex overflow-x-auto gap-4 pb-3 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location === item.href;
            
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium transition-colors text-xs whitespace-nowrap"
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`cursor-pointer font-medium transition-colors text-xs whitespace-nowrap ${
                    isActive
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-primary hover:text-primary/80"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
