import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRepositoriesSchema } from "../schemas/list-repositories.schema.js";
import { listarRepositorios } from "../github/operations.js";


export function registrarListarRepositorios(server: McpServer) {
    server.registerTool(
        "list_repositories",
        {
            description: "lista una pagina de repositorios accesibles para el usuario autenticado",
            inputSchema: listRepositoriesSchema,

        },

        async () => {
            const repositorios = await listarRepositorios();
            const resumen = repositorios.map(repo => {
                return {
                    nombre: repo.full_name,
                    descripcion: repo.description,
                    url: repo.html_url
                }
            })
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(resumen)

                }]
            }

        }

    )
};

