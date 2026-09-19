import { z } from "zod";

export const listIssuesSchema = z.object({
    owner: z.string().trim().min(1, "Indica el propietario del repositorio."),
    repo: z.string().trim().min(1, "El nombre del repo no puede estar vacio"),
});

export type ListIssuesInput = z.infer<typeof listIssuesSchema>;
