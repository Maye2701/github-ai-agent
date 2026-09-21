
import { z } from "zod";

export const createCommitSchema = z.object({
    owner: z.string().trim().min(1, "Indica el propietario del repositorio"),
    repo: z.string().trim().min(1, "indica el nombre del repositorio"),
    path: z.string().trim().min(1, "indica la ruta del archivo"),
    message: z.string().trim().min(1, "indica el mensaje del commit"),
    content: z.string(),
    sha: z.string().trim().optional()

})

export type CreateCommitInput = z.infer<typeof createCommitSchema>;