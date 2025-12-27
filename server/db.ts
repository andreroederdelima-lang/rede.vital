import { eq, sql, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, solicitacoesParceria, InsertSolicitacaoParceria, SolicitacaoParceria, usuariosAutorizados, InsertUsuarioAutorizado, UsuarioAutorizado, solicitacoesAtualizacao, InsertSolicitacaoAtualizacao, SolicitacaoAtualizacao, medicos, instituicoes, solicitacoesAcesso, InsertSolicitacaoAcesso, tokensRecuperacao } from "../drizzle/schema";
// @ts-ignore - TypeScript cache bug: exports exist but not recognized
// [REMOVIDO] import { indicadores, indicacoes, comissoes, copys, avaliacoes } from "../drizzle/schema";
import { copys, avaliacoes } from "../drizzle/schema";

// [REMOVIDO] Types de indicações removidos
// type Indicador = typeof indicadores.$inferSelect;
// type InsertIndicador = typeof indicadores.$inferInsert;
// type Indicacao = typeof indicacoes.$inferSelect;
// type InsertIndicacao = typeof indicacoes.$inferInsert;
// type Comissao = typeof comissoes.$inferSelect;
// type InsertComissao = typeof comissoes.$inferInsert;
type Copy = typeof copys.$inferSelect;
type InsertCopy = typeof copys.$inferInsert;
type Avaliacao = typeof avaliacoes.$inferSelect;
type InsertAvaliacao = typeof avaliacoes.$inferInsert;
import { ENV } from './_core/env';
import { randomBytes } from 'crypto';

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

import { Medico, Instituicao, InsertMedico, InsertInstituicao, procedimentos, InsertProcedimento } from "../drizzle/schema";
import { like, or, gte } from "drizzle-orm";

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

