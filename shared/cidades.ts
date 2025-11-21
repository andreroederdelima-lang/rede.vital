/**
 * Lista de cidades foco para prospecção de parceiros
 * Meta: Pelo menos 2 credenciados de cada tipo em cada cidade
 */
export const CIDADES_FOCO = [
  "Rodeio",
  "Rio dos Cedros",
  "Benedito Novo",
  "Pomerode",
  "Ascurra",
  "Apiúna",
  "Timbó",
  "Indaial",
] as const;

export type CidadeFoco = typeof CIDADES_FOCO[number];

/**
 * Descrições das categorias de serviços
 */
export const CATEGORIAS_DESCRICAO = {
  medicos: {
    titulo: "Médicos",
    descricao: "Profissionais médicos de diversas especialidades",
    exemplos: ["Clínico Geral", "Cardiologista", "Pediatra", "Ortopedista", "Dermatologista"]
  },
  servicosSaude: {
    titulo: "Serviços de Saúde",
    descricao: "Clínicas, Fisioterapia, Fonoaudiologia, Nutricionista, Oxigenoterapia, Terapia Hiperbárica, Clínicas de Imagem, etc",
    exemplos: ["Clínicas Médicas", "Fisioterapia", "Fonoaudiologia", "Nutrição", "Clínicas de Imagem", "Laboratórios"]
  },
  outrosServicos: {
    titulo: "Outros Serviços",
    descricao: "Academias, Natação, Jiu-Jitsu, Artes Marciais, Farmácias, Mercados, Lojas de Roupas, Padarias, etc",
    exemplos: ["Academias", "Natação", "Artes Marciais", "Farmácias", "Mercados", "Padarias"]
  }
} as const;
