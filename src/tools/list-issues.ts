import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listIssuesSchema } from "../schemas/list-issues.schema.js";
import { listarIssues } from "../github/operations.js";


export function registrarListarIssues(server: McpServer) {
    server.registerTool(
        "list_issues",
        {
            description: "lista las issues de un repositorio, no incluye pull request ",
            inputSchema: listIssuesSchema,

        },

        async (datos) => {
            const issues = await listarIssues(datos);
            const resumen = issues.map(issue => {
                return {
                    number: issue.number,
                    title: issue.title,
                    url: issue.html_url
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

