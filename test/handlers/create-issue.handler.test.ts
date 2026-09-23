import { describe, it, vi, expect, beforeEach } from "vitest";
import { createIssueHandler } from "../../src/tools/create-issue.js";
import { githubClient } from "../../src/github/client.js";

vi.mock("../../src/github/client.js", () => {
    return {
        githubClient: {
            issues: {
                create: vi.fn().mockResolvedValue({
                    data: {
                        number: 1,
                        title: "titulo-prueba",
                        html_url: "https://github.com/usuario-prueba/repo-prueba/issues/1"
                    }
                })
            }
        }
    }
});

describe("createIssueHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    // Verifica que debe crear un issue



    it("debe crear un issue", async () => {
        const resultado = await createIssueHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            title: "titulo-prueba",
            body: "cuerpo-prueba"
        });
        expect(resultado.isError).toBeUndefined();
        expect(githubClient.issues.create).toHaveBeenCalledTimes(1);
        expect(githubClient.issues.create).toHaveBeenCalledWith({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            title: "titulo-prueba",
            body: "cuerpo-prueba"
        });
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: JSON.stringify({
                    numero: 1,
                    titulo: "titulo-prueba",
                    url: "https://github.com/usuario-prueba/repo-prueba/issues/1"
                })
            }
        ])
    });

    // Verifica que devuelve un mensaje claro cuando GitHub responde 403


    it("devuelve un mensaje claro cuando GitHub responde 403", async () => {
        vi.mocked(githubClient.issues.create).mockRejectedValueOnce({ status: 403 });
        const resultado = await createIssueHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            title: "titulo-prueba",
            body: "cuerpo-prueba"
        });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "GitHub rechazó la operación. Revisa tus permisos y los límites de solicitudes."
            }
        ])
    });

    // Verifica que debe manejar errores de repository not found 404


    it("debe manejar errores de repository not found 404", async () => {
        vi.mocked(githubClient.issues.create).mockRejectedValueOnce({ status: 404 });
        const resultado = await createIssueHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            title: "titulo-prueba",
            body: "cuerpo-prueba"
        });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "No se encontró el recurso solicitado en GitHub. Verifica el propietario, el nombre y tus permisos de acceso."
            }
        ])
    });

    // Verifica que debe manejar errores de autenticación 401


    it("debe manejar errores de autenticación 401", async () => {
        vi.mocked(githubClient.issues.create).mockRejectedValueOnce({ status: 401 });
        const resultado = await createIssueHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            title: "titulo-prueba",
            body: "cuerpo-prueba"
        });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "GitHub rechazó la autenticación. Revisa que GITHUB_TOKEN sea válido y no haya caducado."
            }
        ])
    });

    // Verifica que no expone el mensaje original de un error desconocido


    it("no expone el mensaje original de un error desconocido", async () => {
        vi.mocked(githubClient.issues.create).mockRejectedValueOnce(new Error("Error desconocido"));
        const resultado = await createIssueHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            title: "titulo-prueba",
            body: "cuerpo-prueba"
        });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "Ocurrió un error inesperado"
            }
        ])
    })
})

