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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
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
  tipoAtendimento: mysqlEnum("tipoAtendimento", ["presencial", "telemedicina", "ambos"]).default("presencial").notNull(),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull().default(0),
  observacoes: text("observacoes"),
  contatoParceria: varchar("contatoParceria", { length: 255 }),
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
  categoria: mysqlEnum("categoria", ["clinica", "farmacia", "laboratorio", "academia", "hospital", "outro"]).notNull(),
  municipio: varchar("municipio", { length: 100 }).notNull(),
  endereco: text("endereco").notNull(),
  telefone: varchar("telefone", { length: 100 }),
  email: varchar("email", { length: 255 }),
  precoConsulta: varchar("precoConsulta", { length: 50 }),
  descontoPercentual: int("descontoPercentual").notNull().default(0),
  observacoes: text("observacoes"),
  contatoParceria: varchar("contatoParceria", { length: 255 }),
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