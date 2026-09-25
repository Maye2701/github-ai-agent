import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRepositoriesSchema, type ListRepositoriesInput } from "../schemas/list-repositories.schema.js";
import { listarRepositorios } from "../github/operations.js";
import { clasificarError } from "../errors/index.js"
import { logger, registrarError } from "../utils/logging.js";


export function registrarListarRepositorios(server: McpServer) {
    server.registerTool(
        "list_repositories",
        {
            description: "Lista los repositorios de un usuario u organización (owner), página por página (de la 1 a la 100). Úsala para consultar o mostrar repositorios; no crea ni modifica nada.",
            inputSchema: listRepositoriesSchema,

        },
        listarRepositoriosHandler
    )
};

export async function listarRepositoriosHandler(datos: ListRepositoriesInput) {
    logger.info("solicitud recibida", {
        tool: "list_repositories",

    });

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
