import { Router, Request, Response, NextFunction } from 'express';
import { getDb } from './db';
import { apiKeys, apiLogs, medicos, instituicoes, procedimentos } from '../drizzle/schema';
import { eq, and, like, sql } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

/**
 * Middleware de autenticação via API Key
 */
async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key não fornecida. Envie a chave no header X-API-Key'
    });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    // Verificar se API Key existe e está ativa
    const [keyRecord] = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.apiKey, apiKey),
        eq(apiKeys.ativa, 1)
      ))
      .limit(1);

    if (!keyRecord) {
      // Registrar tentativa de acesso com chave inválida
      await db.insert(apiLogs).values({
        apiKeyId: 0, // ID 0 para chaves inválidas
        endpoint: req.path,
        method: req.method,
        statusCode: 401,
        responseTime: Date.now() - startTime,
        queryParams: JSON.stringify(req.query),
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      return res.status(401).json({
        success: false,
        error: 'API Key inválida ou desativada'
      });
    }

    // Atualizar última utilização e contador
    await db
      .update(apiKeys)
      .set({
        lastUsedAt: new Date(),
        requestCount: sql`${apiKeys.requestCount} + 1`
      })
      .where(eq(apiKeys.id, keyRecord.id));

    // Adicionar informações da API Key na requisição
    (req as any).apiKeyId = keyRecord.id;
    (req as any).apiKeyName = keyRecord.nome;
    (req as any).startTime = startTime;

    next();
  } catch (error) {
    console.error('[API] Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao validar API Key'
    });
  }
}

/**
 * Middleware para registrar logs de acesso
 */
async function logApiAccess(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  const startTime = (req as any).startTime || Date.now();

  res.send = function (data: any) {
    res.send = originalSend;

    // Registrar log de forma assíncrona (não bloquear resposta)
    (async () => {
      try {
        const db = await getDb();
        if (db && (req as any).apiKeyId) {
          await db.insert(apiLogs).values({
            apiKeyId: (req as any).apiKeyId,
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
            queryParams: JSON.stringify(req.query),
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
          });
        }
      } catch (error) {
        console.error('[API] Erro ao registrar log:', error);
      }
    })();

    return originalSend.call(this, data);
  };

  next();
}

// Aplicar middlewares em todas as rotas
router.use(authenticateApiKey);
router.use(logApiAccess);

/**
 * GET /api/public/credenciados/medicos
 * Lista todos os médicos credenciados
 */
router.get('/credenciados/medicos', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    // Parâmetros de filtro
    const { municipio, especialidade } = req.query;

    // Construir filtros
    const filters: any[] = [eq(medicos.ativo, 1)];

    if (municipio) {
      filters.push(eq(medicos.municipio, municipio as string));
    }

    if (especialidade) {
      filters.push(eq(medicos.especialidade, especialidade as string));
    }

    const query = db.select().from(medicos).where(and(...filters));

    // Buscar dados com paginação
    const results = await query.limit(limit).offset(offset);

    // Contar total de registros
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(medicos)
      .where(eq(medicos.ativo, 1));

    // Formatar resposta (remover campos internos)
    const data = results.map((medico: any) => ({
      id: medico.id,
      nome: medico.nome,
      especialidade: medico.especialidade,
      areaAtuacao: medico.areaAtuacao,
      numeroRegistroConselho: medico.numeroRegistroConselho,
      tipoAtendimento: medico.tipoAtendimento,
      municipio: medico.municipio,
      endereco: medico.endereco,
      telefone: medico.telefone,
      whatsapp: medico.whatsapp,
      whatsappSecretaria: medico.whatsappSecretaria,
      email: medico.email,
      fotoUrl: medico.fotoUrl,
      logoUrl: medico.logoUrl,
      valorParticular: medico.valorParticular,
      valorAssinanteVital: medico.valorAssinanteVital,
      descontoPercentual: medico.descontoPercentual,
      updatedAt: medico.updatedAt,
    }));

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('[API] Erro ao listar médicos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar médicos'
    });
  }
});

/**
 * GET /api/public/credenciados/servicos
 * Lista todas as instituições de serviços
 */
