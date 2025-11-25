/**
 * Utilitários de validação de formulários
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida campos obrigatórios de médico
 */
export function validateMedicoForm(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nome || data.nome.trim() === "") {
    errors.push({ field: "nome", message: "Nome do médico é obrigatório" });
  }

  if (!data.municipio || data.municipio.trim() === "") {
    errors.push({ field: "municipio", message: "Município é obrigatório" });
  }

  if (!data.tipoAtendimento) {
    errors.push({ field: "tipoAtendimento", message: "Tipo de atendimento é obrigatório" });
  }

  if (!data.endereco || data.endereco.trim() === "") {
    errors.push({ field: "endereco", message: "Endereço é obrigatório" });
  }

  if (!data.whatsappSecretaria || data.whatsappSecretaria.trim() === "") {
    errors.push({ field: "whatsappSecretaria", message: "WhatsApp para agendamento é obrigatório" });
  }

  if (!data.fotoUrl || data.fotoUrl.trim() === "") {
    errors.push({ field: "fotoUrl", message: "Foto do médico é obrigatória" });
  }

  if (!data.whatsappParceria || data.whatsappParceria.trim() === "") {
    errors.push({ field: "whatsappParceria", message: "WhatsApp do responsável pela parceria é obrigatório" });
  }

  if (!data.contatoParceria || data.contatoParceria.trim() === "") {
    errors.push({ field: "contatoParceria", message: "Nome do responsável pela parceria é obrigatório" });
  }

  if (!data.valorParticular || data.valorParticular.trim() === "") {
    errors.push({ field: "valorParticular", message: "Valor particular é obrigatório" });
  }

  if (!data.valorAssinanteVital || data.valorAssinanteVital.trim() === "") {
    errors.push({ field: "valorAssinanteVital", message: "Valor assinante Vital é obrigatório" });
  }

  return errors;
}

/**
 * Valida campos obrigatórios de instituição
 */
export function validateInstituicaoForm(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nome || data.nome.trim() === "") {
    errors.push({ field: "nome", message: "Nome da instituição é obrigatório" });
  }

  if (!data.municipio || data.municipio.trim() === "") {
    errors.push({ field: "municipio", message: "Município é obrigatório" });
  }

  if (!data.tipoAtendimento) {
    errors.push({ field: "tipoAtendimento", message: "Tipo de atendimento é obrigatório" });
  }

  if (!data.endereco || data.endereco.trim() === "") {
    errors.push({ field: "endereco", message: "Endereço é obrigatório" });
  }

  if (!data.whatsappSecretaria || data.whatsappSecretaria.trim() === "") {
    errors.push({ field: "whatsappSecretaria", message: "WhatsApp para agendamento é obrigatório" });
  }

  if (!data.fotoUrl || data.fotoUrl.trim() === "") {
    errors.push({ field: "fotoUrl", message: "Foto da instituição é obrigatória" });
  }

  if (!data.whatsappParceria || data.whatsappParceria.trim() === "") {
    errors.push({ field: "whatsappParceria", message: "WhatsApp do responsável pela parceria é obrigatório" });
  }

  if (!data.contatoParceria || data.contatoParceria.trim() === "") {
    errors.push({ field: "contatoParceria", message: "Nome do responsável pela parceria é obrigatório" });
  }

  if (!data.valorParticular || data.valorParticular.trim() === "") {
    errors.push({ field: "valorParticular", message: "Valor particular é obrigatório" });
  }

  if (!data.valorAssinanteVital || data.valorAssinanteVital.trim() === "") {
    errors.push({ field: "valorAssinanteVital", message: "Valor assinante Vital é obrigatório" });
  }

  return errors;
}
