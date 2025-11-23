import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, MessageCircle, Share2, DollarSign, Percent } from "lucide-react";
import { formatWhatsAppLink, abrirComoChegar } from "@/lib/utils";
import { VITAL_COLORS } from "@shared/colors";

interface CredenciadoListItemProps {
  tipo: "medico" | "instituicao";
  nome: string;
  especialidadeOuCategoria: string;
  municipio: string;
  endereco: string;
  telefone?: string | null;
  whatsapp?: string | null;
  logoUrl?: string | null;
  fotoUrl?: string | null;
  precoConsulta?: string | null;
  descontoPercentual?: number;
  mostrarPrecoDesconto?: boolean; // true para Dados Internos, false para público
  onCompartilhar?: () => void;
  onEnviarLink?: () => void;
  onEditar?: () => void;
}

export function CredenciadoListItem({
  tipo,
  nome,
  especialidadeOuCategoria,
  municipio,
  endereco,
  telefone,
  whatsapp,
  logoUrl,
  fotoUrl,
  precoConsulta,
  descontoPercentual,
  mostrarPrecoDesconto = false,
  onCompartilhar,
  onEnviarLink,
  onEditar,
}: CredenciadoListItemProps) {
  // Determinar imagem padrão baseado no tipo
  const getPlaceholderImage = () => {
    if (tipo === "medico") return "/medico-placeholder.png";
    return "/servico-placeholder.png";
  };

  const imagemPrincipal = logoUrl || fotoUrl || getPlaceholderImage();
  const telefoneExibir = whatsapp || telefone;

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
      style={{
        backgroundColor: VITAL_COLORS.white,
        borderColor: "#E5E5E5",
      }}
    >
      {/* Logo/Foto */}
      <div className="flex-shrink-0">
        <img
          src={imagemPrincipal}
          alt={nome}
          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
          style={{
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            backgroundColor: VITAL_COLORS.lightGray,
          }}
        />
      </div>

      {/* Informações */}
      <div className="flex-1 min-w-0">
        {/* Linha 1: Nome e Especialidade/Categoria */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base md:text-lg truncate"
              style={{ color: VITAL_COLORS.turquoise }}
            >
              {nome}
            </h3>
            <p
              className="text-sm md:text-base"
              style={{ color: VITAL_COLORS.darkGray }}
            >
              {especialidadeOuCategoria}
            </p>
          </div>

          {/* Botões de ação (desktop) */}
          <div className="hidden md:flex gap-2 flex-shrink-0">
            {onCompartilhar && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCompartilhar}
                className="h-8 w-8 p-0"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
                title="Compartilhar"
              >
                <Share2 size={14} />
              </Button>
            )}
            {onEnviarLink && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEnviarLink}
                className="h-8 px-3"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
              >
                Enviar Link
              </Button>
            )}
            {onEditar && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEditar}
                className="h-8 px-3"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
              >
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Linha 2: Município + Endereço */}
        <div className="flex items-start gap-2 mb-2 text-sm">
          <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: VITAL_COLORS.mediumGray }} />
          <span style={{ color: VITAL_COLORS.mediumGray }}>
            {municipio} - {endereco}
          </span>
        </div>

        {/* Linha 3: Telefone + WhatsApp */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {telefoneExibir && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} style={{ color: VITAL_COLORS.mediumGray }} />
              <span style={{ color: VITAL_COLORS.mediumGray }}>{telefoneExibir}</span>
            </div>
          )}

          {whatsapp && (
            <a
              href={formatWhatsAppLink(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="h-7 px-3 text-xs"
                style={{
                  backgroundColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.white,
                }}
              >
                <MessageCircle size={12} className="mr-1" />
                WhatsApp
              </Button>
            </a>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => abrirComoChegar(endereco, municipio)}
            className="h-7 px-3 text-xs"
            style={{
              borderColor: VITAL_COLORS.turquoise,
              color: VITAL_COLORS.turquoise,
            }}
          >
            <MapPin size={12} className="mr-1" />
            Como Chegar
          </Button>
        </div>

        {/* Linha 4: Preço e Desconto (apenas Dados Internos) */}
        {mostrarPrecoDesconto && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {precoConsulta && (
              <div className="flex items-center gap-1">
                <DollarSign size={14} style={{ color: VITAL_COLORS.darkGray }} />
                <span style={{ color: VITAL_COLORS.darkGray }}>{precoConsulta}</span>
              </div>
            )}
            {descontoPercentual !== undefined && descontoPercentual > 0 && (
              <Badge
                className="px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: VITAL_COLORS.gold,
                  color: VITAL_COLORS.white,
                }}
              >
                <Percent size={12} className="mr-1" />
                {descontoPercentual}% desconto
              </Badge>
            )}
          </div>
        )}

        {/* Botões mobile */}
        <div className="flex md:hidden gap-2 mt-3">
          {onCompartilhar && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCompartilhar}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.turquoise,
                color: VITAL_COLORS.turquoise,
              }}
            >
              <Share2 size={12} className="mr-1" />
              Compartilhar
            </Button>
          )}
          {onEnviarLink && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEnviarLink}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.turquoise,
                color: VITAL_COLORS.turquoise,
              }}
            >
              Enviar Link
            </Button>
          )}
          {onEditar && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEditar}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.turquoise,
                color: VITAL_COLORS.turquoise,
              }}
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
