import jsPDF from 'jspdf';

// Cores da paleta Vital
const VITAL_COLORS = {
  turquoise: '#1e9d9f',
  beige: '#c6bca4',
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#f5f5f5',
};

interface Medico {
  id: number;
  nome: string;
  especialidade: string;
  subespecialidade?: string | null;
  areaAtuacaoPrincipal?: string | null;
  municipio: string;
  endereco: string;
  telefone?: string | null;
  whatsappSecretaria?: string | null;
  email?: string | null;
  valorParticular?: number | null;
  valorAssinanteVital?: number | null;
  tipoAtendimento?: string | null;
}

interface Instituicao {
  id: number;
  nome: string;
  categoria: string;
  subcategoria?: string | null;
  municipio: string;
  endereco: string;
  telefone?: string | null;
  whatsappSecretaria?: string | null;
  email?: string | null;
  valorParticular?: number | null;
  valorAssinanteVital?: number | null;
  tipoServico?: string | null;
}

/**
 * Calcula porcentagem de desconto
 */
function calcularDesconto(valorParticular?: number | null, valorVital?: number | null): string {
  if (!valorParticular || !valorVital) return '0%';
  const desconto = ((valorParticular - valorVital) / valorParticular) * 100;
  return `${desconto.toFixed(0)}%`;
}

/**
 * Formata valor monetário
 */
function formatarValor(valor?: number | null): string {
  if (!valor) return 'Não informado';
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

/**
 * Adiciona cabeçalho com logo e título
 */
function adicionarCabecalho(doc: jsPDF, titulo: string, subtitulo: string) {
  // Fundo turquesa no topo
  doc.setFillColor(VITAL_COLORS.turquoise);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Título em branco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 15, { align: 'center' });
  
  // Subtítulo em branco
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitulo, 105, 23, { align: 'center' });
  
  // Slogan
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Vital, sempre ao seu lado', 105, 30, { align: 'center' });
}

/**
 * Adiciona rodapé
 */
