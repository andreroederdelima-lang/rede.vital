import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
) {
  // Criar array de dados com headers
  const headers = columns.map(col => col.header);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // Formatar valores especiais
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
      if (value instanceof Date) return value.toLocaleDateString('pt-BR');
      return String(value);
    })
  );

  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Definir larguras das colunas
  worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

  // Gerar arquivo e fazer download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

// Colunas para exportação de médicos
export const MEDICO_COLUMNS: ExportColumn[] = [
  { header: 'Nome', key: 'nome', width: 30 },
  { header: 'Especialidade', key: 'especialidade', width: 20 },
  { header: 'Subespecialidade', key: 'subespecialidade', width: 20 },
  { header: 'CRM/CRO', key: 'numeroRegistroConselho', width: 15 },
  { header: 'Município', key: 'municipio', width: 15 },
  { header: 'Endereço', key: 'endereco', width: 40 },
  { header: 'Telefone Fixo', key: 'telefone', width: 15 },
  { header: 'WhatsApp Secretária', key: 'whatsappSecretaria', width: 18 },
  { header: 'WhatsApp Responsável', key: 'whatsappParceria', width: 18 },
  { header: 'Nome Responsável', key: 'contatoParceria', width: 20 },
  { header: 'Valor Particular', key: 'valorParticular', width: 15 },
  { header: 'Valor Assinante', key: 'valorAssinanteVital', width: 15 },
  { header: 'Tipo Atendimento', key: 'tipoAtendimento', width: 15 },
  { header: 'Observações', key: 'observacoes', width: 30 },
];

// Colunas para exportação de instituições/serviços
export const INSTITUICAO_COLUMNS: ExportColumn[] = [
  { header: 'Nome', key: 'nome', width: 30 },
  { header: 'Tipo Serviço', key: 'tipoServico', width: 15 },
  { header: 'Categoria', key: 'categoria', width: 20 },
  { header: 'Subcategoria', key: 'subcategoria', width: 20 },
  { header: 'Município', key: 'municipio', width: 15 },
  { header: 'Endereço', key: 'endereco', width: 40 },
  { header: 'Telefone Fixo', key: 'telefone', width: 15 },
  { header: 'WhatsApp Comercial', key: 'whatsappSecretaria', width: 18 },
  { header: 'WhatsApp Responsável', key: 'whatsappParceria', width: 18 },
  { header: 'Nome Responsável', key: 'contatoParceria', width: 20 },
  { header: 'E-mail', key: 'email', width: 25 },
  { header: 'Valor Particular', key: 'valorParticular', width: 15 },
  { header: 'Valor Assinante', key: 'valorAssinanteVital', width: 15 },
  { header: 'Observações', key: 'observacoes', width: 30 },
];
