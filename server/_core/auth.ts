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
 * Gera JWT para autenticação
 */
export function generateJWT(payload: {
  userId: number;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, ENV.jwtSecret, {
    expiresIn: "7d", // Token válido por 7 dias
  });
}

/**
 * Verifica e decodifica JWT
 */
export function verifyJWT(token: string): {
  userId: number;
  email: string;
  role: string;
} | null {
  try {
    const decoded = jwt.verify(token, ENV.jwtSecret) as {
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
