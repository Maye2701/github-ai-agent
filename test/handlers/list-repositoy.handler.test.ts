import { describe, it, expect, vi, beforeEach } from "vitest"
import { listarRepositoriosHandler } from "../../src/tools/list-repositories.js"
import { githubClient } from "../../src/github/client.js";

vi.mock("../../src/github/client.js", () => {
    return {
        githubClient: {
            repos: {
                listForUser: vi.fn().mockResolvedValue({
                    data: [
                        {
                            full_name: "usuario-prueba/repo-prueba",
                            description: "repo-prueba",
                            html_url: "https://github.com/usuario-prueba/repo-prueba"
                        },
                        {
                            full_name: "usuario-prueba/repo-prueba-2",
                            description: "repo-prueba-2",
                            html_url: "https://github.com/usuario-prueba/repo-prueba-2"
                        }
                    ]
                })
            }
        }
    }
});


describe("listarRepositoriosHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Verifica que devuelve el listado de repositorios del usuario


    it("devuelve el listado de repositorios del usuario", async () => {
        const resultado = await listarRepositoriosHandler({ owner: "usuario-prueba" });
        expect(githubClient.repos.listForUser).toHaveBeenCalledWith(
            { username: "usuario-prueba" }
        );
        expect(resultado.isError).toBeUndefined();
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: JSON.stringify([
                    {
                        nombre: "usuario-prueba/repo-prueba",
                        descripcion: "repo-prueba",
                        url: "https://github.com/usuario-prueba/repo-prueba"
                    },
                    {
                        nombre: "usuario-prueba/repo-prueba-2",
                        descripcion: "repo-prueba-2",
                        url: "https://github.com/usuario-prueba/repo-prueba-2"
                    }
                ])
            }
        ])
    });

    // Verifica que devuelve un mensaje claro cuando GitHub responde 404


    it("devuelve un mensaje claro cuando GitHub responde 404", async () => {
        vi.mocked(githubClient.repos.listForUser).mockRejectedValueOnce({ status: 404 });
        const resultado = await listarRepositoriosHandler({ owner: "usuario-prueba" });
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
        vi.mocked(githubClient.repos.listForUser).mockRejectedValueOnce({ status: 401 });
        const resultado = await listarRepositoriosHandler({ owner: "usuario-prueba" });
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
        vi.mocked(githubClient.repos.listForUser).mockRejectedValueOnce(
            new Error("Token ficticio: SECRETO_DE_PRUEBA")
        );
        const resultado = await listarRepositoriosHandler({ owner: "usuario-prueba" });
        expect(resultado.isError).toBe(true);
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: "Ocurrió un error inesperado"
            }
        ])
    });

});