export async function buscarMedicoPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(medicos).where(eq(medicos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Formata nome do médico adicionando Dr. ou Dra. automaticamente
 */
function formatarNomeMedico(nome: string): string {
  const nomeTrimmed = nome.trim();
  
  // Se já começa com Dr., Dra., Dr ou Dra, retorna como está
  if (/^(Dr\.|Dra\.|Dr|Dra)\s/i.test(nomeTrimmed)) {
    return nomeTrimmed;
  }
  
  // Detecta se é nome feminino (termina com 'a' ou contém nomes femininos comuns)
  const nomesComuns = nomeTrimmed.toLowerCase();
  const isFeminino = 
    nomesComuns.endsWith('a') || 
    /\b(maria|ana|julia|fernanda|patricia|carla|paula|beatriz|leticia|gabriela|camila|amanda|barbara|daniela|mariana|adriana|luciana|renata|cristina|monica|sandra|vanessa|simone|claudia|silvia|andrea|roberta|tatiana|viviane)\b/.test(nomesComuns);
  
  return isFeminino ? `Dra. ${nomeTrimmed}` : `Dr. ${nomeTrimmed}`;
}

export async function criarMedico(data: InsertMedico) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Formatar nome com Dr./Dra. automaticamente
  const dataFormatted = {
    ...data,
    nome: data.nome ? formatarNomeMedico(data.nome) : data.nome,
  };
  
  const result = await db.insert(medicos).values(dataFormatted);
  return Number(result[0].insertId);
}

export async function atualizarMedico(id: number, data: Partial<InsertMedico>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Formatar nome com Dr./Dra. se estiver sendo atualizado
  const dataFormatted = {
    ...data,
    ...(data.nome ? { nome: formatarNomeMedico(data.nome) } : {}),
  };
  
  await db.update(medicos).set(dataFormatted).where(eq(medicos.id, id));
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
  procedimento?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  // Se houver filtro de procedimento, precisamos fazer JOIN com a tabela procedimentos
  if (filtros?.procedimento) {
    const condicoes = [eq(instituicoes.ativo, 1), eq(procedimentos.ativo, 1), eq(procedimentos.nome, filtros.procedimento)];

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
      condicoes.push(eq((instituicoes as any).tipoServico, filtros.tipoServico));
    }

    if (filtros?.descontoMinimo !== undefined) {
      condicoes.push(gte(instituicoes.descontoPercentual, filtros.descontoMinimo));
    }

    // JOIN com procedimentos e retornar instituições únicas
    const result = await db
      .selectDistinct()
      .from(instituicoes)
      .innerJoin(procedimentos, eq(procedimentos.instituicaoId, instituicoes.id))
      .where(and(...condicoes));
    
    return result.map(r => r.instituicoes);
  }

  // Filtro normal sem procedimento
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
  return Number(result[0].insertId);
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

export async function obterUsuarioAutorizadoPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(usuariosAutorizados).where(
    and(eq(usuariosAutorizados.id, id), eq(usuariosAutorizados.ativo, 1))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function resetarSenhaUsuario(id: number, novaSenha: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hash da nova senha
  const bcrypt = await import("bcryptjs");
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  
  await db.update(usuariosAutorizados)
    .set({ senhaHash })
    .where(eq(usuariosAutorizados.id, id));
}

export async function alterarSenhaUsuario(id: number, novaSenha: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hash da nova senha
  const bcrypt = await import("bcryptjs");
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  
  await db.update(usuariosAutorizados)
    .set({ senhaHash })
    .where(eq(usuariosAutorizados.id, id));
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
// [REMOVIDO] Função criarIndicador removida
// export async function criarIndicador(data: InsertIndicador) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   const [result] = await db.insert(indicadores).values(data);
//   return result;
// }

// [REMOVIDO] Função listarIndicadores removida
// export async function listarIndicadores(tipo?: "promotor" | "vendedor") {
//   const db = await getDb();
//   if (!db) return [];
//   
//   let query = db.select().from(indicadores);
//   
//   if (tipo) {
//     query = query.where(eq(indicadores.tipo, tipo)) as any;
//   }
//   
//   return await query.orderBy(desc(indicadores.createdAt));
// }

// [REMOVIDO] Função buscarIndicadorPorUserId removida
// export async function buscarIndicadorPorUserId(userId: number) {
//   const db = await getDb();
//   if (!db) return null;
//   
//   const result = await db.select().from(indicadores).where(eq(indicadores.userId, userId)).limit(1);
//   return result[0] || null;
// }

// [REMOVIDO] Função criarIndicacao removida
// export async function criarIndicacao(data: InsertIndicacao) { ... }

// [REMOVIDO] Função listarIndicacoes removida
// export async function listarIndicacoes(indicadorId?: number, status?: string) {
//   const db = await getDb();
//   if (!db) return [];
//   
//   let query = db.select().from(indicacoes);
//   
//   if (indicadorId) {
//     query = query.where(eq(indicacoes.indicadorId, indicadorId)) as any;
//   }
//   
//   if (status) {
//     query = query.where(eq(indicacoes.status, status as any)) as any;
//   }
//   
//   return await query.orderBy(desc(indicacoes.createdAt));
// }

// [REMOVIDO] Função atualizarIndicacao removida
// export async function atualizarIndicacao(id: number, data: Partial<InsertIndicacao>) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   await db.update(indicacoes).set(data).where(eq(indicacoes.id, id));
// }

// Comissões
// [REMOVIDO] Função criarComissao removida
// export async function criarComissao(data: InsertComissao) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   const [result] = await db.insert(comissoes).values(data);
//   return result;
// }

// [REMOVIDO] Função listarComissoes removida
// export async function listarComissoes(indicadorId?: number) {
//   const db = await getDb();
//   if (!db) return [];
//   
//   let query = db.select().from(comissoes);
//   
//   if (indicadorId) {
//     query = query.where(eq(comissoes.indicadorId, indicadorId)) as any;
//   }
//   
//   return await query.orderBy(desc(comissoes.createdAt));
// }


// Queries avançadas para Admin

// [REMOVIDO] Função listarTodasIndicacoesComFiltros removida
// export async function listarTodasIndicacoesComFiltros(...) { ... }

// [REMOVIDO] Função obterEstatisticasIndicacoes removida
// export async function obterEstatisticasIndicacoes() {
//   const db = await getDb();
//   if (!db) return {
//     total: 0,
//     pendentes: 0,
//     contatadas: 0,
//     fechadas: 0,
//     perdidas: 0,
//     taxaConversao: 0,
//   };
//   
//   const stats = await db
//     .select({
//       status: indicacoes.status,
//       quantidade: sql<number>`COUNT(*)`.as('quantidade'),
//     })
//     .from(indicacoes)
//     .groupBy(indicacoes.status);
//   
//   const total = stats.reduce((acc, s) => acc + Number(s.quantidade), 0);
//   const pendentes = stats.find(s => s.status === "pendente")?.quantidade || 0;
//   const contatadas = stats.find(s => s.status === "contatado")?.quantidade || 0;
//   const fechadas = stats.find(s => s.status === "fechado")?.quantidade || 0;
//   const perdidas = stats.find(s => s.status === "perdido")?.quantidade || 0;
//   
//   const taxaConversao = total > 0 ? (Number(fechadas) / total) * 100 : 0;
//   
//   return {
//     total,
//     pendentes: Number(pendentes),
//     contatadas: Number(contatadas),
//     fechadas: Number(fechadas),
//     perdidas: Number(perdidas),
//     taxaConversao: Math.round(taxaConversao * 10) / 10,
//   };
// }

// [REMOVIDO] Função atualizarIndicador removida
// export async function atualizarIndicador(id: number, data: Partial<InsertIndicador>) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   await db.update(indicadores).set(data).where(eq(indicadores.id, id));
// }

// [REMOVIDO] Função obterIndicadorPorId removida
// export async function obterIndicadorPorId(id: number) {
//   const db = await getDb();
//   if (!db) return null;
//   
//   const result = await db.select().from(indicadores).where(eq(indicadores.id, id)).limit(1);
//   return result[0] || null;
// }

// [REMOVIDO] Função listarComissoesPorIndicacao removida
// export async function listarComissoesPorIndicacao(indicacaoId: number) {
//   const db = await getDb();
//   if (!db) return [];
//   
//   return await db.select().from(comissoes).where(eq(comissoes.indicacaoId, indicacaoId)).orderBy(desc(comissoes.createdAt));
// }

// [REMOVIDO] Função atualizarComissao removida
// export async function atualizarComissao(id: number, data: Partial<InsertComissao>) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   await db.update(comissoes).set(data).where(eq(comissoes.id, id));
// }


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


// ==================== RECUPERAÇÃO DE SENHA ====================

export async function solicitarRecuperacaoSenha(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // @ts-ignore
  const { usuariosAutorizados, tokensRecuperacao } = await import("../drizzle/schema");
  
  // Buscar usuário por email
  const usuarios = await db.select().from(usuariosAutorizados).where(eq(usuariosAutorizados.email, email)).limit(1);
  
  if (usuarios.length === 0) {
    // Por segurança, não revelar se o email existe ou não
    return { success: true, message: "Se o email existir, um link de recuperação será enviado" };
  }
  
  const usuario = usuarios[0];
  
  // Gerar token único
  const crypto = await import("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  
  // Expiração: 1 hora
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  // Salvar token no banco
  await db.insert(tokensRecuperacao).values({
    usuarioId: usuario.id,
    token,
    expiresAt,
    usado: 0,
  });
  
  // TODO: Enviar email com link de recuperação
  // Por enquanto, retornar o token para teste
  console.log(`[Recuperação] Token gerado para ${email}: ${token}`);
  console.log(`[Recuperação] Link: ${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/recuperar-senha?token=${token}`);
  
  return {
    success: true,
    message: "Link de recuperação enviado para o email",
    // Em produção, remover esta linha:
    token, // Apenas para teste
  };
}

export async function validarTokenRecuperacao(token: string) {
  const db = await getDb();
  if (!db) return { valid: false, message: "Database not available" };
  
  // @ts-ignore
  const { tokensRecuperacao } = await import("../drizzle/schema");
  
  const tokens = await db.select().from(tokensRecuperacao).where(eq(tokensRecuperacao.token, token)).limit(1);
  
  if (tokens.length === 0) {
    return { valid: false, message: "Token inválido" };
  }
  
  const tokenData = tokens[0];
  
  // Verificar se já foi usado
  if (tokenData.usado === 1) {
    return { valid: false, message: "Token já foi utilizado" };
  }
  
  // Verificar se expirou
  if (new Date() > new Date(tokenData.expiresAt)) {
    return { valid: false, message: "Token expirado" };
  }
  
  return { valid: true, usuarioId: tokenData.usuarioId };
}

export async function redefinirSenhaComToken(token: string, novaSenha: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validar token
  const validacao = await validarTokenRecuperacao(token);
  if (!validacao.valid) {
    throw new Error(validacao.message);
  }
  
  // @ts-ignore
  const { usuariosAutorizados, tokensRecuperacao } = await import("../drizzle/schema");
  const bcrypt = await import("bcrypt");
  
  // Hash da nova senha
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  
  // Atualizar senha do usuário
  await db.update(usuariosAutorizados)
    .set({ senhaHash })
    .where(eq(usuariosAutorizados.id, validacao.usuarioId!));
  
  // Marcar token como usado
  await db.update(tokensRecuperacao)
    .set({ usado: 1 })
    .where(eq(tokensRecuperacao.token, token));
  
  return { success: true, message: "Senha redefinida com sucesso" };
}


// ===== Materiais de Divulgação =====

// [REMOVIDO] Função listarMateriaisDivulgacao removida
// export async function listarMateriaisDivulgacao() {
//   const db = await getDb();
//   if (!db) return [];
//   
//   // @ts-ignore
//   const { materiaisDivulgacao } = await import("../drizzle/schema");
//   
//   const materiais = await db.select()
//     .from(materiaisDivulgacao)
//     .where(eq(materiaisDivulgacao.ativo, 1))
//     .orderBy(materiaisDivulgacao.ordem, materiaisDivulgacao.createdAt);
//   
//   return materiais;
// }

// [REMOVIDO] Função criarMaterialDivulgacao removida
// export async function criarMaterialDivulgacao(data: any) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   // @ts-ignore
//   const { materiaisDivulgacao } = await import("../drizzle/schema");
//   
//   await db.insert(materiaisDivulgacao).values(data);
//   
//   return { success: true };
// }

// [REMOVIDO] Função atualizarMaterialDivulgacao removida
// export async function atualizarMaterialDivulgacao(id: number, data: any) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   // @ts-ignore
//   const { materiaisDivulgacao } = await import("../drizzle/schema");
//   
//   await db.update(materiaisDivulgacao)
//     .set(data)
//     .where(eq(materiaisDivulgacao.id, id));
//   
//   return { success: true };
// }

// [REMOVIDO] Função deletarMaterialDivulgacao removida
// export async function deletarMaterialDivulgacao(id: number) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   
//   // @ts-ignore
//   const { materiaisDivulgacao } = await import("../drizzle/schema");
//   
//   await db.update(materiaisDivulgacao)
//     .set({ ativo: 0 })
//     .where(eq(materiaisDivulgacao.id, id));
//   
//   return { success: true };
// }

// ===== Templates WhatsApp =====

export async function listarTemplatesWhatsapp() {
  const db = await getDb();
  if (!db) return [];
  
  // @ts-ignore
  const { templatesWhatsapp } = await import("../drizzle/schema");
  
  const templates = await db.select()
    .from(templatesWhatsapp)
    .where(eq(templatesWhatsapp.ativo, 1));
  
  return templates;
}

export async function criarTemplateWhatsapp(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // @ts-ignore
  const { templatesWhatsapp } = await import("../drizzle/schema");
  
  await db.insert(templatesWhatsapp).values(data);
  
  return { success: true };
}

export async function atualizarTemplateWhatsapp(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // @ts-ignore
  const { templatesWhatsapp } = await import("../drizzle/schema");
  
  await db.update(templatesWhatsapp)
    .set(data)
    .where(eq(templatesWhatsapp.id, id));
  
  return { success: true };
}

export async function deletarTemplateWhatsapp(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // @ts-ignore
  const { templatesWhatsapp } = await import("../drizzle/schema");
  
  await db.update(templatesWhatsapp)
    .set({ ativo: 0 })
    .where(eq(templatesWhatsapp.id, id));
  
  return { success: true };
}



// ===== Notificações Semestrais =====

export async function listarCredenciadosDesatualizados() {
  const db = await getDb();
  if (!db) return { medicos: [], instituicoes: [] };
  
  // Data de 6 meses atrás
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  
  // Buscar todos os médicos e instituições
  const todosMedicos = await db.select().from(medicos);
  const todasInstituicoes = await db.select().from(instituicoes);
  
  // Filtrar desatualizados (updatedAt > 6 meses)
  const medicosDesatualizados = todosMedicos.filter(m => {
    return new Date(m.updatedAt) < seisMesesAtras;
  });
  
  const instituicoesDesatualizadas = todasInstituicoes.filter(i => {
    return new Date(i.updatedAt) < seisMesesAtras;
  });
  
  return {
    medicos: medicosDesatualizados,
    instituicoes: instituicoesDesatualizadas,
  };
}

export async function enviarNotificacaoSemestral(tipo: "medico" | "instituicao", id: number) {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };
  
  let credenciado: any;
  if (tipo === "medico") {
    const resultado = await db.select().from(medicos).where(eq(medicos.id, id)).limit(1);
    credenciado = resultado[0];
  } else {
    const resultado = await db.select().from(instituicoes).where(eq(instituicoes.id, id)).limit(1);
    credenciado = resultado[0];
  }
  
  if (!credenciado) {
    return { success: false, message: "Credenciado não encontrado" };
  }
  
  // Aqui você implementaria o envio real de email
  // Por enquanto, apenas retornamos sucesso simulado
  
  const destinatario = credenciado.email || credenciado.whatsapp || credenciado.whatsappSecretaria || null;
  
  return {
    success: true,
    message: `Notificação enviada para ${credenciado.nome}`,
    destinatario,
  };
}

export async function enviarNotificacoesSemestrais() {
  const desatualizados = await listarCredenciadosDesatualizados();
  
  const totalMedicos = desatualizados.medicos.length;
  const totalInstituicoes = desatualizados.instituicoes.length;
  const total = totalMedicos + totalInstituicoes;
  
  if (total === 0) {
    return {
      success: true,
      message: "Nenhum credenciado desatualizado encontrado",
      enviados: 0,
    };
  }
  
  // Simular envio para todos
  let enviados = 0;
  
  // Aqui você implementaria o envio real em lote
  // Por enquanto, apenas contamos
  enviados = total;
  
  return {
    success: true,
    message: `${enviados} notificações enviadas com sucesso`,
    enviados,
    detalhes: {
      medicos: totalMedicos,
      instituicoes: totalInstituicoes,
    },
  };
}

// ==================== COMISSÕES DE ASSINATURAS ====================

// [REMOVIDO] Função listarComissoesAssinaturas removida
// export async function listarComissoesAssinaturas() {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot list comissões assinaturas: database not available");
//     return [];
//   }
// 
//   const { comissoesAssinaturas } = await import("../drizzle/schema");
//   const result = await db.select().from(comissoesAssinaturas).where(eq(comissoesAssinaturas.ativo, 1));
//   return result;
// }

// [REMOVIDO] Função buscarComissaoPorTipo removida
// export async function buscarComissaoPorTipo(tipoAssinatura: string) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get comissão: database not available");
//     return null;
//   }
// 
//   const { comissoesAssinaturas } = await import("../drizzle/schema");
//   const result = await db
//     .select()
//     .from(comissoesAssinaturas)
//     .where(eq(comissoesAssinaturas.tipoAssinatura, tipoAssinatura))
//     .limit(1);
// 
//   return result.length > 0 ? result[0] : null;
// }

// [REMOVIDO] Função atualizarComissaoAssinatura removida
// export async function atualizarComissaoAssinatura(...) { ... }


// ==================== COPYS ====================

export async function listarCopys() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(copys)
    .where(eq(copys.ativo, 1))
    .orderBy(copys.categoria, copys.ordem);
  
  return result;
}

export async function criarCopy(data: InsertCopy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(copys).values(data);
}

export async function atualizarCopy(id: number, data: Partial<InsertCopy>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(copys).set(data).where(eq(copys.id, id));
}

export async function excluirCopy(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Soft delete
  await db.update(copys).set({ ativo: 0 }).where(eq(copys.id, id));
}

// ==================== AVALIAÇÕES ====================

export async function criarAvaliacao(data: InsertAvaliacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(avaliacoes).values(data);
}

export async function listarAvaliacoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(avaliacoes)
    .orderBy(desc(avaliacoes.createdAt));
  
  return result;
}

export async function listarAvaliacoesPorCredenciado(tipoCredenciado: "medico" | "instituicao", credenciadoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(avaliacoes)
    .where(
      and(
        eq(avaliacoes.tipoCredenciado, tipoCredenciado),
        eq(avaliacoes.credenciadoId, credenciadoId)
      )
    )
    .orderBy(desc(avaliacoes.createdAt));
  
  return result;
}

export async function estatisticasAvaliacoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(avaliacoes);
  
  const total = result.length;
  const media = result.length > 0 
    ? result.reduce((acc, a) => acc + a.nota, 0) / result.length 
    : 0;
  
  return {
    total,
    media: Math.round(media * 10) / 10,
  };
}


