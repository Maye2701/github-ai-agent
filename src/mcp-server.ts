import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registrarListarRepositorios } from "./tools/list-repositories.js";
import { registrarCrearRepositorio } from "./tools/create-repositories.js"
import { registrarCrearIssue } from "./tools/create-issue.js";
import { registrarListarIssues } from "./tools/list-issues.js";
import { registrarCrearCommit } from "./tools/create-commit.js";

export function crearServidor(): McpServer {
    const server = new McpServer({
        name: "github-ai-agent",
        version: "1.0.0"
    });

    registrarListarRepositorios(server);
    registrarCrearRepositorio(server);
    registrarCrearIssue(server);
    registrarListarIssues(server);
    registrarCrearCommit(server);

    return server;
}