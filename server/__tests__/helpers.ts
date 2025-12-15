import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';

/**
 * Helper para criar contexto de teste simulado
 */
export function createMockContext(overrides?: Partial<TrpcContext>): TrpcContext {
  const mockReq = {
    headers: {},
    cookies: {},
  } as any;

  const mockRes = {
    cookie: () => {},
    clearCookie: () => {},
    setHeader: () => {},
  } as any;

  return {
    req: mockReq,
    res: mockRes,
    user: overrides?.user || null,
    ...overrides,
  };
}

/**
 * Helper para criar contexto de admin autenticado
 */
export function createAdminContext(): TrpcContext {
  return createMockContext({
    user: {
      id: 1,
      openId: 'test-admin-openid',
      name: 'Admin Test',
      email: 'admin@test.com',
      passwordHash: null,
      resetToken: null,
      resetTokenExpiry: null,
      role: 'admin',
      loginMethod: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

/**
 * Helper para criar contexto de usuário comum autenticado
 */
export function createUserContext(): TrpcContext {
  return createMockContext({
    user: {
      id: 2,
      openId: 'test-user-openid',
      name: 'User Test',
      email: 'user@test.com',
      passwordHash: null,
      resetToken: null,
      resetTokenExpiry: null,
      role: 'user',
      loginMethod: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

/**
 * Helper para criar caller de tRPC
 */
export function createCaller(ctx: TrpcContext) {
  return appRouter.createCaller(ctx);
}

export { describe, it, expect, beforeAll, afterAll };
