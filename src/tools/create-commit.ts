import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCommitSchema } from "../schemas/create-commit.schema.js";
import { createCommit } from "../github/operations.js";


export function registrarCrearCommit(server: McpServer) {
    server.registerTool(
        "create_commit",
        {
            description: "Crea o reemplaza un archivo en la rama predeterminada. Recibe contenido de texto sin codificar. Para actualizar un archivo, requiere su SHA actual",
            inputSchema: createCommitSchema,

        },

        async (datos) => {

            const commit = await createCommit(datos);
            const resumen = {
                ruta: commit.content?.path,
                shaArchivo: commit.content?.sha,
                shaCommit: commit.commit?.sha
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