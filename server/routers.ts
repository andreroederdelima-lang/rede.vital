import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  medicos: router({
    listar: publicProcedure
      .input(z.object({
        busca: z.string().optional(),
        especialidade: z.string().optional(),
        municipio: z.string().optional(),
        descontoMinimo: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarMedicos } = await import("./db");
        return listarMedicos(input);
      }),
    
    listarEspecialidades: publicProcedure.query(async () => {
      const { listarEspecialidades } = await import("./db");
      return listarEspecialidades();
    }),

    obter: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { obterMedicoPorId } = await import("./db");
        return obterMedicoPorId(input);
      }),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        especialidade: z.string(),
        subespecialidade: z.string().optional(),
        municipio: z.string(),
        endereco: z.string(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        tipoAtendimento: z.enum(["presencial", "telemedicina", "ambos"]).default("presencial"),
        descontoPercentual: z.number().default(0),
        observacoes: z.string().optional(),
        contatoParceria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarMedico } = await import("./db");
        return criarMedico(input);
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          especialidade: z.string().optional(),
          subespecialidade: z.string().optional(),
          municipio: z.string().optional(),
          endereco: z.string().optional(),
          telefone: z.string().optional(),
          whatsapp: z.string().optional(),
          tipoAtendimento: z.enum(["presencial", "telemedicina", "ambos"]).optional(),
          descontoPercentual: z.number().optional(),
          observacoes: z.string().optional(),
          contatoParceria: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { atualizarMedico } = await import("./db");
        return atualizarMedico(input.id, input.data);
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirMedico } = await import("./db");
        return excluirMedico(input);
      }),
  }),

  instituicoes: router({
    listar: publicProcedure
      .input(z.object({
        busca: z.string().optional(),
        categoria: z.string().optional(),
        municipio: z.string().optional(),
        descontoMinimo: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarInstituicoes } = await import("./db");
        return listarInstituicoes(input);
      }),

    obter: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { obterInstituicaoPorId } = await import("./db");
        return obterInstituicaoPorId(input);
      }),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        categoria: z.enum(["clinica", "farmacia", "laboratorio", "academia", "hospital", "outro"]),
        municipio: z.string(),
        endereco: z.string(),
        telefone: z.string().optional(),
        email: z.string().optional(),
        descontoPercentual: z.number().default(0),
        observacoes: z.string().optional(),
        contatoParceria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarInstituicao } = await import("./db");
        return criarInstituicao(input);
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          categoria: z.enum(["clinica", "farmacia", "laboratorio", "academia", "hospital", "outro"]).optional(),
          municipio: z.string().optional(),
          endereco: z.string().optional(),
          telefone: z.string().optional(),
          email: z.string().optional(),
          descontoPercentual: z.number().optional(),
          observacoes: z.string().optional(),
          contatoParceria: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { atualizarInstituicao } = await import("./db");
        return atualizarInstituicao(input.id, input.data);
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirInstituicao } = await import("./db");
        return excluirInstituicao(input);
      }),
  }),

  municipios: router({
    listar: publicProcedure.query(async () => {
      const { listarMunicipios } = await import("./db");
      return listarMunicipios();
    }),
  }),
});

export type AppRouter = typeof appRouter;
