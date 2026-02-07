import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Optional for email/password users. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for email/password authentication. Optional for OAuth users. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Token for password reset. Expires after use or timeout. */
  resetToken: varchar("resetToken", { length: 64 }).unique(),
  /** Expiry timestamp for password reset token. */
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de médicos credenciados
 */
export const medicos = mysqlTable("medicos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  especialidade: varchar("especialidade", { length: 255 }).notNull(),
  numeroRegistroConselho: varchar("numeroRegistroConselho", { length: 100 }), // CRM, CRO, etc
  subespecialidade: varchar("subespecialidade", { length: 255 }),
  areaAtuacao: varchar("areaAtuacao", { length: 500 }), // Área de atuação principal (ex: "foco em saúde mental")
  municipio: varchar("municipio", { length: 100 }).notNull(),
  endereco: text("endereco").notNull(),
  telefone: varchar("telefone", { length: 100 }),
  whatsapp: varchar("whatsapp", { length: 100 }), // WhatsApp Comercial/Agendamento
  whatsappSecretaria: varchar("whatsappSecretaria", { length: 100 }),
  telefoneOrganizacao: varchar("telefoneOrganizacao", { length: 100 }),
  email: varchar("email", { length: 255 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  tipoAtendimento: mysqlEnum("tipoAtendimento", ["presencial", "telemedicina", "ambos"]).default("presencial").notNull(),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  valorParticular: varchar("valorParticular", { length: 50 }),
  valorAssinanteVital: varchar("valorAssinanteVital", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull().default(0),
  observacoes: text("observacoes"),
  contatoParceria: varchar("contatoParceria", { length: 255 }), // Nome do responsável pela parceria
  whatsappParceria: varchar("whatsappParceria", { length: 100 }), // WhatsApp do responsável pela parceria
  tokenAtualizacao: varchar("tokenAtualizacao", { length: 64 }).unique(),
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Medico = typeof medicos.$inferSelect;
export type InsertMedico = typeof medicos.$inferInsert;

/**
 * Tabela de instituições parceiras (clínicas, farmácias, laboratórios, academias, etc)
 */
export const instituicoes = mysqlTable("instituicoes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipoServico: mysqlEnum("tipoServico", ["servicos_saude", "outros_servicos"]).default("servicos_saude").notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(), // Categoria livre para flexibilidade
  subcategoria: varchar("subcategoria", { length: 100 }), // Subcategoria específica (ex: Fisioterapia Ortopédica)
  municipio: varchar("municipio", { length: 100 }).notNull(),
  endereco: text("endereco").notNull(),
  telefone: varchar("telefone", { length: 100 }),
  whatsappSecretaria: varchar("whatsappSecretaria", { length: 100 }), // WhatsApp Comercial/Agendamento
  telefoneOrganizacao: varchar("telefoneOrganizacao", { length: 100 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  email: varchar("email", { length: 255 }),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  valorParticular: varchar("valorParticular", { length: 50 }),
  valorAssinanteVital: varchar("valorAssinanteVital", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull().default(0),
  descontoGeral: int("descontoGeral"), // Desconto percentual geral para estabelecimentos com produtos variados (óticas, farmácias)
  observacoes: text("observacoes"),
  contatoParceria: varchar("contatoParceria", { length: 255 }), // Nome do responsável pela parceria
  whatsappParceria: varchar("whatsappParceria", { length: 100 }), // WhatsApp do responsável pela parceria
  tokenAtualizacao: varchar("tokenAtualizacao", { length: 64 }).unique(),
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Instituicao = typeof instituicoes.$inferSelect;
export type InsertInstituicao = typeof instituicoes.$inferInsert;

/**
 * Tabela de procedimentos/serviços oferecidos por instituições
 */
export const procedimentosInstituicao = mysqlTable("procedimentosInstituicao", {
  id: int("id").autoincrement().primaryKey(),
  instituicaoId: int("instituicaoId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(), // Nome do procedimento/serviço
  valorParticular: decimal("valorParticular", { precision: 10, scale: 2 }), // Valor para não-assinantes
  valorAssinante: decimal("valorAssinante", { precision: 10, scale: 2 }), // Valor para assinantes Vital
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcedimentoInstituicao = typeof procedimentosInstituicao.$inferSelect;
export type InsertProcedimentoInstituicao = typeof procedimentosInstituicao.$inferInsert;

/**
 * Tabela de procedimentos/serviços vinculados a solicitações de parceria (antes da aprovação)
 */
export const procedimentosSolicitacao = mysqlTable("procedimentosSolicitacao", {
  id: int("id").autoincrement().primaryKey(),
  solicitacaoId: int("solicitacaoId").notNull(), // ID da solicitação de parceria
  nome: varchar("nome", { length: 255 }).notNull(), // Nome do procedimento/serviço
  valorParticular: decimal("valorParticular", { precision: 10, scale: 2 }), // Valor para não-assinantes
  valorAssinante: decimal("valorAssinante", { precision: 10, scale: 2 }), // Valor para assinantes Vital
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcedimentoSolicitacao = typeof procedimentosSolicitacao.$inferSelect;
export type InsertProcedimentoSolicitacao = typeof procedimentosSolicitacao.$inferInsert;

/**
 * Tabela de solicitações de parceria (aguardando aprovação)
 */
export const solicitacoesParceria = mysqlTable("solicitacoesParceria", {
  id: int("id").autoincrement().primaryKey(),
  tipoCredenciado: mysqlEnum("tipoCredenciado", ["medico", "instituicao"]).default("instituicao").notNull(),
  nomeResponsavel: varchar("nomeResponsavel", { length: 255 }).notNull(),
  nomeEstabelecimento: varchar("nomeEstabelecimento", { length: 255 }).notNull(),
  tipoServico: mysqlEnum("tipoServico", ["servicos_saude", "outros_servicos"]),
  categoria: varchar("categoria", { length: 255 }).notNull(),
  especialidade: varchar("especialidade", { length: 255 }),
  areaAtuacao: varchar("areaAtuacao", { length: 255 }),
  numeroRegistroConselho: varchar("numeroRegistroConselho", { length: 100 }),
  tipoAtendimento: mysqlEnum("tipoAtendimento", ["presencial", "telemedicina", "ambos"]).default("presencial").notNull(),
  endereco: text("endereco").notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  telefone: varchar("telefone", { length: 100 }),
  whatsappSecretaria: varchar("whatsappSecretaria", { length: 100 }),
  email: varchar("email", { length: 255 }),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  valorParticular: varchar("valorParticular", { length: 50 }),
  valorAssinanteVital: varchar("valorAssinanteVital", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull(),
  logoUrl: text("logoUrl"),
  fotoUrl: text("fotoUrl"),
  contatoParceria: varchar("contatoParceria", { length: 255 }),
  whatsappParceria: varchar("whatsappParceria", { length: 100 }),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  motivoRejeicao: text("motivoRejeicao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SolicitacaoParceria = typeof solicitacoesParceria.$inferSelect;
export type InsertSolicitacaoParceria = typeof solicitacoesParceria.$inferInsert;

/**
 * Tabela de usuários autorizados a acessar área /dados-internos
 */
export const usuariosAutorizados = mysqlTable("usuariosAutorizados", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  nome: varchar("nome", { length: 255 }).notNull(),
  senhaHash: varchar("senhaHash", { length: 255 }).notNull(),
  nivelAcesso: mysqlEnum("nivelAcesso", ["admin", "visualizador"]).default("visualizador").notNull(),
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsuarioAutorizado = typeof usuariosAutorizados.$inferSelect;
export type InsertUsuarioAutorizado = typeof usuariosAutorizados.$inferInsert;
/**
 * Tabela de solicitações de atualização de dados pelos parceiros
 */
export const solicitacoesAtualizacao = mysqlTable("solicitacoesAtualizacao", {
  id: int("id").autoincrement().primaryKey(),
  tipoCredenciado: mysqlEnum("tipoCredenciado", ["medico", "instituicao"]).notNull(),
  credenciadoId: int("credenciadoId").notNull(),
  // Dados atualizados
  telefone: varchar("telefone", { length: 100 }),
  whatsapp: varchar("whatsapp", { length: 100 }),
  whatsappSecretaria: varchar("whatsappSecretaria", { length: 100 }),
  telefoneOrganizacao: varchar("telefoneOrganizacao", { length: 100 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  email: varchar("email", { length: 255 }),
  endereco: text("endereco"),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  valorParticular: varchar("valorParticular", { length: 50 }),
  valorAssinanteVital: varchar("valorAssinanteVital", { length: 50 }),
  descontoPercentual: int("descontoPercentual"),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  motivoRejeicao: text("motivoRejeicao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SolicitacaoAtualizacao = typeof solicitacoesAtualizacao.$inferSelect;
export type InsertSolicitacaoAtualizacao = typeof solicitacoesAtualizacao.$inferInsert;

/**
 * Tabela de solicitações de acesso à área Dados Internos
 */
export const solicitacoesAcesso = mysqlTable("solicitacoesAcesso", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 100 }),
  justificativa: text("justificativa").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  motivoRejeicao: text("motivoRejeicao"),
  senhaTemporaria: varchar("senhaTemporaria", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SolicitacaoAcesso = typeof solicitacoesAcesso.$inferSelect;
export type InsertSolicitacaoAcesso = typeof solicitacoesAcesso.$inferInsert;

/**
 * Tabela de tokens para recuperação de senha
 */
export const tokensRecuperacao = mysqlTable("tokensRecuperacao", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usado: int("usado").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenRecuperacao = typeof tokensRecuperacao.$inferSelect;
export type InsertTokenRecuperacao = typeof tokensRecuperacao.$inferInsert;


// Tabelas do Sistema de Indicações

// [REMOVIDO] Tabela de indicadores removida
// export const indicadores = mysqlTable("indicadores", { ... });

// [REMOVIDO] Tabela de indicações removida
// export const indicacoes = mysqlTable("indicacoes", { ... });

// [REMOVIDO] Tabela de comissões removida
// export const comissoes = mysqlTable("comissoes", { ... });

// [REMOVIDO] Tipos de indicações removidos
// export type Indicador = ...
// export type Indicacao = ...
// export type Comissao = ...

// Tabela de configurações do sistema
export const configuracoes = mysqlTable("configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(), // Ex: "comissao_promotor", "comissao_vendedor"
  valor: text("valor").notNull(), // Valor em JSON ou string
  descricao: text("descricao"), // Descrição da configuração
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: varchar("updatedBy", { length: 255 }), // Quem alterou por último
});

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = typeof configuracoes.$inferInsert;

// [REMOVIDO] Tabela de comissões por assinatura removida
// export const comissoesAssinaturas = mysqlTable("comissoesAssinaturas", { ... });
// export type ComissaoAssinatura = ...
// export type InsertComissaoAssinatura = ...


/**
 * Tabela de Termos de Uso
 */
export const termosUso = mysqlTable("termosUso", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["plataforma", "prestadores_saude"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  versao: varchar("versao", { length: 20 }).notNull(), // Ex: "1.0", "1.1", "2.0"
  ativo: int("ativo").default(1).notNull(), // 1 = versão ativa, 0 = versão antiga
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TermoUso = typeof termosUso.$inferSelect;
export type InsertTermoUso = typeof termosUso.$inferInsert;

/**
 * Tabela de Aceites de Termos de Uso
 * Registra quando e quem aceitou cada termo para rastreabilidade
 */
export const aceitesTermos = mysqlTable("aceitesTermos", {
  id: int("id").autoincrement().primaryKey(),
  solicitacaoParceriaId: int("solicitacaoParceriaId"), // FK para solicitacoesParceria
  termoUsoId: int("termoUsoId").notNull(), // FK para termosUso
  tipoTermo: mysqlEnum("tipoTermo", ["plataforma", "prestadores_saude"]).notNull(),
  versaoTermo: varchar("versaoTermo", { length: 20 }).notNull(),
  ipAceite: varchar("ipAceite", { length: 45 }), // Suporta IPv4 e IPv6
  userAgent: text("userAgent"), // Informações do navegador
  dataAceite: timestamp("dataAceite").defaultNow().notNull(),
});

export type AceiteTermo = typeof aceitesTermos.$inferSelect;
export type InsertAceiteTermo = typeof aceitesTermos.$inferInsert;


// [REMOVIDO] Tabela de materiais de divulgação removida
// export const materiaisDivulgacao = mysqlTable("materiaisDivulgacao", { ... });
// export type MaterialDivulgacao = ...
// export type InsertMaterialDivulgacao = ...

/**
 * Tabela de templates de mensagens WhatsApp
 */
export const templatesWhatsapp = mysqlTable("templatesWhatsapp", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["cliente", "parceiro", "comercial"]).notNull(),
  mensagem: text("mensagem").notNull(),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemplateWhatsapp = typeof templatesWhatsapp.$inferSelect;
export type InsertTemplateWhatsapp = typeof templatesWhatsapp.$inferInsert;

/**
 * Tabela de copys (textos) editáveis para materiais de divulgação
 */
export const copys = mysqlTable("copys", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  categoria: mysqlEnum("categoria", ["planos", "promocoes", "outros"]).default("outros").notNull(),
  ordem: int("ordem").default(0).notNull(), // Para ordenação na interface
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: varchar("updatedBy", { length: 255 }), // Quem alterou por último
});

export type Copy = typeof copys.$inferSelect;
export type InsertCopy = typeof copys.$inferInsert;

/**
 * Tabela de avaliações de credenciados
 * Feedback dos assinantes sobre atendimento e qualidade dos parceiros
 * Visível apenas para administradores
 */
export const avaliacoes = mysqlTable("avaliacoes", {
  id: int("id").autoincrement().primaryKey(),
  tipoCredenciado: mysqlEnum("tipoCredenciado", ["medico", "instituicao"]).notNull(),
  credenciadoId: int("credenciadoId").notNull(), // ID do médico ou instituição
  nomeCredenciado: varchar("nomeCredenciado", { length: 255 }).notNull(), // Nome para facilitar consultas
  nota: int("nota").notNull(), // 1 a 5 estrelas
  comentario: text("comentario"),
  nomeAvaliador: varchar("nomeAvaliador", { length: 255 }), // Opcional
  emailAvaliador: varchar("emailAvaliador", { length: 320 }), // Opcional
  telefoneAvaliador: varchar("telefoneAvaliador", { length: 100 }), // Opcional
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Avaliacao = typeof avaliacoes.$inferSelect;
export type InsertAvaliacao = typeof avaliacoes.$inferInsert;


/**
 * Tabela de tokens para links de atualização e cadastro
 * Permite que credenciados atualizem seus dados ou novos médicos se cadastrem
 */
export const tokens = mysqlTable("tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(), // Token único gerado
  tipo: mysqlEnum("tipo", ["atualizacao", "cadastro"]).notNull(), // Tipo de operação
  tipoCredenciado: mysqlEnum("tipoCredenciado", ["medico", "instituicao"]).notNull(),
  credenciadoId: int("credenciadoId"), // NULL para cadastro de novo credenciado
  email: varchar("email", { length: 320 }), // Email do destinatário
  telefone: varchar("telefone", { length: 100 }), // Telefone do destinatário
  usado: int("usado").default(0).notNull(), // 0 = não usado, 1 = usado
  expiresAt: timestamp("expiresAt").notNull(), // Data de expiração
  usadoEm: timestamp("usadoEm"), // Quando foi usado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 255 }), // Quem gerou o token
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

/**
 * Tabela de procedimentos oferecidos por instituições
 * Ex: Endoscopia, Colonoscopia, Ultrassom, etc.
 */
export const procedimentos = mysqlTable("procedimentos", {
  id: int("id").autoincrement().primaryKey(),
  instituicaoId: int("instituicaoId").notNull(), // FK para instituicoes
  nome: varchar("nome", { length: 255 }).notNull(), // Nome do procedimento
  valorParticular: varchar("valorParticular", { length: 50 }), // Valor para não-assinantes
  valorAssinanteVital: varchar("valorAssinanteVital", { length: 50 }), // Valor para assinantes Vital
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Procedimento = typeof procedimentos.$inferSelect;
export type InsertProcedimento = typeof procedimentos.$inferInsert;

/**
 * Tabela de API Keys para integração externa
 * Permite que outras plataformas acessem dados dos credenciados via API REST
 */
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(), // Nome do cliente (ex: "Plataforma Cartão Benefícios")
  apiKey: varchar("apiKey", { length: 64 }).notNull().unique(), // Chave gerada (UUID)
  ativa: int("ativa").default(1).notNull(), // 0 = desativada, 1 = ativa
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"), // Última vez que foi usada
  requestCount: int("requestCount").default(0).notNull(), // Contador de requisições
  createdBy: varchar("createdBy", { length: 255 }), // Quem criou a API Key
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Tabela de logs de acesso à API
 * Registra todas as requisições feitas via API Keys
 */
export const apiLogs = mysqlTable("apiLogs", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("apiKeyId").notNull(), // FK para apiKeys
  endpoint: varchar("endpoint", { length: 255 }).notNull(), // Ex: "/api/public/credenciados/medicos"
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, etc
  statusCode: int("statusCode").notNull(), // 200, 404, 500, etc
  responseTime: int("responseTime").notNull(), // Em milissegundos
  queryParams: text("queryParams"), // JSON com parâmetros da query
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 ou IPv6
  userAgent: text("userAgent"), // User agent do cliente
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = typeof apiLogs.$inferInsert;

/**
 * Tabela de Webhooks configurados
 * Permite notificar plataformas externas sobre atualizações
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("apiKeyId").notNull(), // FK para apiKeys
  nome: varchar("nome", { length: 255 }).notNull(), // Nome descritivo
  url: varchar("url", { length: 500 }).notNull(), // URL do webhook
  eventos: text("eventos").notNull(), // JSON array: ["medico.criado", "medico.atualizado", "instituicao.criada", "instituicao.atualizada"]
  ativo: int("ativo").default(1).notNull(), // 0 = desativado, 1 = ativo
  secret: varchar("secret", { length: 64 }), // Secret para validação HMAC
  maxRetries: int("maxRetries").default(3).notNull(), // Número máximo de tentativas
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Tabela de logs de disparos de webhooks
 * Registra todas as tentativas de envio
 */
export const webhookLogs = mysqlTable("webhookLogs", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").notNull(), // FK para webhooks
  evento: varchar("evento", { length: 100 }).notNull(), // Ex: "medico.criado"
  payload: text("payload").notNull(), // JSON com dados enviados
  statusCode: int("statusCode"), // HTTP status code da resposta
  responseBody: text("responseBody"), // Corpo da resposta
  erro: text("erro"), // Mensagem de erro se houver
  tentativa: int("tentativa").default(1).notNull(), // Número da tentativa (1, 2, 3...)
  sucesso: int("sucesso").default(0).notNull(), // 0 = falha, 1 = sucesso
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

/**
 * Tabela de sugestões de parceiros
 * Armazena indicações de novos parceiros feitas por pacientes ou equipe
 */
export const sugestoesParceiros = mysqlTable("sugestoesParceiros", {
  id: int("id").autoincrement().primaryKey(),
  nomeParceiro: varchar("nomeParceiro", { length: 255 }).notNull(),
  especialidade: varchar("especialidade", { length: 255 }).notNull(), // Categoria ou especialidade
  municipio: varchar("municipio", { length: 100 }).notNull(),
  telefone: varchar("telefone", { length: 100 }), // Telefone de contato se fornecido
  email: varchar("email", { length: 320 }), // Email se fornecido
  observacoes: text("observacoes"), // Observações ou motivo da indicação
  status: mysqlEnum("status", [
    "pendente",
    "em_contato",
    "link_enviado",
    "aguardando_cadastro",
    "cadastrado",
    "nao_interessado",
    "retomar_depois"
  ]).default("pendente").notNull(),
  notas: text("notas"), // Notas internas sobre contatos e interações
  ultimoContato: timestamp("ultimoContato"), // Data do último contato realizado
  responsavel: varchar("responsavel", { length: 255 }), // Quem está cuidando dessa indicação
  indicadoPor: varchar("indicadoPor", { length: 255 }), // Nome de quem indicou (se disponível)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SugestaoParceiro = typeof sugestoesParceiros.$inferSelect;
export type InsertSugestaoParceiro = typeof sugestoesParceiros.$inferInsert;
