import { z } from "zod";

export const listRepositoriesSchema = z.object({
    owner: z.string().trim().min(1, "Indica el propietario del repositorio")
        .describe("Nombre de usuario u organización de GitHub"),
    page: z.number().int("page debe ser un número entero")
        .min(1, "page debe ser mayor o igual a 1")
        .max(100, "page no puede superar 100")
        .optional()
        .describe("Página a listar: solo se listarán las páginas de la 1 a la 100"),
})
    .strict()
    .describe("Lista los repositorios de un usuario, página por página (de la 1 a la 100)");

export type ListRepositoriesInput = z.infer<typeof listRepositoriesSchema>;