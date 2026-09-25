import { z } from "zod";

export const listIssuesSchema = z.object({
    owner: z.string().trim().min(1, "Indica el propietario del repositorio.")
        .describe("Propietario del repositorio (usuario u organización)"),
    repo: z.string().trim().min(1, "El nombre del repo no puede estar vacio")
        .describe("Nombre del repositorio sin el propietario"),
})
    .describe("Parámetros para listar los issues abiertos de un repositorio");

export type ListIssuesInput = z.infer<typeof listIssuesSchema>;