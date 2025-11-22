import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  subespecialidade: varchar("subespecialidade", { length: 255 }),
  municipio: varchar("municipio", { length: 100 }).notNull(),
  endereco: text("endereco").notNull(),
  telefone: varchar("telefone", { length: 100 }),
  whatsapp: varchar("whatsapp", { length: 100 }),
  whatsappSecretaria: varchar("whatsappSecretaria", { length: 100 }),
  telefoneOrganizacao: varchar("telefoneOrganizacao", { length: 100 }),
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  tipoAtendimento: mysqlEnum("tipoAtendimento", ["presencial", "telemedicina", "ambos"]).default("presencial").notNull(),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull().default(0),
  observacoes: text("observacoes"),
  contatoParceria: varchar("contatoParceria", { length: 255 }),
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
  whatsappSecretaria: varchar("whatsappSecretaria", { length: 100 }),
  telefoneOrganizacao: varchar("telefoneOrganizacao", { length: 100 }),
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  email: varchar("email", { length: 255 }),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull().default(0),
  observacoes: text("observacoes"),
  contatoParceria: varchar("contatoParceria", { length: 255 }),
  tokenAtualizacao: varchar("tokenAtualizacao", { length: 64 }).unique(),
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Instituicao = typeof instituicoes.$inferSelect;
export type InsertInstituicao = typeof instituicoes.$inferInsert;

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
  endereco: text("endereco").notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  telefone: varchar("telefone", { length: 100 }).notNull(),
  precoConsulta: varchar("precoConsulta", { length: 50 }).notNull(),
  descontoPercentual: int("descontoPercentual").notNull(),
  imagemUrl: text("imagemUrl"),
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
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  email: varchar("email", { length: 255 }),
  endereco: text("endereco"),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
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

export const indicadores = mysqlTable("indicadores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  pix: varchar("pix", { length: 255 }),
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  comissaoPercentual: int("comissaoPercentual"), // Armazenado como inteiro (ex: 1000 = 10.00%)
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const indicacoes = mysqlTable("indicacoes", {
  id: int("id").autoincrement().primaryKey(),
  indicadorId: int("indicadorId").notNull(), // FK para indicadores
  nomeCliente: varchar("nomeCliente", { length: 255 }).notNull(),
  emailCliente: varchar("emailCliente", { length: 320 }),
  telefoneCliente: varchar("telefoneCliente", { length: 20 }).notNull(),
  cidadeCliente: varchar("cidadeCliente", { length: 100 }),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "contatado", "em_negociacao", "fechado", "perdido"]).default("pendente").notNull(),
  vendedorId: int("vendedorId"), // FK para indicadores (vendedor responsável)
  valorVenda: int("valorVenda"), // Armazenado em centavos (ex: 10000 = R$ 100,00)
  valorComissao: int("valorComissao"), // Armazenado em centavos
  dataPagamento: timestamp("dataPagamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const comissoes = mysqlTable("comissoes", {
  id: int("id").autoincrement().primaryKey(),
  indicacaoId: int("indicacaoId").notNull(), // FK para indicacoes
  indicadorId: int("indicadorId").notNull(), // FK para indicadores
  valor: int("valor").notNull(), // Armazenado em centavos
  status: mysqlEnum("status", ["pendente", "pago", "cancelado"]).default("pendente").notNull(),
  dataPagamento: timestamp("dataPagamento"),
  comprovante: varchar("comprovante", { length: 500 }), // URL do comprovante
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Indicador = typeof indicadores.$inferSelect;
export type InsertIndicador = typeof indicadores.$inferInsert;

export type Indicacao = typeof indicacoes.$inferSelect;
export type InsertIndicacao = typeof indicacoes.$inferInsert;

export type Comissao = typeof comissoes.$inferSelect;
export type InsertComissao = typeof comissoes.$inferInsert;

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
