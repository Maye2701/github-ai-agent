import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRepositoryHandler } from "../../src/tools/create-repositories.js";
import { githubClient } from "../../src/github/client.js";

vi.mock("../../src/github/client.js", () => {
    return {
        githubClient: {
            repos: {
                createForAuthenticatedUser: vi.fn().mockResolvedValue({
                    data: {
                        full_name: "usuario-prueba/repo-prueba",
                        description: "repo-prueba",
                        html_url: "https://github.com/usuario-prueba/repo-prueba"
                    }
                })
            }
        }
    }
});

describe("createRepositoryHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Verifica que crea un repositorio


    it("crea un repositorio", async () => {
        const resultado = await createRepositoryHandler({
            name: "repo-prueba",
            description: "repo-prueba"
        });
        expect(resultado.isError).toBeUndefined();
        expect(githubClient.repos.createForAuthenticatedUser).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createForAuthenticatedUser).toHaveBeenCalledWith({
            name: "repo-prueba",
            description: "repo-prueba"
        });
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: JSON.stringify({
                    nombre: "usuario-prueba/repo-prueba",
                    descripcion: "repo-prueba",
                    url: "https://github.com/usuario-prueba/repo-prueba"
                })
            }
        ])
    });

    // Verifica que devuelve un mensaje claro cuando GitHub responde 404


    it("devuelve un mensaje claro cuando GitHub responde 404", async () => {
        vi.mocked(githubClient.repos.createForAuthenticatedUser).mockRejectedValueOnce({ status: 404 });
        const resultado = await createRepositoryHandler({
            name: "repo-prueba",
            description: "repo-prueba"
        });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "No se encontró el recurso solicitado en GitHub. Verifica el propietario, el nombre y tus permisos de acceso."
            }
        ])
    });

    // Verifica que devuelve un mensaje claro cuando GitHub responde 401


    it("devuelve un mensaje claro cuando GitHub responde 401", async () => {
        vi.mocked(githubClient.repos.createForAuthenticatedUser).mockRejectedValueOnce({ status: 401 });
        const resultado = await createRepositoryHandler({
            name: "repo-prueba",
            description: "repo-prueba"
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
        vi.mocked(githubClient.repos.createForAuthenticatedUser).mockRejectedValueOnce(
            new Error("Token ficticio: SECRETO_DE_PRUEBA")
        );
        const resultado = await createRepositoryHandler({
            name: "repo-prueba",
            description: "repo-prueba"
        });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "Ocurrió un error inesperado"
            }
        ])
    });
})