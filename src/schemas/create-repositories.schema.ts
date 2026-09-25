import { z } from "zod";

export const createRepositorySchema = z.object({
    name: z.string().trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "Maximo 100 caracteres")
        .regex(/^[A-Za-z0-9-]+$/, "Usa solo letras sin tildes, números y guiones")
        .describe("Nombre del repositorio: entre 3 y 100 caracteres, solo letras sin tildes, números y guiones"),
    description: z.string().trim().optional()
        .describe("Descripción corta del repositorio (opcional)"),
})
    .describe("Crea un repositorio público nuevo en la cuenta del usuario autenticado");

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;