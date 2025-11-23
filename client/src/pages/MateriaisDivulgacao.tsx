import { useState } from "react";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import { 
  Mic, 
  MessageSquare, 
  ExternalLink,
  Share2,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";
import CopysEditaveisSection from "@/components/CopysEditaveisSection";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
  white: "#FFFFFF",
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F5F5F5",
};

export default function MateriaisDivulgacao() {
  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Texto copiado!");
  };

  const compartilharMaterial = (titulo: string, conteudo: string) => {
    if (navigator.share) {
      navigator.share({
        title: titulo,
        text: conteudo,
      }).catch(() => {
        copiarTexto(conteudo);
      });
    } else {
      copiarTexto(conteudo);
    }
  };

  if (false) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando materiais...</p>
        </div>
      </PainelVendedorLayout>
    );
  }

  return (
    <PainelVendedorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiais de Divulgação</h1>
          <p className="text-muted-foreground mt-1">
            Recursos para promover as assinaturas Vital
          </p>
        </div>
        {/* Landing Pages das Assinaturas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <ExternalLink className="inline mr-2" size={28} />
            Landing Pages das Assinaturas
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Compartilhe estes links com seus clientes para apresentar as assinaturas Vital
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Home (Página Principal)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Visão geral dos planos e promoção
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Pessoa Física</h3>
              <p className="text-sm text-gray-600 mb-3">
                Planos para famílias e indivíduos
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/pessoa-fisica" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/pessoa-fisica")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Empresarial</h3>
              <p className="text-sm text-gray-600 mb-3">
                Planos para empresas e funcionários
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/empresarial" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/empresarial")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Planos Completos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Comparação detalhada dos 4 planos
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/planos-completos" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/planos-completos")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Cadastro de Grupos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Formar grupos de 4 pessoas e economizar
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/grupos" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/grupos")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">FAQ (Dúvidas Frequentes)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Respostas para dúvidas comuns
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/faq" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/faq")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Check-out Venda Direta</h3>
              <p className="text-sm text-gray-600 mb-3">
                Página de checkout para vendas diretas
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://suasaudevital.app.filoo.com.br/checkout?compact=true&team=suasaudevital" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://suasaudevital.app.filoo.com.br/checkout?compact=true&team=suasaudevital")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>
          </div>
        </section>

        {/* Recursos Adicionais */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <Share2 className="inline mr-2" size={28} />
            Recursos Adicionais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">QR Code WhatsApp Vendas</h3>
              <p className="text-sm text-gray-600 mb-3">
                QR Codes para contato direto via WhatsApp
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://credenciados.suasaudevital.com.br/qr-codes" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acessar QR Codes
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Convite de Parceiros</h3>
              <p className="text-sm text-gray-600 mb-3">
                Página de credenciamento de parceiros
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://credenciados.suasaudevital.com.br/parceiros" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Convidar Parceiros
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Guia do Assinante</h3>
              <p className="text-sm text-gray-600 mb-3">
                Médicos e serviços credenciados
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://credenciados.suasaudevital.com.br" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver Guia
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Áudios das Assinaturas</h3>
              <p className="text-sm text-gray-600 mb-3">
                Áudios promocionais para divulgação
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://drive.google.com/drive/folders/1FV_irBOjf_8F_V5ZSvGE2r_GtsNAXV7W" target="_blank" rel="noopener noreferrer">
                  <Mic className="mr-2 h-4 w-4" />
                  Acessar Áudios
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Avisar sobre Indicação</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contato direto para notificar indicações
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://wa.me/5547933853726" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Abrir WhatsApp
                </a>
              </Button>
            </Card>
          </div>
        </section>

        {/* Copys Editáveis (Admin) */}
        <CopysEditaveisSection />
      </div>
    </PainelVendedorLayout>
  );
}
