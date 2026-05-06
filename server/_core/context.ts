import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /**
   * Verdadeiro quando o request é de um usuário interno (Manus OAuth OU sessão dados-internos).
   * Usado para decidir se campos sensíveis (preços, dados de contato do parceiro) podem
   * aparecer no payload tRPC.
   */
  isInterno: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let isInterno = false;

  try {
    user = await sdk.authenticateRequest(opts.req);
    isInterno = !!user;
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Fallback: sessão dados-internos (cookie "dados_internos_session" assinado em JWT).
  // Não promove o cookie a ctx.user (que é do tipo Manus User), apenas marca isInterno.
  if (!isInterno) {
    const cookieToken = opts.req.cookies?.dados_internos_session as string | undefined;
    if (cookieToken) {
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET!) as { tipo?: string };
        if (decoded?.tipo === "interno") {
          isInterno = true;
        }
      } catch {
        // token inválido/expirado — mantém como público
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    isInterno,
  };
}
