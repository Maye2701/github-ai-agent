import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// No leer .env ni usar credenciales reales.
vi.mock("dotenv", () => ({ config: vi.fn() }));

describe("cliente Octokit con reintentos centralizados", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("GITHUB_TOKEN", "token-ficticio-de-prueba");
        vi.useFakeTimers();
        vi.spyOn(console, "error").mockImplementation(() => {});
        // Ninguna petición llega a GitHub.
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    // Comprueba que el cliente no arranca ni hace peticiones sin un token.
    it("rechaza el arranque si falta GITHUB_TOKEN", async () => {
        vi.stubEnv("GITHUB_TOKEN", "");
        await expect(import("../../src/github/client.js"))
            .rejects.toThrow("Falta GITHUB_TOKEN");
        expect(fetch).not.toHaveBeenCalled();
    });

    // Comprueba que el hook espera 500 ms ante un 503 y devuelve el resultado del reintento.
    it(
        "el hook reintenta una petición después de 500 ms",
        async () => {
            vi.mocked(fetch)
                .mockResolvedValueOnce(Response.json({ message: "Temporal" }, { status: 503 }))
                .mockResolvedValueOnce(Response.json({ resultado: "correcto" }));
            const { githubClient } = await import("../../src/github/client.js");
            const pendiente = githubClient.repos.listForUser({ username: "usuario-prueba" });
            const comprobacion = expect(pendiente).resolves.toMatchObject({
                data: { resultado: "correcto" }
            });

            await vi.advanceTimersByTimeAsync(499);
            expect(fetch).toHaveBeenCalledTimes(1);
            await vi.advanceTimersByTimeAsync(1);
            await comprobacion;
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(vi.getTimerCount()).toBe(0);
        }
    );

    // Comprueba que operación y cliente juntos hacen como máximo tres peticiones, no nueve.
    it("se detiene tras tres peticiones, sin reintentos anidados", async () => {
        vi.mocked(fetch).mockImplementation(async () =>
            Response.json({ message: "Temporal" }, { status: 500 })
        );
        const { listarRepositorios } = await import("../../src/github/operations.js");
        const pendiente = listarRepositorios({ owner: "usuario-prueba" });
        const comprobacion = expect(pendiente).rejects.toMatchObject({ status: 500 });

        await vi.advanceTimersByTimeAsync(500);
        expect(fetch).toHaveBeenCalledTimes(2);
        await vi.advanceTimersByTimeAsync(1000);
        await comprobacion;
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(vi.getTimerCount()).toBe(0);
    });

    // Comprueba que un fallo de autenticación se devuelve inmediatamente, sin programar otra petición.
    it("no reintenta un error de autenticación 401", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            Response.json({ message: "Error no reintentable" }, { status: 401 })
        );
        const { githubClient } = await import("../../src/github/client.js");
        await expect(githubClient.repos.listForUser({ username: "usuario-prueba" }))
            .rejects.toMatchObject({ status: 401 });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });
});
