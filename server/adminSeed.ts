// Endpoint de seed temporário para migração Manus → Railway.
// Protegido pelo header `X-Admin-Seed-Token` (comparado contra ADMIN_SEED_TOKEN).
// Remover este arquivo + rota + env var depois da migração concluída.

import { Router, type Request, type Response } from "express";
import { getDb } from "./db";
import {
  medicos,
  instituicoes,
  procedimentos,
  copys,
} from "../drizzle/schema";

const router = Router();

function checkToken(req: Request, res: Response): boolean {
  const provided = req.headers["x-admin-seed-token"];
  const expected = process.env.ADMIN_SEED_TOKEN;

  if (!expected) {
    res.status(503).json({ error: "ADMIN_SEED_TOKEN não configurado no servidor" });
    return false;
  }
  if (provided !== expected) {
    res.status(401).json({ error: "Token inválido" });
    return false;
  }
  return true;
}

router.post("/bulk-import", async (req: Request, res: Response) => {
  if (!checkToken(req, res)) return;

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database indisponível" });
    return;
  }

  const body = req.body as {
    medicos?: any[];
    instituicoes?: any[];
    procedimentos?: any[];
    copys?: any[];
  };

  const counts = { medicos: 0, instituicoes: 0, procedimentos: 0, copys: 0 };

  try {
    if (body.medicos?.length) {
      for (const m of body.medicos) {
        const { id: _ignore, createdAt, updatedAt, ...rest } = m;
        await db.insert(medicos).values(rest as any).onDuplicateKeyUpdate({ set: rest as any });
        counts.medicos++;
      }
    }

    if (body.instituicoes?.length) {
      for (const i of body.instituicoes) {
        const { id: _ignore, createdAt, updatedAt, ...rest } = i;
        await db.insert(instituicoes).values(rest as any).onDuplicateKeyUpdate({ set: rest as any });
        counts.instituicoes++;
      }
    }

    if (body.procedimentos?.length) {
      for (const p of body.procedimentos) {
        const { id: _ignore, createdAt, updatedAt, ...rest } = p;
        await db.insert(procedimentos).values(rest as any).onDuplicateKeyUpdate({ set: rest as any });
        counts.procedimentos++;
      }
    }

    if (body.copys?.length) {
      for (const c of body.copys) {
        const { id: _ignore, createdAt, updatedAt, ...rest } = c;
        await db.insert(copys).values(rest as any).onDuplicateKeyUpdate({ set: rest as any });
        counts.copys++;
      }
    }

    res.json({ success: true, counts });
  } catch (err: any) {
    console.error("[adminSeed] import falhou:", err);
    res.status(500).json({ error: err.message || "Erro ao importar" });
  }
});

export default router;
