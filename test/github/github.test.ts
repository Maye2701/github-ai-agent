import { describe, it, expect, vi, beforeEach } from "vitest";
import { listarRepositorios } from "../../src/github/operations.js";
import { githubClient } from "../../src/github/client.js";
import { crearRepositorio } from "../../src/github/operations.js"
import { crearIssue } from "../../src/github/operations.js";
import { listarIssues } from "../../src/github/operations.js";
import { createCommit } from "../../src/github/operations.js";


vi.mock("../../src/github/client.js", () => {
    return {
        githubClient: {
            repos: {
                listForUser: vi.fn().mockResolvedValue({
                    data: [
                        {
                            full_name: "usuario-prueba/repo-test",
                            description: "descripcion de prueba",
                            html_url: "https://github.com/usuario-prueba/repo-test"
                        }
                    ]
                }),

                createForAuthenticatedUser: vi.fn().mockResolvedValue({
                    data:
                    {
                        name: "repo-prueba"
                    }
                }),

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

            },

            issues: {
                create: vi.fn().mockResolvedValue({
                    data: {
                        number: 1,
                        title: "Revisar documentacion",
                    }
                }),

                listForRepo: vi.fn().mockResolvedValue({
                    data: [
                        {
                            number: 1,
                            title: "Revisar documentacion"
                        },
                        {
                            number: 2,
                            title: " Actualizar README.md",
                            pull_request: {}
                        }
                    ]
                })
            }

        }
    }

});

describe("crearCommit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })
    // Verifica que codifica el contenido y crea un archivo sin sha

    it("codifica el contenido y crea un archivo sin sha", async () => {
        const respuesta = await createCommit({ owner: "usuario-prueba", repo: "repo-prueba", message: "commit de prueba", path: "notas.txt", content: "Hola" })

        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
            {
                owner: "usuario-prueba",
                repo: "repo-prueba",
                message: "commit de prueba",
                path: "notas.txt",
                content: "SG9sYQ=="
            }
        )
        expect(respuesta).toEqual({
            content: {
                path: "notas.txt",
                sha: "sha-archivo-prueba"
            },
            commit: {
                sha: "sha-commit-prueba"
            }
        })
    })

    // Verifica que Envia el sha del archivo al actualizarlo


    it("Envia el sha del archivo al actualizarlo", async () => {
        const respuesta = await createCommit({ owner: "usuario-prueba", repo: "repo-prueba", message: "commit de prueba", path: "notas.txt", content: "Hola", sha: "sha-archivo-anterior" });

        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
            {
                owner: "usuario-prueba",
                repo: "repo-prueba",
                message: "commit de prueba",
                path: "notas.txt",
                content: "SG9sYQ==",
                sha: "sha-archivo-anterior"
            }
        )
        expect(respuesta).toEqual({
            content: {
                path: "notas.txt",
                sha: "sha-archivo-prueba"
            },
            commit: {
                sha: "sha-commit-prueba"
            }
        })
    })
});



describe("listarIssues", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    // Verifica que lista issues abiertos y excluye pull request


    it("lista issues abiertos y excluye pull request", async () => {
        const respuesta = await listarIssues({ owner: "usuario-prueba", repo: "repo-prueba" });
        expect(githubClient.issues.listForRepo).toHaveBeenCalledTimes(1);
        expect(githubClient.issues.listForRepo).toHaveBeenCalledWith(

            {
                owner: "usuario-prueba",
                repo: "repo-prueba",
                state: "open"
            }
        )
        expect(respuesta).toEqual([
            { number: 1, title: "Revisar documentacion" }
        ])
    })

})




