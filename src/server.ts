import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";
import { registrarListarRepositorios } from "./tools/list-repositories.js";
import { registrarCrearRepositorio } from "./tools/create-repositories.js"
import { registrarCrearIssue } from "./tools/create-issue.js";
import { registrarListarIssues } from "./tools/list-issues.js";
import { registrarCrearCommit } from "./tools/create-commit.js";

const serverName: string = "github-ai-agent";

export function crearServidor(): McpServer {
    const server = new McpServer({
        name: serverName,
        version: "1.0.0"
    });

    registrarListarRepositorios(server);
    registrarCrearRepositorio(server);
    registrarCrearIssue(server);
    registrarListarIssues(server);
    registrarCrearCommit(server);

    return server;
}

// Solo conecta stdio cuando el archivo se ejecuta directamente
// (node build/server.js). Al importarlo (tests) devuelve la factory.
const seEjecutaDirecto =
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(process.argv[1]).href;

if (seEjecutaDirecto) {
    const server = crearServidor();
    const transport = new StdioServerTransport();

    await server.connect(transport);
}