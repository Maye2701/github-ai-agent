import { z } from "zod";


export const saludarSchema =
    z.object({
        nombre: z.string().trim().min(1, "El nombre es obligatorio")
    });

