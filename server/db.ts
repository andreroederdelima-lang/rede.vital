import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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

import { medicos, instituicoes, Medico, Instituicao, InsertMedico, InsertInstituicao } from "../drizzle/schema";
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
        like(instituicoes.endereco, `%${filtros.busca}%`)
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
