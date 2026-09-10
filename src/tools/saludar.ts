import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { saludarSchema } from "../schemas/saludar.schema.js";


export function registrarSaludar(server: McpServer) {
    server.registerTool(
        "saludar",
        {
            description: "genera un saludo personalizado",
            inputSchema: saludarSchema,

        },
        (datos) => {
            return {
                content: [{
                    type: "text",
                    text: `¡Hola, ${datos.nombre}!`
                }]
            };
        }
    )
};