describe("crearIssue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })
    // Verifica que crea una issue sin body

    it("crea una issue sin body", async () => {
        const respuesta = await crearIssue({ owner: "usuario-prueba", repo: "repo-prueba", title: "Revisar documentacion" });
        expect(githubClient.issues.create).toHaveBeenCalledTimes(1);
        expect(githubClient.issues.create).toHaveBeenCalledWith(
            {
                owner: "usuario-prueba",
                repo: "repo-prueba",
                title: "Revisar documentacion"
            }
        )

        expect(respuesta).toEqual({ number: 1, title: "Revisar documentacion" });
    })


    // Verifica que envia el body cuando se proporciona



    it("envia el body cuando se proporciona", async () => {
        const respuesta = await crearIssue({ owner: "usuario-prueba", repo: "repo-prueba", title: "Revisar documentacion", body: "Agregar instrucciones de instalacion" });
        expect(githubClient.issues.create).toHaveBeenCalledTimes(1);
        expect(githubClient.issues.create).toHaveBeenCalledWith(
            {
                owner: "usuario-prueba",
                repo: "repo-prueba",
                title: "Revisar documentacion",
                body: "Agregar instrucciones de instalacion"
            }
        )

        expect(respuesta).toEqual({ number: 1, title: "Revisar documentacion" });
    })
});




describe("crearRepositorio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Verifica que omite la descripción cuando no se proporciona


    it("omite la descripción cuando no se proporciona", async () => {
        const respuesta = await crearRepositorio({ name: "repo-prueba" });
        expect(githubClient.repos.createForAuthenticatedUser).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createForAuthenticatedUser).toHaveBeenCalledWith(
            {
                name: "repo-prueba"
            }
        )
        expect(respuesta).toEqual({ name: "repo-prueba" });

    });

    // Verifica que enviar la descripcion cuando se proporciona


    it("enviar la descripcion cuando se proporciona", async () => {
        const respuesta = await crearRepositorio({ name: "repo-prueba", description: "descripcion de prueba" });
        expect(githubClient.repos.createForAuthenticatedUser).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.createForAuthenticatedUser).toHaveBeenCalledWith(
            {
                name: "repo-prueba",
                description: "descripcion de prueba"
            }
        )

        expect(respuesta).toEqual({ name: "repo-prueba" });
    })
})




describe("listarRepositorios", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    // 1. Test para verificar que se llama a la API de GitHub
    // Verifica que llama a la API de GitHub para listar los repositorios de un usuario

    it("llama a la API de GitHub para listar repositorios", async () => {
        await listarRepositorios({ owner: "usuario-prueba" });
        expect(githubClient.repos.listForUser).toHaveBeenCalledTimes(1);
        expect(githubClient.repos.listForUser).toHaveBeenCalledWith(
            { username: "usuario-prueba" }
        );
    });

    it("envía la página cuando se proporciona", async () => {
        await listarRepositorios({ owner: "usuario-prueba", page: 2 });
        expect(githubClient.repos.listForUser).toHaveBeenCalledWith(
            { username: "usuario-prueba", page: 2 }
        );
    });
    // 2. Test para verificar el formato de los datos devueltos
    // Verifica que devuelve los respositorios recibidos de GitHub

    it("devuelve los respositorios recibidos de GitHub", async () => {
        const repositorios = await listarRepositorios({ owner: "usuario-prueba" });
        expect(repositorios).toEqual([
            {
                full_name: "usuario-prueba/repo-test",
                description: "descripcion de prueba",
                html_url: "https://github.com/usuario-prueba/repo-test"
            }
        ])

    });
    // 3. Test para manejar el caso en que GitHub no devuelve repositorios  
    // Verifica que devuelve una lista vacía si GitHub no devuelve repositorios

    it("devuelve una lista vacía si GitHub no devuelve repositorios", async () => {
        vi.mocked(githubClient.repos.listForUser).mockResolvedValueOnce({
            data: [],
            status: 200,
            headers: {},
            url: 'https://api.github.com/users/usuario-prueba/repos?page=1'
        }
        );



        const repositorios = await listarRepositorios({ owner: "usuario-prueba" });
        expect(repositorios).toEqual([]);
        expect(githubClient.repos.listForUser).toHaveBeenCalledTimes(1);

    });


})
