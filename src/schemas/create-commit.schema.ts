import { z } from "zod";

export const createCommitSchema = z.object({
    owner: z.string().trim().min(1, "Indica el propietario del repositorio")
        .describe("Propietario del repositorio (usuario u organización)"),
    repo: z.string().trim().min(1, "indica el nombre del repositorio")
        .describe("Nombre del repositorio sin el propietario"),
    path: z.string().trim().min(1, "indica la ruta del archivo")
        .describe("Ruta relativa del archivo dentro del repositorio, por ejemplo demo.txt o docs/notas.md"),
    message: z.string().trim().min(1, "indica el mensaje del commit")
        .describe("Mensaje descriptivo del commit"),
    content: z.string()
        .describe("Contenido de texto completo del archivo. Se envía tal cual: admite vacío y no se recorta"),
    sha: z.string().trim().optional()
        .describe("SHA actual del archivo. Solo es necesario al actualizar un archivo existente; no debe ser el SHA del commit"),
})
    .describe("Crea o reemplaza un archivo de texto en la rama predeterminada mediante un commit");

export type CreateCommitInput = z.infer<typeof createCommitSchema>;