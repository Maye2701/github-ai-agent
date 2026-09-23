
import { describe, it, vi, expect, beforeEach } from "vitest";
import { createCommitHandler } from "../../src/tools/create-commit.js";
import { githubClient } from "../../src/github/client.js";

vi.mock("../../src/github/client.js", () => {
    return {
        githubClient: {
            repos: {
                createOrUpdateFileContents: vi.fn().mockResolvedValue({
                    data: {
                        content: {
                            path: "notas.txt",
                            sha: "sha-archivo-prueba"
                        },
                        commit: {
                            sha: "sha-commit-prueba"
                        }
                    }
                })
            }
        }
    }
});


describe("createCommitHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Verifica que debe crear un commit


    it("debe crear un commit", async () => {
        const resultado = await createCommitHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "Hola",
            message: "commit de prueba"
        });
        expect(resultado.isError).toBeUndefined();
        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "SG9sYQ==",
            message: "commit de prueba"
        });
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: JSON.stringify({
                    ruta: "notas.txt",
                    shaArchivo: "sha-archivo-prueba",
                    shaCommit: "sha-commit-prueba"
                })
            }
        ])
    });

    // Verifica que debe actualizar un archivo existente


    it("debe actualizar un archivo existente", async () => {
        const resultado = await createCommitHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "Hola",
            message: "commit de prueba",
            sha: "sha-archivo-anterior"
        });
        expect(resultado.isError).toBeUndefined();
        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "SG9sYQ==",
            message: "commit de prueba",
            sha: "sha-archivo-anterior"
        });
        expect(resultado.content).toEqual([
            {
                type: "text",
                text: JSON.stringify({
                    ruta: "notas.txt",
                    shaArchivo: "sha-archivo-prueba",
                    shaCommit: "sha-commit-prueba"
                })
            }
        ])
    });

    // Verifica que devuelve un mensaje generico para un estado aun no clasificado


    it("devuelve un mensaje generico para un estado aun no clasificado", async () => {
        vi.mocked(githubClient.repos.createOrUpdateFileContents).mockRejectedValueOnce({ status: 403 });
        const resultado = await createCommitHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "Hola",
            message: "commit de prueba"
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
        vi.mocked(githubClient.repos.createOrUpdateFileContents).mockRejectedValueOnce({ status: 404 });
        const resultado = await createCommitHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "Hola",
            message: "commit de prueba"
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
        vi.mocked(githubClient.repos.createOrUpdateFileContents).mockRejectedValueOnce({ status: 401 });
        const resultado = await createCommitHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "Hola",
            message: "commit de prueba"
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
        vi.mocked(githubClient.repos.createOrUpdateFileContents).mockRejectedValueOnce(new Error("Error desconocido"));
        const resultado = await createCommitHandler({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            content: "Hola",
            message: "commit de prueba"
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