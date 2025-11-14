import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número de telefone brasileiro para link do WhatsApp
 * Remove caracteres especiais e adiciona código do país
 */
export function formatWhatsAppLink(telefone: string): string {
  // Remove todos os caracteres não numéricos
  const numeros = telefone.replace(/\D/g, '');
  
  // Se já tem código do país (55), usa direto
  if (numeros.startsWith('55')) {
    return `https://wa.me/${numeros}`;
  }
  
  // Adiciona código do Brasil (55)
  return `https://wa.me/55${numeros}`;
}

/**
 * Formata um número de telefone para exibição
 * Mantém formatação original ou aplica máscara básica
 */
export function formatPhoneDisplay(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '');
  
  // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  } else if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  
  return telefone; // Retorna original se não conseguir formatar
}
