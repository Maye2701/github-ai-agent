import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createIssueSchema, type CreateIssueInput } from "../schemas/create-issues.schema.js";
import { crearIssue } from "../github/operations.js";
import { clasificarError } from "../errors/index.js";
import { logger, registrarError } from "../utils/logging.js";



export function registrarCrearIssue(server: McpServer) {
    server.registerTool(
        "create_issue",
        {
            description: "Abre un issue nuevo en el repositorio indicado por propietario y nombre. Requiere owner, repo y un título; el cuerpo (body) es opcional.",
            inputSchema: createIssueSchema,

        },
        createIssueHandler
    )
};

export async function createIssueHandler(datos: CreateIssueInput) {
    logger.info("solicitud recibida", {
        tool: "create_issue",
    });
    try {
        const issue = await crearIssue(datos);
        const resumen = {
            numero: issue.number,
            titulo: issue.title,
            url: issue.html_url
        };

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify(resumen)
            }]
        }
    } catch (error) {

        registrarError("create_issue", error);
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
};
