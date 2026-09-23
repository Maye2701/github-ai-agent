import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRepositorySchema, type CreateRepositoryInput } from "../schemas/create-repositories.schema.js";
import { crearRepositorio } from "../github/operations.js";
import { clasificarError } from "../errors/index.js";
import { registrarError } from "../utils/logging.js";


export function registrarCrearRepositorio(server: McpServer) {
    server.registerTool(
        "create_repository",
        {
            description: "Crea un repositorio nuevo en la cuenta del usuario autenticado con un nombre y una descripción opcional",
            inputSchema: createRepositorySchema,
        },
        createRepositoryHandler
    )
};

export async function createRepositoryHandler(datos: CreateRepositoryInput) {
    try {
        const repositorio = await crearRepositorio(datos);
        const resumen = {
            nombre: repositorio.full_name,
            descripcion: repositorio.description,
            url: repositorio.html_url
        };

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify(resumen)
            }]
        }
    } catch (error) {
        registrarError("create_repository", error);
        const errorClasificado = clasificarError(error);
        return {
            isError: true,
            content: [
                {
                    type: "text" as const,
                    text: errorClasificado.message
                }
            ]
        }
    }
}
