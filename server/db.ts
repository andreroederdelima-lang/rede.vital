import { eq, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, solicitacoesParceria, InsertSolicitacaoParceria, SolicitacaoParceria, usuariosAutorizados, InsertUsuarioAutorizado, UsuarioAutorizado, solicitacoesAtualizacao, InsertSolicitacaoAtualizacao, SolicitacaoAtualizacao, medicos, instituicoes, solicitacoesAcesso, InsertSolicitacaoAcesso, tokensRecuperacao } from "../drizzle/schema";
// @ts-ignore - TypeScript cache bug: exports exist but not recognized
import { indicadores, indicacoes, comissoes } from "../drizzle/schema";

// Workaround types for indicacoes system (TypeScript cache issue)
type Indicador = typeof indicadores.$inferSelect;
type InsertIndicador = typeof indicadores.$inferInsert;
type Indicacao = typeof indicacoes.$inferSelect;
type InsertIndicacao = typeof indicacoes.$inferInsert;
type Comissao = typeof comissoes.$inferSelect;
type InsertComissao = typeof comissoes.$inferInsert;
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { Medico, Instituicao, InsertMedico, InsertInstituicao } from "../drizzle/schema";
import { and, like, or, gte } from "drizzle-orm";

// ========== MÉDICOS ==========

export async function listarMedicos(filtros?: {
  busca?: string;
  especialidade?: string;
  municipio?: string;
  descontoMinimo?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const condicoes = [eq(medicos.ativo, 1)];

  if (filtros?.busca) {
    condicoes.push(
      or(
        like(medicos.nome, `%${filtros.busca}%`),
        like(medicos.especialidade, `%${filtros.busca}%`),
        like(medicos.endereco, `%${filtros.busca}%`)
      )!
    );
  }

  if (filtros?.especialidade) {
    condicoes.push(eq(medicos.especialidade, filtros.especialidade));
  }

  if (filtros?.municipio) {
    condicoes.push(eq(medicos.municipio, filtros.municipio));
  }

  if (filtros?.descontoMinimo !== undefined) {
    condicoes.push(gte(medicos.descontoPercentual, filtros.descontoMinimo));
  }

  return db.select().from(medicos).where(and(...condicoes));
}

export async function obterMedicoPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(medicos).where(eq(medicos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function criarMedico(data: InsertMedico) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medicos).values(data);
  return result;
}

export async function atualizarMedico(id: number, data: Partial<InsertMedico>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medicos).set(data).where(eq(medicos.id, id));
}

export async function excluirMedico(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medicos).set({ ativo: 0 }).where(eq(medicos.id, id));
}

export async function listarEspecialidades() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ especialidade: medicos.especialidade }).from(medicos).where(eq(medicos.ativo, 1));
  return result.map(r => r.especialidade);
}

// ========== INSTITUIÇÕES ==========

export async function listarInstituicoes(filtros?: {
  busca?: string;
  categoria?: string;
  municipio?: string;
  descontoMinimo?: number;
  tipoServico?: "servicos_saude" | "outros_servicos";
}) {
  const db = await getDb();
  if (!db) return [];

  const condicoes = [eq(instituicoes.ativo, 1)];

  if (filtros?.busca) {
    condicoes.push(
      or(
        like(instituicoes.nome, `%${filtros.busca}%`),
        like(instituicoes.endereco, `%${filtros.busca}%`),
        like(instituicoes.observacoes, `%${filtros.busca}%`)
      )!
    );
  }

  if (filtros?.categoria) {
    condicoes.push(eq(instituicoes.categoria, filtros.categoria as any));
  }

  if (filtros?.municipio) {
    condicoes.push(eq(instituicoes.municipio, filtros.municipio));
  }

  if (filtros?.tipoServico) {
    // Forçar TypeScript a aceitar o campo tipoServico
    condicoes.push(eq((instituicoes as any).tipoServico, filtros.tipoServico));
  }

  if (filtros?.descontoMinimo !== undefined) {
    condicoes.push(gte(instituicoes.descontoPercentual, filtros.descontoMinimo));
  }

  return db.select().from(instituicoes).where(and(...condicoes));
}

