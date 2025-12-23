/**
 * Categorias organizadas por tipo de serviço
 * Baseado na estrutura completa fornecida
 */

// Serviços de Saúde - Categorias principais
export const CATEGORIAS_SERVICOS_SAUDE = [
  // Odontologia
  { value: "Odontologia", label: "Odontologia" },
  { value: "Odontopediatria", label: "Odontopediatria" },
  { value: "Ortodontia", label: "Ortodontia" },
  { value: "Endodontia", label: "Endodontia" },
  { value: "Periodontia", label: "Periodontia" },
  { value: "Implantodontia", label: "Implantodontia" },
  { value: "Prótese Dentária", label: "Prótese Dentária" },
  { value: "Clínica de Saúde Bucal", label: "Clínica de Saúde Bucal" },
  
  // Fisioterapia
  { value: "Fisioterapia", label: "Fisioterapia" },
  { value: "Fisioterapia Ortopédica", label: "Fisioterapia Ortopédica" },
  { value: "Fisioterapia Neurofuncional", label: "Fisioterapia Neurofuncional" },
  { value: "Fisioterapia Respiratória", label: "Fisioterapia Respiratória" },
  { value: "Fisioterapia Desportiva", label: "Fisioterapia Desportiva" },
  { value: "Fisioterapia Pélvica", label: "Fisioterapia Pélvica" },
  
  // Fonoaudiologia
  { value: "Fonoaudiologia", label: "Fonoaudiologia" },
  { value: "Audiologia", label: "Audiologia" },
  
  // Nutrição
  { value: "Nutrição", label: "Nutrição" },
  { value: "Nutrição Esportiva", label: "Nutrição Esportiva" },
  { value: "Nutrição Clínica", label: "Nutrição Clínica" },
  
  // Psicologia
  { value: "Psicologia", label: "Psicologia" },
  { value: "Psicologia Infantil", label: "Psicologia Infantil" },
  { value: "Psicologia Organizacional", label: "Psicologia Organizacional" },
  
  // Outros Profissionais de Saúde
  { value: "Terapia Ocupacional", label: "Terapia Ocupacional" },
  { value: "Enfermagem", label: "Enfermagem" },
  { value: "Cuidados de Enfermagem Domiciliar", label: "Cuidados de Enfermagem Domiciliar" },
  { value: "Biomedicina", label: "Biomedicina" },
  { value: "Biomedicina Estética", label: "Biomedicina Estética" },
  
  // Farmácia
  { value: "Farmácia Clínica", label: "Farmácia Clínica" },
  { value: "Farmácia de Manipulação", label: "Farmácia de Manipulação" },
  
  // Laboratório e Exames
  { value: "Laboratório de Análises Clínicas", label: "Laboratório de Análises Clínicas" },
  { value: "Coleta Laboratorial", label: "Coleta Laboratorial" },
  { value: "Radiologia", label: "Radiologia" },
  { value: "Raios X", label: "Raios X" },
  { value: "Ultrassonografia", label: "Ultrassonografia" },
  { value: "Mamografia", label: "Mamografia" },
  { value: "Tomografia Computadorizada", label: "Tomografia Computadorizada" },
  { value: "Ressonância Magnética", label: "Ressonância Magnética" },
  { value: "Densitometria Óssea", label: "Densitometria Óssea" },
  
  // Vacinação
  { value: "Clínica de Vacinação", label: "Clínica de Vacinação" },
  { value: "Imunização Domiciliar", label: "Imunização Domiciliar" },
  
  // Clínicas
  { value: "Clínica de Multiespecialidades", label: "Clínica de Multiespecialidades" },
  { value: "Clínica Médica", label: "Clínica Médica" },
  
  // Outros
  { value: "Banco de Sangue / Hemoterapia", label: "Banco de Sangue / Hemoterapia" },
  { value: "Ótica", label: "Ótica" },
  { value: "Fisiatria / Reabilitação Física", label: "Fisiatria / Reabilitação Física" },
  
  // Terapias Complementares
  { value: "Pilates", label: "Pilates" },
  { value: "Pilates Clínico", label: "Pilates Clínico" },
  { value: "Acupuntura", label: "Acupuntura" },
  { value: "Quiropraxia", label: "Quiropraxia" },
  { value: "Osteopatia", label: "Osteopatia" },
  { value: "RPG – Reeducação Postural Global", label: "RPG – Reeducação Postural Global" },
  { value: "Massoterapia", label: "Massoterapia" },
  { value: "Drenagem Linfática", label: "Drenagem Linfática" },
  { value: "Ventosaterapia", label: "Ventosaterapia" },
  { value: "Auriculoterapia", label: "Auriculoterapia" },
  { value: "Reflexologia", label: "Reflexologia" },
  { value: "Yoga Terapêutica", label: "Yoga Terapêutica" },
  { value: "Meditação Guiada", label: "Meditação Guiada" },
] as const;

