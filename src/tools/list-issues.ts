import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listIssuesSchema, type ListIssuesInput } from "../schemas/list-issues.schema.js";
import { listarIssues } from "../github/operations.js";
import { clasificarError } from "../errors/index.js"
import { registrarError } from "../utils/logging.js"

export function registrarListarIssues(server: McpServer) {
    server.registerTool(
        "list_issues",
        {
            description: "Lista una página de issues abiertos del repositorio indicado, excluyendo pull requests ",
            inputSchema: listIssuesSchema,

        },
        listarIssuesHandler
    )
};

export async function listarIssuesHandler(datos: ListIssuesInput) {
    try {
        const issues = await listarIssues(datos);
        const resumen = issues.map(issue => {
            return {
                numero: issue.number,
                titulo: issue.title,
                url: issue.html_url
            }
        }
        )
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify(resumen)

            }]
        }
    } catch (error) {
        registrarError("list_issues", error);
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