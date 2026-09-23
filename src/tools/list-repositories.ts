import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRepositoriesSchema, type ListRepositoriesInput } from "../schemas/list-repositories.schema.js";
import { listarRepositorios } from "../github/operations.js";
import { clasificarError } from "../errors/index.js"
import { registrarError } from "../utils/logging.js";


export function registrarListarRepositorios(server: McpServer) {
    server.registerTool(
        "list_repositories",
        {
            description: "lista una pagina de repositorios accesibles para el usuario autenticado",
            inputSchema: listRepositoriesSchema,

        },
        listarRepositoriosHandler
    )
};

export async function listarRepositoriosHandler(datos: ListRepositoriesInput) {
    try {
        const repositorios = await listarRepositorios(datos);
        const resumen = repositorios.map(repo => {
            return {
                nombre: repo.full_name,
                descripcion: repo.description,
                url: repo.html_url
            }
        })
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify(resumen)

            }]
        }

    } catch (error) {
        registrarError("list_repositories", error);
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
