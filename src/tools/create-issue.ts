import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createIssueSchema } from "../schemas/create-issues.schema.js";
import { crearIssue } from "../github/operations.js";


export function registrarCrearIssue(server: McpServer) {
    server.registerTool(
        "create_issue",
        {
            description: "abre un issue en el repositorio indicado por propietario y nombre.",
            inputSchema: createIssueSchema,

        },

        async (datos) => {

            const issue = await crearIssue(datos);
            const resumen = {
                numero: issue.number,
                titulo: issue.title,
                url: issue.html_url
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
