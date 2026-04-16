import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Rate limiting para mutations públicas (ex: solicitar parceria, avaliações, sugestões).
 * Limita a 10 requisições por IP a cada 10 minutos para prevenir spam/flood.
 */
const publicRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const PUBLIC_RATE_LIMIT = 10;
const PUBLIC_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

const rateLimitPublic = t.middleware(async opts => {
  const { ctx, next } = opts;
  const ip = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || ctx.req.socket?.remoteAddress
    || 'unknown';

  const now = Date.now();
  const entry = publicRateLimitStore.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= PUBLIC_RATE_LIMIT) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Muitas requisições. Aguarde alguns minutos antes de tentar novamente.`,
      });
    }
    entry.count++;
  } else {
    publicRateLimitStore.set(ip, { count: 1, resetAt: now + PUBLIC_RATE_WINDOW_MS });
  }

  // Limpeza periódica de entradas expiradas (evita crescimento ilimitado do Map)
  if (publicRateLimitStore.size > 5000) {
    for (const [key, val] of publicRateLimitStore) {
      if (now >= val.resetAt) publicRateLimitStore.delete(key);
    }
  }

  return next();
});

/**
 * Procedure pública com rate limiting — use em mutations abertas ao público.
 */
export const publicRateLimitedProcedure = t.procedure.use(rateLimitPublic);