function adicionarRodape(doc: jsPDF, numeroPagina: number, totalPaginas: number) {
  const pageHeight = doc.internal.pageSize.height;
  
  // Linha decorativa
  doc.setDrawColor(VITAL_COLORS.turquoise);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 20, 190, pageHeight - 20);
  
  // Texto do rodapé
  doc.setTextColor(VITAL_COLORS.mediumGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Sua Saúde Vital - Vale do Itajaí - Santa Catarina',
    105,
    pageHeight - 15,
    { align: 'center' }
  );
  
  // Número da página
  doc.text(
    `Página ${numeroPagina} de ${totalPaginas}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
}

/**
 * Exporta lista de médicos em PDF
 */
export function exportarMedicosPDF(medicos: Medico[]) {
  const doc = new jsPDF();
  let yPos = 45;
  let numeroPagina = 1;
  const totalPaginas = Math.ceil(medicos.length / 3); // Aproximadamente 3 médicos por página
  
  adicionarCabecalho(doc, 'GUIA DE MÉDICOS CREDENCIADOS', 'Vale do Itajaí - Santa Catarina');
  
  medicos.forEach((medico, index) => {
    // Nova página se necessário
    if (yPos > 250) {
      adicionarRodape(doc, numeroPagina, totalPaginas);
      doc.addPage();
      numeroPagina++;
      adicionarCabecalho(doc, 'GUIA DE MÉDICOS CREDENCIADOS', 'Vale do Itajaí - Santa Catarina');
      yPos = 45;
    }
    
    // Card do médico com borda
    doc.setDrawColor(VITAL_COLORS.turquoise);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPos, 180, 55, 2, 2);
    
    // Nome do médico
    doc.setTextColor(VITAL_COLORS.turquoise);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(medico.nome, 20, yPos + 8);
    
    // Especialidade
    doc.setTextColor(VITAL_COLORS.darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Especialidade: ${medico.especialidade}`, 20, yPos + 15);
    
    // Área de atuação (se houver)
    if (medico.areaAtuacaoPrincipal) {
      doc.text(`Área de Atuação: ${medico.areaAtuacaoPrincipal}`, 20, yPos + 21);
    }
    
    // Município e endereço
    doc.setFontSize(9);
    doc.setTextColor(VITAL_COLORS.mediumGray);
    doc.text(`${medico.municipio} - ${medico.endereco}`, 20, yPos + 27);
    
    // Telefones
    const telefones = [];
    if (medico.telefone) telefones.push(`Tel: ${medico.telefone}`);
    if (medico.whatsappSecretaria) telefones.push(`WhatsApp: ${medico.whatsappSecretaria}`);
    if (telefones.length > 0) {
      doc.text(telefones.join(' | '), 20, yPos + 33);
    }
    
    // Valores e desconto (se houver)
    if (medico.valorParticular && medico.valorAssinanteVital) {
      const desconto = calcularDesconto(medico.valorParticular, medico.valorAssinanteVital);
      
      // Box de valores com fundo bege claro
      doc.setFillColor(250, 248, 245);
      doc.roundedRect(20, yPos + 38, 170, 12, 1, 1, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(VITAL_COLORS.darkGray);
      doc.setFont('helvetica', 'bold');
      doc.text(`Valor Particular: ${formatarValor(medico.valorParticular)}`, 25, yPos + 44);
      doc.text(`Valor Assinante Vital: ${formatarValor(medico.valorAssinanteVital)}`, 85, yPos + 44);
      
      doc.setTextColor(VITAL_COLORS.turquoise);
      doc.text(`Desconto: ${desconto}`, 155, yPos + 44);
    }
    
    yPos += 60;
  });
  
  adicionarRodape(doc, numeroPagina, totalPaginas);
  
  // Salvar PDF
  doc.save(`medicos-credenciados-vital-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Exporta lista de instituições/serviços em PDF
 */
export function exportarInstituicoesPDF(instituicoes: Instituicao[], tipoServico: string) {
  const doc = new jsPDF();
  let yPos = 45;
  let numeroPagina = 1;
  const totalPaginas = Math.ceil(instituicoes.length / 3);
  
  const tituloMap: Record<string, string> = {
    'servicos_saude': 'SERVIÇOS DE SAÚDE CREDENCIADOS',
    'outros_servicos': 'OUTROS SERVIÇOS CREDENCIADOS',
  };
  
  const titulo = tituloMap[tipoServico] || 'SERVIÇOS CREDENCIADOS';
  
  adicionarCabecalho(doc, titulo, 'Vale do Itajaí - Santa Catarina');
  
  instituicoes.forEach((instituicao, index) => {
    // Nova página se necessário
    if (yPos > 250) {
      adicionarRodape(doc, numeroPagina, totalPaginas);
      doc.addPage();
      numeroPagina++;
      adicionarCabecalho(doc, titulo, 'Vale do Itajaí - Santa Catarina');
      yPos = 45;
    }
    
    // Card da instituição com borda
    doc.setDrawColor(VITAL_COLORS.turquoise);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPos, 180, 55, 2, 2);
    
    // Nome da instituição
    doc.setTextColor(VITAL_COLORS.turquoise);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(instituicao.nome, 20, yPos + 8);
    
    // Categoria
    doc.setTextColor(VITAL_COLORS.darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Categoria: ${instituicao.categoria}`, 20, yPos + 15);
    
    // Subcategoria (se houver)
    if (instituicao.subcategoria) {
      doc.text(`Subcategoria: ${instituicao.subcategoria}`, 20, yPos + 21);
    }
    
    // Município e endereço
    doc.setFontSize(9);
    doc.setTextColor(VITAL_COLORS.mediumGray);
    doc.text(`${instituicao.municipio} - ${instituicao.endereco}`, 20, yPos + 27);
    
    // Telefones
    const telefones = [];
    if (instituicao.telefone) telefones.push(`Tel: ${instituicao.telefone}`);
    if (instituicao.whatsappSecretaria) telefones.push(`WhatsApp: ${instituicao.whatsappSecretaria}`);
    if (telefones.length > 0) {
      doc.text(telefones.join(' | '), 20, yPos + 33);
    }
    
    // Valores e desconto (se houver)
    if (instituicao.valorParticular && instituicao.valorAssinanteVital) {
      const desconto = calcularDesconto(instituicao.valorParticular, instituicao.valorAssinanteVital);
      
      // Box de valores com fundo bege claro
      doc.setFillColor(250, 248, 245);
      doc.roundedRect(20, yPos + 38, 170, 12, 1, 1, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(VITAL_COLORS.darkGray);
      doc.setFont('helvetica', 'bold');
      doc.text(`Valor Particular: ${formatarValor(instituicao.valorParticular)}`, 25, yPos + 44);
      doc.text(`Valor Assinante Vital: ${formatarValor(instituicao.valorAssinanteVital)}`, 85, yPos + 44);
      
      doc.setTextColor(VITAL_COLORS.turquoise);
      doc.text(`Desconto: ${desconto}`, 155, yPos + 44);
    }
    
    yPos += 60;
  });
  
  adicionarRodape(doc, numeroPagina, totalPaginas);
  
  // Salvar PDF
  const nomeArquivo = tipoServico === 'servicos_saude' 
    ? 'servicos-saude-credenciados-vital' 
    : 'outros-servicos-credenciados-vital';
  doc.save(`${nomeArquivo}-${new Date().toISOString().split('T')[0]}.pdf`);
}
