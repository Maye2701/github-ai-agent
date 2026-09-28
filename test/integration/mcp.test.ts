import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

let server: McpServer;
let client: Client;

const NOMBRES_TOOLS = [
    "list_repositories",
    "create_repository",
    "create_issue",
    "list_issues",
    "create_commit",
];

function textoDeResultado(content: Array<{ type: string; text?: string }>): string {
    return content.map((c) => c.text ?? "").join("");
}

beforeAll(async () => {
    // El cliente real exige GITHUB_TOKEN al importarse; aquí no se usa la API.
    process.env.GITHUB_TOKEN = "token-ficticio-solo-para-tests";
    const { crearServidor } = await import("../../src/mcp-server.js");

    const [transporteCliente, transporteServidor] = InMemoryTransport.createLinkedPair();

    server = crearServidor();
    await server.connect(transporteServidor);

    client = new Client({ name: "cliente-de-prueba", version: "1.0.0" });
    await client.connect(transporteCliente);
});

afterAll(async () => {
    await client?.close();
    await server?.close();
});

describe("Servidor MCP en memoria", () => {
    it("registra las cinco herramientas", async () => {
        const tools = await client.listTools();
        const nombres = tools.tools.map((t) => t.name);
        expect(new Set(nombres)).toEqual(new Set(NOMBRES_TOOLS));
    });

    it("serializa el inputSchema con descripciones en español", async () => {
        const tools = await client.listTools();
        const crearRepo = tools.tools.find((t) => t.name === "create_repository");
        expect(crearRepo).toBeDefined();
        expect(crearRepo?.description).toContain("cuenta del usuario autenticado");

        const schema = crearRepo?.inputSchema as { type?: string; properties?: Record<string, { description?: string }> };
        expect(schema.type).toBe("object");
        expect(schema.properties?.name?.description).toContain("entre 3 y 100 caracteres");
    });

    it("rechaza argumentos inválidos con mensaje de validación en español", async () => {
        const resultado = await client.callTool({
            name: "list_repositories",
            arguments: { owner: "   ", page: 1 },
        });
        expect(resultado.isError).toBe(true);
        expect(textoDeResultado(resultado.content)).toContain("Indica el propietario");
    });

    it("rechaza claves inesperadas gracias a schemas estrictos", async () => {
        const resultado = await client.callTool({
            name: "create_issue",
            arguments: { owner: "o", repo: "r", title: "t", parametro_inexistente: true },
        });
        expect(resultado.isError).toBe(true);
        expect(textoDeResultado(resultado.content)).toContain("parametro_inexistente");
    });
});