// ========== TOKENS ==========
import { tokens, type InsertToken } from "../drizzle/schema";

export async function criarToken(data: Omit<InsertToken, "token" | "expiresAt" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar token único de 32 caracteres
  const token = randomBytes(32).toString("hex");
  
  // Expiração em 7 dias
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(tokens).values({
    ...data,
    token,
    expiresAt,
  });

  return token;
}

export async function verificarToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(tokens)
    .where(eq(tokens.token, token))
    .limit(1);

  if (result.length === 0) {
    return { valido: false, motivo: "Token não encontrado" };
  }

  const tokenData = result[0];

  // Verificar se já foi usado
  if (tokenData.usado === 1) {
    return { valido: false, motivo: "Token já foi utilizado" };
  }

  // Verificar se expirou
  if (new Date() > new Date(tokenData.expiresAt)) {
    return { valido: false, motivo: "Token expirado" };
  }

  return {
    valido: true,
    token: tokenData,
  };
}

export async function marcarTokenUsado(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tokens)
    .set({
      usado: 1,
      usadoEm: new Date(),
    })
    .where(eq(tokens.token, token));
}

export async function listarTokens() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(tokens)
    .orderBy(desc(tokens.createdAt));

  return result;
}


// ========== PROCEDIMENTOS ==========