export async function obterInstituicaoPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(instituicoes).where(eq(instituicoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function criarInstituicao(data: InsertInstituicao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(instituicoes).values(data);
  return result;
}

export async function atualizarInstituicao(id: number, data: Partial<InsertInstituicao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(instituicoes).set(data).where(eq(instituicoes.id, id));
}

export async function excluirInstituicao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(instituicoes).set({ ativo: 0 }).where(eq(instituicoes.id, id));
}

export async function listarMunicipios() {
  const db = await getDb();
  if (!db) return [];
  const medicosMunicipios = await db.selectDistinct({ municipio: medicos.municipio }).from(medicos).where(eq(medicos.ativo, 1));
  const instituicoesMunicipios = await db.selectDistinct({ municipio: instituicoes.municipio }).from(instituicoes).where(eq(instituicoes.ativo, 1));
  const todos = [...medicosMunicipios.map(m => m.municipio), ...instituicoesMunicipios.map(i => i.municipio)];
  const unicos = Array.from(new Set(todos));
  return unicos.sort();
}

// ========== Solicitações de Parceria ==========

export async function criarSolicitacaoParceria(data: InsertSolicitacaoParceria) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(solicitacoesParceria).values(data);
  return result;
}

export async function listarSolicitacoesParceria(status?: "pendente" | "aprovado" | "rejeitado") {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(solicitacoesParceria).where(eq(solicitacoesParceria.status, status)).orderBy(solicitacoesParceria.createdAt);
  }
  
  return await db.select().from(solicitacoesParceria).orderBy(solicitacoesParceria.createdAt);
}

export async function obterSolicitacaoParceriaPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(solicitacoesParceria).where(eq(solicitacoesParceria.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function atualizarStatusSolicitacao(id: number, status: "pendente" | "aprovado" | "rejeitado", motivoRejeicao?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (motivoRejeicao) {
    updateData.motivoRejeicao = motivoRejeicao;
  }
  
  await db.update(solicitacoesParceria).set(updateData).where(eq(solicitacoesParceria.id, id));
}

// ========== Usuários Autorizados ==========

export async function listarUsuariosAutorizados() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(usuariosAutorizados).where(eq(usuariosAutorizados.ativo, 1)).orderBy(usuariosAutorizados.nome);
}

export async function obterUsuarioAutorizadoPorEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(usuariosAutorizados).where(
    and(eq(usuariosAutorizados.email, email), eq(usuariosAutorizados.ativo, 1))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function criarUsuarioAutorizado(data: { email: string; nome: string; senha: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hash da senha usando bcrypt
  const bcrypt = await import("bcryptjs");
  const senhaHash = await bcrypt.hash(data.senha, 10);
  
  const result = await db.insert(usuariosAutorizados).values({
    email: data.email,
    nome: data.nome,
    senhaHash,
  });
  return result;
}

export async function atualizarUsuarioAutorizado(id: number, data: Partial<InsertUsuarioAutorizado>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(usuariosAutorizados).set(data).where(eq(usuariosAutorizados.id, id));
}

export async function excluirUsuarioAutorizado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(usuariosAutorizados).set({ ativo: 0 }).where(eq(usuariosAutorizados.id, id));
}


// ========== Solicitações de Atualização ==========

export async function gerarTokenAtualizacao(tipo: "medico" | "instituicao", id: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Gerar token único
  const token = `${tipo}_${id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  if (tipo === "medico") {
    await db.update(medicos).set({ tokenAtualizacao: token }).where(eq(medicos.id, id));
  } else {
    await db.update(instituicoes).set({ tokenAtualizacao: token }).where(eq(instituicoes.id, id));
  }
  
  return token;
}

export async function obterCredenciadoPorToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Tentar buscar médico
  const medico = await db.select().from(medicos).where(eq(medicos.tokenAtualizacao, token)).limit(1);
  if (medico.length > 0) {
    return { tipo: "medico" as const, dados: medico[0] };
  }
  
  // Tentar buscar instituição
  const instituicao = await db.select().from(instituicoes).where(eq(instituicoes.tokenAtualizacao, token)).limit(1);
  if (instituicao.length > 0) {
    return { tipo: "instituicao" as const, dados: instituicao[0] };
  }
  
  return undefined;
}

export async function criarSolicitacaoAtualizacao(data: InsertSolicitacaoAtualizacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(solicitacoesAtualizacao).values(data);
  return result;
}

export async function listarSolicitacoesAtualizacao(status?: "pendente" | "aprovado" | "rejeitado") {
  const db = await getDb();
  if (!db) return [];
  
  let solicitacoesList;
  if (status) {
    solicitacoesList = await db.select().from(solicitacoesAtualizacao).where(eq(solicitacoesAtualizacao.status, status)).orderBy(solicitacoesAtualizacao.createdAt);
  } else {
    solicitacoesList = await db.select().from(solicitacoesAtualizacao).orderBy(solicitacoesAtualizacao.createdAt);
  }
  
  // Adicionar nome do credenciado
  const solicitacoesComNome = await Promise.all(
    solicitacoesList.map(async (sol) => {
      let nomeCredenciado = "";
      if (sol.tipoCredenciado === "medico") {
        const medico = await obterMedicoPorId(sol.credenciadoId);
        nomeCredenciado = medico?.nome || "";
      } else {
        const instituicao = await obterInstituicaoPorId(sol.credenciadoId);
        nomeCredenciado = instituicao?.nome || "";
      }
      return { ...sol, nomeCredenciado };
    })
  );
  
  return solicitacoesComNome;
}

export async function obterSolicitacaoAtualizacaoPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(solicitacoesAtualizacao).where(eq(solicitacoesAtualizacao.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function aprovarSolicitacaoAtualizacao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const solicitacao = await obterSolicitacaoAtualizacaoPorId(id);
  if (!solicitacao) throw new Error("Solicitação não encontrada");
  
  // Atualizar dados do credenciado
  const updateData: any = {};
  if (solicitacao.telefone) updateData.telefone = solicitacao.telefone;
  if (solicitacao.whatsapp) updateData.whatsapp = solicitacao.whatsapp;
  if (solicitacao.email) updateData.email = solicitacao.email;
  if (solicitacao.endereco) updateData.endereco = solicitacao.endereco;
  if (solicitacao.precoConsulta) updateData.precoConsulta = solicitacao.precoConsulta;
  if (solicitacao.descontoPercentual !== null && solicitacao.descontoPercentual !== undefined) {
    updateData.descontoPercentual = solicitacao.descontoPercentual;
  }
  if (solicitacao.observacoes) updateData.observacoes = solicitacao.observacoes;
  
  if (solicitacao.tipoCredenciado === "medico") {
    await db.update(medicos).set(updateData).where(eq(medicos.id, solicitacao.credenciadoId));
  } else {
    await db.update(instituicoes).set(updateData).where(eq(instituicoes.id, solicitacao.credenciadoId));
  }
  
  // Marcar solicitação como aprovada
  await db.update(solicitacoesAtualizacao).set({ status: "aprovado" }).where(eq(solicitacoesAtualizacao.id, id));
}

export async function rejeitarSolicitacaoAtualizacao(id: number, motivo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status: "rejeitado" };
  if (motivo) updateData.motivoRejeicao = motivo;
  
  await db.update(solicitacoesAtualizacao).set(updateData).where(eq(solicitacoesAtualizacao.id, id));
}


// ============================================
// Solicitações de Acesso
// ============================================

export async function criarSolicitacaoAcesso(data: InsertSolicitacaoAcesso) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(solicitacoesAcesso).values(data);
  return result;
}

export async function listarSolicitacoesAcesso() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(solicitacoesAcesso).orderBy(desc(solicitacoesAcesso.createdAt));
  return result;
}

export async function aprovarSolicitacaoAcesso(id: number, senhaTemporaria: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Atualizar solicitação
  await db.update(solicitacoesAcesso)
    .set({ status: "aprovado", senhaTemporaria })
    .where(eq(solicitacoesAcesso.id, id));
  
  // Buscar dados da solicitação
  const solicitacao = await db.select().from(solicitacoesAcesso).where(eq(solicitacoesAcesso.id, id)).limit(1);
  return solicitacao[0];
}

export async function rejeitarSolicitacaoAcesso(id: number, motivo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(solicitacoesAcesso)
    .set({ status: "rejeitado", motivoRejeicao: motivo })
    .where(eq(solicitacoesAcesso.id, id));
}

// ============================================
// Recuperação de Senha
// ============================================

export async function criarTokenRecuperacao(usuarioId: number, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tokensRecuperacao).values({
    usuarioId,
    token,
    expiresAt,
  });
}

export async function obterTokenRecuperacao(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tokensRecuperacao).where(eq(tokensRecuperacao.token, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function marcarTokenComoUsado(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tokensRecuperacao)
    .set({ usado: 1 })
    .where(eq(tokensRecuperacao.token, token));
}

export async function alterarSenhaUsuario(usuarioId: number, novaSenha: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const bcrypt = await import("bcryptjs");
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  
  await db.update(usuariosAutorizados)
    .set({ senhaHash })
    .where(eq(usuariosAutorizados.id, usuarioId));
}


/**
 * Estatísticas de cobertura para dashboard de prospecção
 */
export async function obterEstatisticasCobertura() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get coverage stats: database not available");
    return [];
  }

  try {
    // Buscar todos os médicos ativos agrupados por município e especialidade
    const medicosStats = await db
      .select({
        municipio: medicos.municipio,
        especialidade: medicos.especialidade,
        quantidade: sql<number>`COUNT(*)`.as('quantidade'),
      })
      .from(medicos)
      .where(eq(medicos.ativo, 1))
      .groupBy(medicos.municipio, medicos.especialidade);

    // Buscar todas as instituições ativas agrupadas por município e categoria
    const instituicoesStats = await db
      .select({
        municipio: instituicoes.municipio,
        categoria: instituicoes.categoria,
        quantidade: sql<number>`COUNT(*)`.as('quantidade'),
      })
      .from(instituicoes)
      .where(eq(instituicoes.ativo, 1))
      .groupBy(instituicoes.municipio, instituicoes.categoria);

    return {
      medicos: medicosStats,
      instituicoes: instituicoesStats,
    };
  } catch (error) {
    console.error("[Database] Failed to get coverage stats:", error);
    throw error;
  }
}

export async function obterEspecialidadesUnicas() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get unique specialties: database not available");
    return [];
  }

  try {
    const result = await db
      .selectDistinct({ especialidade: medicos.especialidade })
      .from(medicos)
      .where(eq(medicos.ativo, 1))
      .orderBy(medicos.especialidade);

    return result.map(r => r.especialidade);
  } catch (error) {
    console.error("[Database] Failed to get unique specialties:", error);
    throw error;
  }
}

export async function obterCategoriasUnicas() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get unique categories: database not available");
    return [];
  }

  try {
    const result = await db
      .selectDistinct({ categoria: instituicoes.categoria })
      .from(instituicoes)
      .where(eq(instituicoes.ativo, 1))
      .orderBy(instituicoes.categoria);

    return result.map(r => r.categoria);
  } catch (error) {
    console.error("[Database] Failed to get unique categories:", error);
    throw error;
  }
}


// ===== Funções para Sistema de Indicações =====

// Indicadores (Promotores/Vendedores)
export async function criarIndicador(data: InsertIndicador) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(indicadores).values(data);
  return result;
}

export async function listarIndicadores(tipo?: "promotor" | "vendedor") {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(indicadores);
  
  if (tipo) {
    query = query.where(eq(indicadores.tipo, tipo)) as any;
  }
  
  return await query.orderBy(desc(indicadores.createdAt));
}

export async function buscarIndicadorPorUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(indicadores).where(eq(indicadores.userId, userId)).limit(1);
  return result[0] || null;
}

// Indicações
export async function criarIndicacao(data: InsertIndicacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(indicacoes).values(data);
  return result;
}

export async function listarIndicacoes(indicadorId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(indicacoes);
  
  if (indicadorId) {
    query = query.where(eq(indicacoes.indicadorId, indicadorId)) as any;
  }
  
  if (status) {
    query = query.where(eq(indicacoes.status, status as any)) as any;
  }
  
  return await query.orderBy(desc(indicacoes.createdAt));
}

export async function atualizarIndicacao(id: number, data: Partial<InsertIndicacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(indicacoes).set(data).where(eq(indicacoes.id, id));
}

// Comissões
export async function criarComissao(data: InsertComissao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(comissoes).values(data);
  return result;
}

export async function listarComissoes(indicadorId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(comissoes);
  
  if (indicadorId) {
    query = query.where(eq(comissoes.indicadorId, indicadorId)) as any;
  }
  
  return await query.orderBy(desc(comissoes.createdAt));
}


// Queries avançadas para Admin

export async function listarTodasIndicacoesComFiltros(filtros?: {
  indicadorId?: number;
  status?: string;
  dataInicio?: Date;
  dataFim?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db
    .select({
      indicacao: indicacoes,
      indicador: indicadores,
    })
    .from(indicacoes)
    .leftJoin(indicadores, eq(indicacoes.indicadorId, indicadores.id));
  
  const condicoes: any[] = [];
  
  if (filtros?.indicadorId) {
    condicoes.push(eq(indicacoes.indicadorId, filtros.indicadorId));
  }
  
  if (filtros?.status) {
    condicoes.push(eq(indicacoes.status, filtros.status as any));
  }
  
  if (filtros?.dataInicio) {
    condicoes.push(sql`${indicacoes.createdAt} >= ${filtros.dataInicio}`);
  }
  
  if (filtros?.dataFim) {
    condicoes.push(sql`${indicacoes.createdAt} <= ${filtros.dataFim}`);
  }
  
  if (condicoes.length > 0) {
    query = query.where(and(...condicoes)) as any;
  }
  
  const resultado = await query.orderBy(desc(indicacoes.createdAt));
  
  return resultado.map(r => ({
    ...r.indicacao,
    indicadorNome: r.indicador?.nome || "Desconhecido",
    indicadorTipo: r.indicador?.tipo || "promotor",
  }));
}

export async function obterEstatisticasIndicacoes() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    pendentes: 0,
    contatadas: 0,
    fechadas: 0,
    perdidas: 0,
    taxaConversao: 0,
  };
  
  const stats = await db
    .select({
      status: indicacoes.status,
      quantidade: sql<number>`COUNT(*)`.as('quantidade'),
    })
    .from(indicacoes)
    .groupBy(indicacoes.status);
  
  const total = stats.reduce((acc, s) => acc + Number(s.quantidade), 0);
  const pendentes = stats.find(s => s.status === "pendente")?.quantidade || 0;
  const contatadas = stats.find(s => s.status === "contatado")?.quantidade || 0;
  const fechadas = stats.find(s => s.status === "fechado")?.quantidade || 0;
  const perdidas = stats.find(s => s.status === "perdido")?.quantidade || 0;
  
  const taxaConversao = total > 0 ? (Number(fechadas) / total) * 100 : 0;
  
  return {
    total,
    pendentes: Number(pendentes),
    contatadas: Number(contatadas),
    fechadas: Number(fechadas),
    perdidas: Number(perdidas),
    taxaConversao: Math.round(taxaConversao * 10) / 10,
  };
}

export async function atualizarIndicador(id: number, data: Partial<InsertIndicador>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(indicadores).set(data).where(eq(indicadores.id, id));
}

export async function obterIndicadorPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(indicadores).where(eq(indicadores.id, id)).limit(1);
  return result[0] || null;
}

export async function listarComissoesPorIndicacao(indicacaoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(comissoes).where(eq(comissoes.indicacaoId, indicacaoId)).orderBy(desc(comissoes.createdAt));
}

export async function atualizarComissao(id: number, data: Partial<InsertComissao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(comissoes).set(data).where(eq(comissoes.id, id));
}


// ==================== CONFIGURAÇÕES ====================

export async function listarConfiguracoes() {
  const db = await getDb();
  if (!db) return [];
  
  // @ts-ignore
  const { configuracoes } = await import("../drizzle/schema");
  return await db.select().from(configuracoes).orderBy(configuracoes.chave);
}

export async function buscarConfiguracaoPorChave(chave: string) {
  const db = await getDb();
  if (!db) return null;
  
  // @ts-ignore
  const { configuracoes } = await import("../drizzle/schema");
  const result = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave)).limit(1);
  return result[0] || null;
}

export async function atualizarConfiguracao(chave: string, valor: string, descricao?: string, updatedBy?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // @ts-ignore
  const { configuracoes } = await import("../drizzle/schema");
  
  // Verificar se configuração já existe
  const existing = await buscarConfiguracaoPorChave(chave);
  
  if (existing) {
    // Atualizar existente
    await db.update(configuracoes)
      .set({ valor, descricao, updatedBy, updatedAt: new Date() })
      .where(eq(configuracoes.chave, chave));
  } else {
    // Criar nova
    await db.insert(configuracoes).values({ chave, valor, descricao, updatedBy });
  }
  
  return await buscarConfiguracaoPorChave(chave);
}
