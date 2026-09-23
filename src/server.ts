import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registrarListarRepositorios } from "./tools/list-repositories.js";
import { registrarCrearRepositorio } from "./tools/create-repositories.js"
import { registrarCrearIssue } from "./tools/create-issue.js";
import { registrarListarIssues } from "./tools/list-issues.js";
import { registrarCrearCommit } from "./tools/create-commit.js";


const serverName: string = "github-ai-agent";
const server = new McpServer({
    name: serverName,
    version: "1.0.0"
});

registrarListarRepositorios(server);
registrarCrearRepositorio(server);
registrarCrearIssue(server);
registrarListarIssues(server);
registrarCrearCommit(server);

const transport = new StdioServerTransport();

await server.connect(transport);






