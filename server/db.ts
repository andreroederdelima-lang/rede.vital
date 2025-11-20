import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, solicitacoesParceria, InsertSolicitacaoParceria, SolicitacaoParceria, usuariosAutorizados, InsertUsuarioAutorizado, UsuarioAutorizado, solicitacoesAtualizacao, InsertSolicitacaoAtualizacao, SolicitacaoAtualizacao, medicos, instituicoes } from "../drizzle/schema";
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