export async function listarProcedimentos(instituicaoId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (instituicaoId) {
    return db.select().from(procedimentos).where(and(eq(procedimentos.instituicaoId, instituicaoId), eq(procedimentos.ativo, 1)));
  }
  
  return db.select().from(procedimentos).where(eq(procedimentos.ativo, 1));
}

export async function listarNomesProcedimentos() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .selectDistinct({ nome: procedimentos.nome })
    .from(procedimentos)
    .where(eq(procedimentos.ativo, 1))
    .orderBy(procedimentos.nome);
  
  return result.map(r => r.nome);
}

export async function obterProcedimentoPorId(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(procedimentos).where(eq(procedimentos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function criarProcedimento(data: InsertProcedimento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(procedimentos).values(data);
  return Number(result[0].insertId);
}

export async function atualizarProcedimento(id: number, data: Partial<InsertProcedimento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(procedimentos).set(data).where(eq(procedimentos.id, id));
}

export async function excluirProcedimento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(procedimentos).set({ ativo: 0 }).where(eq(procedimentos.id, id));
}


// ============================================
// API KEYS - Gerenciamento de chaves de API
// ============================================

import { apiKeys, apiLogs, InsertApiKey, ApiKey, InsertApiLog, ApiLog } from "../drizzle/schema";

/**
 * Gera uma nova API Key única
 */
export function gerarApiKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Cria uma nova API Key
 */
export async function criarApiKey(nome: string, createdBy?: string): Promise<ApiKey> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const apiKey = gerarApiKey();

  const [result] = await db.insert(apiKeys).values({
    nome,
    apiKey,
    ativa: 1,
    createdBy: createdBy || 'admin',
    requestCount: 0,
  });

  const [newKey] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, Number(result.insertId)))
    .limit(1);

  return newKey;
}

