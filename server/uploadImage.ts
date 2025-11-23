import { storagePut } from "./storage";
import { randomBytes } from "crypto";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadImageInput {
  base64Data: string;
  filename: string;
  mimeType: string;
}

export interface UploadImageResult {
  url: string;
  error?: string;
}

/**
 * Valida e faz upload de uma imagem para o S3
 * @param input - Dados da imagem em base64
 * @returns URL da imagem no S3 ou erro
 */
export async function uploadImage(input: UploadImageInput): Promise<UploadImageResult> {
  try {
    // Validar tipo de arquivo
    if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
      return {
        url: "",
        error: "Tipo de arquivo não permitido. Use apenas JPEG, PNG ou WebP."
      };
    }

    // Converter base64 para buffer
    const base64Data = input.base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Validar tamanho
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        url: "",
        error: "Arquivo muito grande. Tamanho máximo: 5MB."
      };
    }

    // Gerar nome único para o arquivo
    const extension = input.mimeType.split("/")[1];
    const randomSuffix = randomBytes(8).toString("hex");
    const fileKey = `uploads/${Date.now()}-${randomSuffix}.${extension}`;

    // Fazer upload ao S3
    const { url } = await storagePut(fileKey, buffer, input.mimeType);

    return { url };
  } catch (error) {
    console.error("Erro ao fazer upload de imagem:", error);
    return {
      url: "",
      error: "Erro ao fazer upload da imagem. Tente novamente."
    };
  }
}
