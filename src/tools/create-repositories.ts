import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRepositorySchema } from "../schemas/create-repositories.schema.js";
import { crearRepositorio } from "../github/operations.js";


export function registrarCrearRepositorio(server: McpServer) {
    server.registerTool(
        "create_repository",
        {
            description: "Crea un repositorio nuevo en la cuenta del usuario autenticado con un nombre y una descripción opcional",
            inputSchema: createRepositorySchema,

        },

        async (datos) => {
            const repositorio = await crearRepositorio(datos);
            const resumen = {
                nombre: repositorio.full_name,
                descripcion: repositorio.description,
                url: repositorio.html_url
            };

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(resumen)
                }]
            }

        }
    );
};