router.get('/credenciados/servicos', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    // Parâmetros de filtro
    const { municipio, categoria, tipoServico, procedimento } = req.query;

    // Construir filtros
    const filters: any[] = [eq(instituicoes.ativo, 1)];

    if (municipio) {
      filters.push(eq(instituicoes.municipio, municipio as string));
    }

    if (categoria) {
      filters.push(eq(instituicoes.categoria, categoria as string));
    }

    if (tipoServico) {
      filters.push(eq(instituicoes.tipoServico, tipoServico as any));
    }

    const query = db.select().from(instituicoes).where(and(...filters));

    // Buscar dados com paginação
    let results = await query.limit(limit).offset(offset);

    // Se filtro de procedimento foi especificado, buscar instituições que oferecem esse procedimento
    if (procedimento) {
      const instituicoesComProcedimento = await db
        .select({ instituicaoId: procedimentos.instituicaoId })
        .from(procedimentos)
        .where(and(
          eq(procedimentos.ativo, 1),
          like(procedimentos.nome, `%${procedimento}%`)
        ));

      const instituicaoIds = instituicoesComProcedimento.map(p => p.instituicaoId);
      results = results.filter((inst: any) => instituicaoIds.includes(inst.id));
    }

    // Buscar procedimentos de cada instituição
    const data = await Promise.all(results.map(async (instituicao: any) => {
      const procs = await db
        .select()
        .from(procedimentos)
        .where(and(
          eq(procedimentos.instituicaoId, instituicao.id),
          eq(procedimentos.ativo, 1)
        ));

      return {
        id: instituicao.id,
        nome: instituicao.nome,
        categoria: instituicao.categoria,
        tipoServico: instituicao.tipoServico,
        municipio: instituicao.municipio,
        endereco: instituicao.endereco,
        telefone: instituicao.telefone,
        whatsappSecretaria: instituicao.whatsappSecretaria,
        email: instituicao.email,
        fotoUrl: instituicao.fotoUrl,
        logoUrl: instituicao.logoUrl,
        valorParticular: instituicao.valorParticular,
        valorAssinanteVital: instituicao.valorAssinanteVital,
        procedimentos: procs.map(p => ({
          id: p.id,
          nome: p.nome,
          valorParticular: p.valorParticular,
          valorAssinanteVital: p.valorAssinanteVital,
        })),
        updatedAt: instituicao.updatedAt,
      };
    }));

    // Contar total de registros
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(instituicoes)
      .where(eq(instituicoes.ativo, 1));

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('[API] Erro ao listar serviços:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar serviços'
    });
  }
});

/**
 * GET /api/public/credenciados/:id
 * Retorna detalhes de um credenciado específico
 */
router.get('/credenciados/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    const id = parseInt(req.params.id);
    const tipo = req.query.tipo as string; // "medico" ou "servico"

    if (!tipo || !['medico', 'servico'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro "tipo" é obrigatório e deve ser "medico" ou "servico"'
      });
    }

    if (tipo === 'medico') {
      const [medico] = await db
        .select()
        .from(medicos)
        .where(and(
          eq(medicos.id, id),
          eq(medicos.ativo, 1)
        ))
        .limit(1);

      if (!medico) {
        return res.status(404).json({
          success: false,
          error: 'Médico não encontrado'
        });
      }

      return res.json({
        success: true,
        data: {
          id: medico.id,
          tipo: 'medico',
          nome: medico.nome,
          especialidade: medico.especialidade,
          areaAtuacao: medico.areaAtuacao,
          numeroRegistroConselho: medico.numeroRegistroConselho,
          tipoAtendimento: medico.tipoAtendimento,
          municipio: medico.municipio,
          endereco: medico.endereco,
          telefone: medico.telefone,
          whatsapp: medico.whatsapp,
          whatsappSecretaria: medico.whatsappSecretaria,
          email: medico.email,
          fotoUrl: medico.fotoUrl,
          logoUrl: medico.logoUrl,
          valorParticular: medico.valorParticular,
          valorAssinanteVital: medico.valorAssinanteVital,
          descontoPercentual: medico.descontoPercentual,
          updatedAt: medico.updatedAt,
        }
      });
    } else {
      const [instituicao] = await db
        .select()
        .from(instituicoes)
        .where(and(
          eq(instituicoes.id, id),
          eq(instituicoes.ativo, 1)
        ))
        .limit(1);

      if (!instituicao) {
        return res.status(404).json({
          success: false,
          error: 'Instituição não encontrada'
        });
      }

      // Buscar procedimentos
      const procs = await db
        .select()
        .from(procedimentos)
        .where(and(
          eq(procedimentos.instituicaoId, instituicao.id),
          eq(procedimentos.ativo, 1)
        ));

      return res.json({
        success: true,
        data: {
          id: instituicao.id,
          tipo: 'servico',
          nome: instituicao.nome,
          categoria: instituicao.categoria,
          tipoServico: instituicao.tipoServico,
          municipio: instituicao.municipio,
          endereco: instituicao.endereco,
          telefone: instituicao.telefone,
          whatsappSecretaria: instituicao.whatsappSecretaria,
          email: instituicao.email,
          fotoUrl: instituicao.fotoUrl,
          logoUrl: instituicao.logoUrl,
          valorParticular: instituicao.valorParticular,
          valorAssinanteVital: instituicao.valorAssinanteVital,
          procedimentos: procs.map(p => ({
            id: p.id,
            nome: p.nome,
            valorParticular: p.valorParticular,
            valorAssinanteVital: p.valorAssinanteVital,
          })),
          updatedAt: instituicao.updatedAt,
        }
      });
    }
  } catch (error) {
    console.error('[API] Erro ao buscar credenciado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar credenciado'
    });
  }
});

