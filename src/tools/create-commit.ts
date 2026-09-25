import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCommitSchema, type CreateCommitInput } from "../schemas/create-commit.schema.js";
import { createCommit } from "../github/operations.js";
import { clasificarError } from "../errors/index.js";
import { logger, registrarError } from "../utils/logging.js";

export function registrarCrearCommit(server: McpServer) {
    server.registerTool(
        "create_commit",
        {
            description: "Crea o reemplaza un archivo de texto en la rama predeterminada mediante un commit. Recibe el contenido sin codificar. Para actualizar un archivo existente, requiere el SHA actual del archivo (no del commit).",
            inputSchema: createCommitSchema,

        },
        createCommitHandler

    )
};

export async function createCommitHandler(datos: CreateCommitInput) {
    logger.info("solicitud recibida", {
        tool: "create_commit",
    });
    try {
        const commit = await createCommit(datos);
        const resumen = {
            ruta: commit.content?.path,
            shaArchivo: commit.content?.sha,
            shaCommit: commit.commit?.sha
        };

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify(resumen)
            }]
        }

    } catch (error) {
        registrarError("create_commit", error);
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