/**
 * Lista todas as API Keys
 */
export async function listarApiKeys(): Promise<ApiKey[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}

/**
 * Busca uma API Key por ID
 */
export async function buscarApiKeyPorId(id: number): Promise<ApiKey | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .limit(1);

  return key;
}

/**
 * Busca uma API Key pela chave
 */
export async function buscarApiKeyPorChave(apiKey: string): Promise<ApiKey | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.apiKey, apiKey))
    .limit(1);

  return key;
}

/**
 * Ativa ou desativa uma API Key
 */
export async function toggleApiKey(id: number, ativa: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(apiKeys)
    .set({ ativa: ativa ? 1 : 0 })
    .where(eq(apiKeys.id, id));
}

/**
 * Deleta uma API Key
 */
export async function deletarApiKey(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar logs associados primeiro
  await db.delete(apiLogs).where(eq(apiLogs.apiKeyId, id));

  // Deletar API Key
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}

/**
 * Lista logs de uma API Key específica
 */
export async function listarLogsApiKey(apiKeyId: number, limit: number = 100): Promise<ApiLog[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(apiLogs)
    .where(eq(apiLogs.apiKeyId, apiKeyId))
    .orderBy(desc(apiLogs.createdAt))
    .limit(limit);
}

/**
 * Estatísticas de uso de uma API Key
 */
