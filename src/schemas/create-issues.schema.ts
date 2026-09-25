import { z } from "zod";

export const createIssueSchema = z.object({
    owner: z.string().trim().min(1, "Propietario es obligatorio")
        .describe("Propietario del repositorio (usuario u organización)"),
    repo: z.string().trim().min(1, "Repository es obligatorio")
        .describe("Nombre del repositorio sin el propietario"),
    title: z.string().trim().min(1, "Titulo es obligatorio")
        .describe("Título corto y descriptivo del issue"),
    body: z.string().trim().optional()
        .describe("Detalle o descripción del issue (opcional)"),
})
    .describe("Abre un issue nuevo en el repositorio indicado");

export type CreateIssueInput = z.infer<typeof createIssueSchema>;