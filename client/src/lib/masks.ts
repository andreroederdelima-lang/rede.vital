/**
 * Utilitários de máscaras para formatação de entrada
 */

/**
 * Máscara para telefone brasileiro
 * Formatos aceitos:
 * - (XX) XXXX-XXXX (fixo)
 * - (XX) XXXXX-XXXX (celular)
 */
export function maskTelefone(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica máscara
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
}

/**
 * Remove máscara do telefone, retornando apenas números
 */
export function unmaskTelefone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Máscara para valores monetários em Real (R$)
 * Formato: R$ 1.234,56
 */
export function maskMoeda(value: string): string {
  // Remove tudo que não é dígito
  let numbers = value.replace(/\D/g, '');
  
  // Se vazio, retorna vazio
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers) / 100;
  
  // Formata com separadores brasileiros
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Remove máscara da moeda, retornando valor numérico como string
 */
export function unmaskMoeda(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para formato decimal (divide por 100)
  const amount = parseInt(numbers) / 100;
  
  return amount.toFixed(2);
}

/**
 * Formata valor para exibição com R$
 */
export function formatMoeda(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Calcula porcentagem de desconto entre dois valores
 */
export function calcularDesconto(valorParticular: string, valorAssinante: string): number {
  const particular = parseFloat(valorParticular.replace(',', '.'));
  const assinante = parseFloat(valorAssinante.replace(',', '.'));
  
  if (isNaN(particular) || isNaN(assinante) || particular === 0) {
    return 0;
  }
  
  const desconto = ((particular - assinante) / particular) * 100;
  return Math.max(0, Math.round(desconto));
}