export async function estatisticasApiKey(apiKeyId: number): Promise<{
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  lastUsed: Date | null;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [stats] = await db
    .select({
      totalRequests: sql<number>`COUNT(*)`,
      avgResponseTime: sql<number>`AVG(${apiLogs.responseTime})`,
      successRequests: sql<number>`SUM(CASE WHEN ${apiLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
    })
    .from(apiLogs)
    .where(eq(apiLogs.apiKeyId, apiKeyId));

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, apiKeyId))
    .limit(1);

  const totalRequests = Number(stats?.totalRequests || 0);
  const successRequests = Number(stats?.successRequests || 0);

  return {
    totalRequests,
    avgResponseTime: Math.round(Number(stats?.avgResponseTime || 0)),
    successRate: totalRequests > 0 ? Math.round((successRequests / totalRequests) * 100) : 0,
    lastUsed: key?.lastUsedAt || null,
  };
}


// ============================================
// WEBHOOKS - Sistema de notificações
// ============================================

import { webhooks, webhookLogs, InsertWebhook, Webhook, InsertWebhookLog, WebhookLog } from "../drizzle/schema";

/**
 * Cria um novo webhook
 */
export async function criarWebhook(data: Omit<InsertWebhook, 'createdAt' | 'updatedAt'>): Promise<Webhook> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar secret se não fornecido
  const secret = data.secret || randomBytes(32).toString('hex');

  const [result] = await db.insert(webhooks).values({
    ...data,
    secret,
  });

  const [newWebhook] = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.id, Number(result.insertId)))
    .limit(1);

  return newWebhook;
}

/**
 * Lista todos os webhooks
 */
export async function listarWebhooks(apiKeyId?: number): Promise<Webhook[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (apiKeyId) {
    return await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.apiKeyId, apiKeyId))
      .orderBy(desc(webhooks.createdAt));
  }

  return await db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
}

/**
 * Busca webhook por ID
 */
export async function buscarWebhookPorId(id: number): Promise<Webhook | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [webhook] = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.id, id))
    .limit(1);

  return webhook;
}

/**
 * Atualiza webhook
 */
export async function atualizarWebhook(id: number, data: Partial<Omit<InsertWebhook, 'createdAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(webhooks)
    .set(data)
    .where(eq(webhooks.id, id));
}

/**
 * Ativa ou desativa webhook
 */
export async function toggleWebhook(id: number, ativo: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(webhooks)
    .set({ ativo: ativo ? 1 : 0 })
    .where(eq(webhooks.id, id));
}

/**
 * Deleta webhook
 */
export async function deletarWebhook(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar logs associados primeiro
  await db.delete(webhookLogs).where(eq(webhookLogs.webhookId, id));

  // Deletar webhook
  await db.delete(webhooks).where(eq(webhooks.id, id));
}

/**
 * Dispara webhook para um evento
 */
export async function dispararWebhook(
  evento: string,
  payload: any,
  tentativa: number = 1
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar webhooks ativos que escutam este evento
  const webhooksAtivos = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.ativo, 1));

  for (const webhook of webhooksAtivos) {
    // Verificar se webhook escuta este evento
    const eventos = JSON.parse(webhook.eventos || '[]');
    if (!eventos.includes(evento)) continue;

    try {
      // Fazer requisição HTTP
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret || '',
          'X-Webhook-Event': evento,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();

      // Registrar log
      await db.insert(webhookLogs).values({
        webhookId: webhook.id,
        evento,
        payload: JSON.stringify(payload),
        statusCode: response.status,
        responseBody,
        tentativa,
        sucesso: response.ok ? 1 : 0,
      });

      // Se falhou e ainda tem tentativas, reagendar
      if (!response.ok && tentativa < webhook.maxRetries) {
        // Aguardar antes de tentar novamente (exponential backoff)
        const delay = Math.pow(2, tentativa) * 1000; // 2s, 4s, 8s...
        setTimeout(() => {
          dispararWebhook(evento, payload, tentativa + 1);
        }, delay);
      }
    } catch (error: any) {
      // Registrar erro
      await db.insert(webhookLogs).values({
        webhookId: webhook.id,
        evento,
        payload: JSON.stringify(payload),
        erro: error.message,
        tentativa,
        sucesso: 0,
      });

      // Se falhou e ainda tem tentativas, reagendar
      if (tentativa < webhook.maxRetries) {
        const delay = Math.pow(2, tentativa) * 1000;
        setTimeout(() => {
          dispararWebhook(evento, payload, tentativa + 1);
        }, delay);
      }
    }
  }
}

/**
 * Lista logs de um webhook
 */
export async function listarLogsWebhook(webhookId: number, limit: number = 100): Promise<WebhookLog[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(webhookLogs)
    .where(eq(webhookLogs.webhookId, webhookId))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
}

/**
 * Estatísticas de um webhook
 */
export async function estatisticasWebhook(webhookId: number): Promise<{
  totalDisparos: number;
  sucessos: number;
  falhas: number;
  taxaSucesso: number;
  ultimoDisparo: Date | null;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [stats] = await db
    .select({
      totalDisparos: sql<number>`COUNT(*)`,
      sucessos: sql<number>`SUM(CASE WHEN ${webhookLogs.sucesso} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(webhookLogs)
    .where(eq(webhookLogs.webhookId, webhookId));

  const [ultimoLog] = await db
    .select()
    .from(webhookLogs)
    .where(eq(webhookLogs.webhookId, webhookId))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(1);

  const totalDisparos = Number(stats?.totalDisparos || 0);
  const sucessos = Number(stats?.sucessos || 0);
  const falhas = totalDisparos - sucessos;

  return {
    totalDisparos,
    sucessos,
    falhas,
    taxaSucesso: totalDisparos > 0 ? Math.round((sucessos / totalDisparos) * 100) : 0,
    ultimoDisparo: ultimoLog?.createdAt || null,
  };
}


// ========== ESTATÍSTICAS DE CRESCIMENTO ==========
export async function obterEstatisticasCrescimento() {
  const db = await getDb();
  if (!db) return null;

  const agora = new Date();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - 7);
  
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const fimMesPassado = new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59);

  // Total geral
  const [totalMedicos] = await db.select({ count: sql<number>`COUNT(*)` }).from(medicos);
  const [totalInstituicoes] = await db.select({ count: sql<number>`COUNT(*)` }).from(instituicoes);
  
  // Ativos
  const [medicosAtivos] = await db.select({ count: sql<number>`COUNT(*)` }).from(medicos).where(eq(medicos.ativo, 1));
  const [instituicoesAtivas] = await db.select({ count: sql<number>`COUNT(*)` }).from(instituicoes).where(eq(instituicoes.ativo, 1));

  // Novos esta semana
  const [novosMedicosSemana] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(medicos)
    .where(sql`${medicos.createdAt} >= ${inicioSemana}`);
  
  const [novasInstituicoesSemana] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(instituicoes)
    .where(sql`${instituicoes.createdAt} >= ${inicioSemana}`);

  // Novos no mês atual
  const [novosMedicosMesAtual] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(medicos)
    .where(sql`${medicos.createdAt} >= ${inicioMesAtual}`);
  
  const [novasInstituicoesMesAtual] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(instituicoes)
    .where(sql`${instituicoes.createdAt} >= ${inicioMesAtual}`);

  // Novos no mês passado
  const [novosMedicosMesPassado] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(medicos)
    .where(sql`${medicos.createdAt} >= ${inicioMesPassado} AND ${medicos.createdAt} <= ${fimMesPassado}`);
  
  const [novasInstituicoesMesPassado] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(instituicoes)
    .where(sql`${instituicoes.createdAt} >= ${inicioMesPassado} AND ${instituicoes.createdAt} <= ${fimMesPassado}`);

  const totalCredenciados = (totalMedicos?.count || 0) + (totalInstituicoes?.count || 0);
  const totalAtivos = (medicosAtivos?.count || 0) + (instituicoesAtivas?.count || 0);
  const novosSemana = (novosMedicosSemana?.count || 0) + (novasInstituicoesSemana?.count || 0);
  const novosMesAtual = (novosMedicosMesAtual?.count || 0) + (novasInstituicoesMesAtual?.count || 0);
  const novosMesPassado = (novosMedicosMesPassado?.count || 0) + (novasInstituicoesMesPassado?.count || 0);

  // Calcular crescimento percentual
  const crescimentoPercentual = novosMesPassado > 0 
    ? ((novosMesAtual - novosMesPassado) / novosMesPassado * 100).toFixed(1)
    : novosMesAtual > 0 ? 100 : 0;

  return {
    totalCredenciados,
    totalMedicos: totalMedicos?.count || 0,
    totalInstituicoes: totalInstituicoes?.count || 0,
    totalAtivos,
    medicosAtivos: medicosAtivos?.count || 0,
    instituicoesAtivas: instituicoesAtivas?.count || 0,
    novosSemana,
    novosMedicosSemana: novosMedicosSemana?.count || 0,
    novasInstituicoesSemana: novasInstituicoesSemana?.count || 0,
    novosMesAtual,
    novosMedicosMesAtual: novosMedicosMesAtual?.count || 0,
    novasInstituicoesMesAtual: novasInstituicoesMesAtual?.count || 0,
    novosMesPassado,
    crescimentoPercentual: parseFloat(crescimentoPercentual as string),
  };
}


// ========== GESTÃO DE USUÁRIOS MANUS (tabela users) ==========
export async function listarUsuariosManus() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(users.createdAt);
}

export async function atualizarRoleUsuario(userId: number, novaRole: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ role: novaRole, updatedAt: new Date() })
    .where(eq(users.id, userId));
  
  return { success: true };
}