// Outros Serviços - Categorias principais
export const CATEGORIAS_OUTROS_SERVICOS = [
  // Alimentação
  { value: "Padarias", label: "Padarias" },
  { value: "Confeitarias", label: "Confeitarias" },
  { value: "Cafeterias", label: "Cafeterias" },
  { value: "Mercados", label: "Mercados" },
  { value: "Supermercados", label: "Supermercados" },
  { value: "Hortifrutis", label: "Hortifrutis" },
  { value: "Açougues", label: "Açougues" },
  { value: "Restaurantes", label: "Restaurantes" },
  { value: "Lanchonetes", label: "Lanchonetes" },
  { value: "Pizzarias", label: "Pizzarias" },
  { value: "Marmitarias", label: "Marmitarias" },
  
  // Fitness e Esportes
  { value: "Academias", label: "Academias" },
  { value: "Centros de Treinamento Funcional", label: "Centros de Treinamento Funcional" },
  { value: "Box de CrossFit", label: "Box de CrossFit" },
  { value: "Estúdios de Musculação", label: "Estúdios de Musculação" },
  { value: "Natação", label: "Natação" },
  { value: "Escolas de Natação", label: "Escolas de Natação" },
  { value: "Artes Marciais", label: "Artes Marciais" },
  { value: "Jiu-jitsu", label: "Jiu-jitsu" },
  { value: "Judô", label: "Judô" },
  { value: "Muay Thai", label: "Muay Thai" },
  { value: "Karate", label: "Karate" },
  { value: "Taekwondo", label: "Taekwondo" },
  { value: "Estúdios de Pilates (não clínico)", label: "Estúdios de Pilates (não clínico)" },
  { value: "Estúdios de Yoga", label: "Estúdios de Yoga" },
  
  // Beleza e Estética
  { value: "Barbearias", label: "Barbearias" },
  { value: "Salões de Beleza", label: "Salões de Beleza" },
  { value: "Clínicas de Estética / Spa Urbano", label: "Clínicas de Estética / Spa Urbano" },
  
  // Pet
  { value: "Petshops", label: "Petshops" },
  { value: "Banho e Tosa", label: "Banho e Tosa" },
  { value: "Clínicas de Estética Animal", label: "Clínicas de Estética Animal" },
  
  // Automotivo
  { value: "Serviços Automotivos", label: "Serviços Automotivos" },
  { value: "Lavação de veículos", label: "Lavação de veículos" },
  { value: "Troca de óleo / mecânica rápida", label: "Troca de óleo / mecânica rápida" },
  
  // Transporte
  { value: "Serviços de Táxi / Transporte", label: "Serviços de Táxi / Transporte" },
  { value: "Mototáxi / Entregas", label: "Mototáxi / Entregas" },
  
  // Varejo
  { value: "Papelarias", label: "Papelarias" },
  { value: "Lojas de Utilidades / Variedades", label: "Lojas de Utilidades / Variedades" },
  { value: "Lojas de Artigos Esportivos", label: "Lojas de Artigos Esportivos" },
  { value: "Lojas de Roupas e Calçados", label: "Lojas de Roupas e Calçados" },
  
  // Hospedagem
  { value: "Hotéis / Pousadas", label: "Hotéis / Pousadas" },
] as const;

// Helper para obter todas as categorias por tipo de serviço
export function getCategoriasPorTipo(tipoServico: "servicos_saude" | "outros_servicos") {
  return tipoServico === "servicos_saude" 
    ? CATEGORIAS_SERVICOS_SAUDE 
    : CATEGORIAS_OUTROS_SERVICOS;
}

// Helper para buscar label de uma categoria
export function getLabelCategoria(categoria: string, tipoServico: "servicos_saude" | "outros_servicos") {
  const categorias = getCategoriasPorTipo(tipoServico);
  const found = categorias.find(c => c.value === categoria);
  return found?.label || categoria;
}
