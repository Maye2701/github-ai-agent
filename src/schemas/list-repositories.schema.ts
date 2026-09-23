import { z } from "zod";

const tipoRepositorio = z.enum(["all", "owner", "public", "private", "member"]).optional();
const visibilidadRepositorio = z.enum(["all", "public", "private"]).optional();
const afiliacionRepositorio = z.enum(["owner", "collaborator", "organization_member"]).array().min(1, "debes ingresar al menos una afiliacion").optional();

export const listRepositoriesSchema = z.object({
    page: z.number().int().positive().optional(),
    per_page: z.number().int().positive().max(100).optional(),
    type: tipoRepositorio,
    visibility: visibilidadRepositorio,
    sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
    direction: z.enum(["asc", "desc"]).optional(),
    affiliation: afiliacionRepositorio,
})
    .refine((datos) => datos.type === undefined ||
        (datos.visibility === undefined && datos.affiliation === undefined), {
        message: "si proporcionas type, no puedes proporcionar visibility o affiliation",
        path: ["type", "visibility", "affiliation"],

    })



export type ListRepositoriesInput = z.infer<typeof listRepositoriesSchema>;
