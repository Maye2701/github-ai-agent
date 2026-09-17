import { z } from "zod";

export const createIssueSchema = z.object({
    owner: z.string().trim().min(1, "Propetario es obligatorio"),
    repo: z.string().trim().min(1, "Repository es obligatorio"),
    title: z.string().trim().min(1, "Titulo es obligatorio"),
    body: z.string().trim().optional()



});


export type CreateIssueInput = z.infer<typeof createIssueSchema>;

