import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ENV } from "./env";

/**
 * Utilitários de autenticação para sistema híbrido (OAuth + Email/Senha)
 */

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 24;

/**
 * Gera hash bcrypt de uma senha
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara senha em texto plano com hash bcrypt
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Gera JWT para sessão de usuário interno
 * TODO: Implementar quando JWT_SECRET for adicionado ao ENV
 */
export function generateJWT(payload: {
  userId: number;
  email: string;
  role: string;
}): string {
  // Temporário: usar cookieSecret como fallback
  return jwt.sign(payload, ENV.cookieSecret, {
    expiresIn: "7d",
  });
}

/**
 * Verifica e decodifica JWT
 * TODO: Implementar quando JWT_SECRET for adicionado ao ENV
 */
export function verifyJWT(token: string): {
  userId: number;
  email: string;
  role: string;
} | null {
  try {
    // Temporário: usar cookieSecret como fallback
    const decoded = jwt.verify(token, ENV.cookieSecret) as {
      userId: number;
      email: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Gera token aleatório para recuperação de senha
 */
export function generateResetToken(): {
  token: string;
  expiry: Date;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + RESET_TOKEN_EXPIRY_HOURS);

  return { token, expiry };
}

/**
 * Valida se um token de recuperação ainda é válido
 */
export function isResetTokenValid(expiry: Date | null): boolean {
  if (!expiry) return false;
  return new Date() < new Date(expiry);
}
