/**
 * Copia texto para a área de transferência com fallback para mobile/tablet
 * @param text - Texto a ser copiado
 * @returns Promise<boolean> - true se copiou com sucesso, false caso contrário
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Método 1: Tentar Clipboard API moderna (funciona em HTTPS)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API falhou, tentando fallback:", err);
    }
  }

  // Método 2: Fallback usando textarea (funciona em todos os dispositivos)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Tornar o textarea invisível mas acessível
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // Para iOS
    textArea.setSelectionRange(0, 99999);
    
    // Executar comando de cópia
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error("Fallback de clipboard falhou:", err);
    return false;
  }
}
