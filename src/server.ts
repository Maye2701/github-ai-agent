import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { crearServidor } from "./mcp-server.js";

const server = crearServidor();

const transport = new StdioServerTransport();

await server.connect(transport);