/**
 * GET /api/public/credenciados/municipios
 * Lista todos os municípios com credenciados
 */
router.get('/credenciados/municipios', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    // Buscar municípios únicos de médicos
    const municipiosMedicos = await db
      .select({
        municipio: medicos.municipio,
        total: sql<number>`count(*)`
      })
      .from(medicos)
      .where(eq(medicos.ativo, 1))
      .groupBy(medicos.municipio);

    // Buscar municípios únicos de instituições
    const municipiosInstituicoes = await db
      .select({
        municipio: instituicoes.municipio,
        total: sql<number>`count(*)`
      })
      .from(instituicoes)
      .where(eq(instituicoes.ativo, 1))
      .groupBy(instituicoes.municipio);

    // Combinar e agrupar
    const municipiosMap = new Map<string, { totalMedicos: number; totalServicos: number }>();

    municipiosMedicos.forEach(m => {
      municipiosMap.set(m.municipio, {
        totalMedicos: Number(m.total),
        totalServicos: 0
      });
    });

    municipiosInstituicoes.forEach(m => {
      const existing = municipiosMap.get(m.municipio);
      if (existing) {
        existing.totalServicos = Number(m.total);
      } else {
        municipiosMap.set(m.municipio, {
          totalMedicos: 0,
          totalServicos: Number(m.total)
        });
      }
    });

    const data = Array.from(municipiosMap.entries()).map(([municipio, counts]) => ({
      municipio,
      totalMedicos: counts.totalMedicos,
      totalServicos: counts.totalServicos
    }));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API] Erro ao listar municípios:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar municípios'
    });
  }
});

/**
 * GET /api/public/credenciados/especialidades
 * Lista todas as especialidades médicas disponíveis
 */
router.get('/credenciados/especialidades', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    const especialidades = await db
      .select({
        especialidade: medicos.especialidade,
        total: sql<number>`count(*)`
      })
      .from(medicos)
      .where(eq(medicos.ativo, 1))
      .groupBy(medicos.especialidade);

    const data = especialidades.map(e => ({
      especialidade: e.especialidade,
      total: Number(e.total)
    }));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API] Erro ao listar especialidades:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar especialidades'
    });
  }
});

/**
 * GET /api/public/credenciados/categorias
 * Lista todas as categorias de serviços disponíveis
 */
router.get('/credenciados/categorias', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao conectar com banco de dados'
      });
    }

    const categorias = await db
      .select({
        categoria: instituicoes.categoria,
        tipoServico: instituicoes.tipoServico,
        total: sql<number>`count(*)`
      })
      .from(instituicoes)
      .where(eq(instituicoes.ativo, 1))
      .groupBy(instituicoes.categoria, instituicoes.tipoServico);

    const data = categorias.map(c => ({
      categoria: c.categoria,
      tipoServico: c.tipoServico,
      total: Number(c.total)
    }));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API] Erro ao listar categorias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar categorias'
    });
  }
});

export default router;
