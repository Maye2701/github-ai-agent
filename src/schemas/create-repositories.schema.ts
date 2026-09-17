import { z } from "zod";

export const createRepositorySchema = z.object({
    name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "Maximo 100 caracteres").regex(/^[A-Za-z0-9-]+$/, "Usa solo letras sin tildes, números y guiones"),
    description: z.string().trim().optional(),



});


export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;

