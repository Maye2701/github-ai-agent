import { describe, it, expect, vi, beforeEach } from "vitest";
import { listarIssuesHandler } from "../../src/tools/list-issues.js";
import { githubClient } from "../../src/github/client.js";

vi.mock("../../src/github/client.js", () => {
    return {
        githubClient: {
            issues: {
                listForRepo: vi.fn().mockResolvedValue({
                    data: [
                        {
                            number: 1,
                            title: "Revisar documentacion",
                            html_url: "https://github.com/usuario-prueba/repo-prueba/issues/1"
                        },
                        {
                            number: 2,
                            title: "Actualizar README.md",
                            pull_request: {}
                        }
                    ]
                })
            }
        }
    }
});

describe("listarIssuesHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Verifica que devuelve el resumen de issues abiertos excluyendo pull requests

    it("devuelve el resumen de issues abiertos excluyendo pull requests", async () => {
        const resultado = await listarIssuesHandler({ owner: "usuario-prueba", repo: "repo-prueba" });

        expect(githubClient.issues.listForRepo).toHaveBeenCalledWith({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            state: "open"
        });
        expect(resultado.isError).toBeUndefined();
        expect(resultado.content).toEqual([{
            type: "text",
            text: JSON.stringify([{ numero: 1, titulo: "Revisar documentacion", url: "https://github.com/usuario-prueba/repo-prueba/issues/1" }])
        }]);
    });

    // Verifica que devuelve un mensaje claro cuando GitHub responde 404

    it("devuelve un mensaje claro cuando GitHub responde 404", async () => {
        vi.mocked(githubClient.issues.listForRepo).mockRejectedValueOnce({ status: 404 });

        const resultado = await listarIssuesHandler({ owner: "usuario-prueba", repo: "repo-prueba" });

        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([{
            type: "text",
            text: "No se encontró el recurso solicitado en GitHub. Verifica el propietario, el nombre y tus permisos de acceso."
        }])
    });

    // Verifica que devuleve un mensaje claro cuando GitHub responde 401

    it("devuleve un mensaje claro cuando GitHub responde 401", async () => {
        vi.mocked(githubClient.issues.listForRepo).mockRejectedValueOnce({ status: 401 });
        const respuesta = await listarIssuesHandler({ owner: "usuario-prueba", repo: "repo-prueba" });
        expect(respuesta.isError).toBe(true);
        expect(respuesta.content).toEqual([
            {
                type: "text",
                text: "GitHub rechazó la autenticación. Revisa que GITHUB_TOKEN sea válido y no haya caducado."
            }
        ])
    });

    // Verifica que no expone el mensaje original de un error desconocido

    it("no expone el mensaje original de un error desconocido", async () => {
        vi.mocked(githubClient.issues.listForRepo).mockRejectedValueOnce(
            new Error("Token ficticio: SECRETO_DE_PRUEBA")
        );
        const respuesta = await listarIssuesHandler({ owner: "usuario-prueba", repo: "repo-prueba" });
        expect(respuesta.isError).toBe(true);
        expect(respuesta.content).toEqual([
            {
                type: "text",
                text: "Ocurrió un error inesperado"
            }
        ])
    });
});
