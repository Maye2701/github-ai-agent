import { describe, it, expect, vi, beforeEach } from "vitest";
import { listarRepositorios } from "../src/github/operations.js";
import { githubClient } from "../src/github/client.js";
import { crearRepositorio } from "../src/github/operations.js"

vi.mock("../src/github/client.js", () => {
    return {
        githubClient: {
            repos: {
                listForAuthenticatedUser: vi.fn().mockResolvedValue({
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


            }

        }
    }

});

describe("crearRepositorio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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
    it("llama a la API de GitHub para listar repositorios", async () => {
        await listarRepositorios();
        expect(githubClient.repos.listForAuthenticatedUser).toHaveBeenCalledTimes(1);
    });
    // 2. Test para verificar el formato de los datos devueltos
    it("devuelve los respositorios recibidos de GitHub", async () => {
        const repositorios = await listarRepositorios();
        expect(repositorios).toEqual([
            {
                full_name: "usuario-prueba/repo-test",
                description: "descripcion de prueba",
                html_url: "https://github.com/usuario-prueba/repo-test"
            }
        ])

    });
    // 3. Test para manejar el caso en que GitHub no devuelve repositorios  
    it("devuelve una lista vacía si GitHub no devuelve repositorios", async () => {
        vi.mocked(githubClient.repos.listForAuthenticatedUser).mockResolvedValueOnce({
            data: [],
            status: 200,
            headers: {},
            url: 'https://api.github.com/user/repos?per_page=100&page=1'
        }
        );



        const repositorios = await listarRepositorios();
        expect(repositorios).toEqual([]);
        expect(githubClient.repos.listForAuthenticatedUser).toHaveBeenCalledTimes(1);

    });
})


