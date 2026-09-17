import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registrarSaludar } from "./tools/saludar.js";
import { registrarListarRepositorios } from "./tools/list-repositories.js";
import { registrarCrearRepositorio } from "./tools/create-repositories.js"


const serverName: string = "github-ai-agent";
const server = new McpServer({
    name: serverName,
    version: "1.0.0"
});

registrarSaludar(server);
registrarListarRepositorios(server);
registrarCrearRepositorio(server);

const transport = new StdioServerTransport();

await server.connect(transport);






