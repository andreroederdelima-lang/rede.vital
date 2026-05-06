import type { Medico, Instituicao } from "../../drizzle/schema";

/**
 * Campos sensíveis que só devem trafegar no payload quando o consumidor é interno
 * (vendedor logado em /dados-internos ou admin via OAuth). Clientes públicos
 * recebem esses campos como `undefined`.
 */
const CAMPOS_SENSIVEIS_MEDICO = [
  "precoConsulta",
  "valorParticular",
  "valorAssinanteVital",
  "descontoPercentual",
  "observacoes",
  "contatoParceria",
  "whatsappParceria",
  "telefoneOrganizacao",
  "tokenAtualizacao",
  "email",
] as const;

const CAMPOS_SENSIVEIS_INSTITUICAO = [
  "precoConsulta",
  "valorParticular",
  "valorAssinanteVital",
  "descontoPercentual",
  "observacoes",
  "contatoParceria",
  "whatsappParceria",
  "telefoneOrganizacao",
  "tokenAtualizacao",
  "email",
] as const;

export function sanitizarMedico<T extends Partial<Medico>>(medico: T, isInterno: boolean): T {
  if (isInterno) return medico;
  const clone: any = { ...medico };
  for (const campo of CAMPOS_SENSIVEIS_MEDICO) {
    delete clone[campo];
  }
  return clone;
}

export function sanitizarInstituicao<T extends Partial<Instituicao>>(inst: T, isInterno: boolean): T {
  if (isInterno) return inst;
  const clone: any = { ...inst };
  for (const campo of CAMPOS_SENSIVEIS_INSTITUICAO) {
    delete clone[campo];
  }
  // descontoGeral permanece visível (é o que o cliente assinante pode enxergar na vitrine)
  return clone;
}

export function sanitizarProcedimento<T extends { valorParticular?: unknown; valorAssinanteVital?: unknown; valorAssinante?: unknown }>(
  proc: T,
  isInterno: boolean
): T {
  if (isInterno) return proc;
  const clone: any = { ...proc };
  delete clone.valorParticular;
  delete clone.valorAssinanteVital;
  delete clone.valorAssinante;
  return clone;
}
