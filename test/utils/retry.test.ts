import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { conReintentos } from "../../src/utils/retry.js";


describe('conReintentos', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    })

    // Verifica que esperar un segundo antes de reintentar un error de red


    it("esperar un segundo antes de reintentar un error de red",
        async () => {
            const operacion = vi.fn()
                .mockRejectedValueOnce({ code: "ECONNRESET" })
                .mockResolvedValueOnce("correcto");

            const resultadoPendiente = conReintentos(operacion);

            await vi.advanceTimersByTimeAsync(999);
            expect(operacion).toHaveBeenCalledTimes(1);

            await vi.advanceTimersByTimeAsync(1);
            expect(operacion).toHaveBeenCalledTimes(2);

            const resultado = await resultadoPendiente;
            expect(resultado).toBe("correcto");
        }

    );


    // Verifica que se detiene despues de tres intentos



    it("se detiene despues de tres intentos",
        async () => {
            const error = { code: "ECONNRESET" };
            const operacion = vi.fn().mockRejectedValue(error);

            const pendiente = conReintentos(operacion);
            const comprobacion = expect(pendiente).rejects.toBe(error);

            await vi.advanceTimersByTimeAsync(1000);
            expect(operacion).toHaveBeenCalledTimes(2);

            await vi.advanceTimersByTimeAsync(2000);
            expect(operacion).toHaveBeenCalledTimes(3);

            await comprobacion;

            expect(vi.getTimerCount()).toBe(0);

        });

    // Verifica que no reintenta un error de autenticacion


    it("no reintenta un error de autenticacion", async () => {
        const error = { status: 401 };
        const operacion = vi.fn().mockRejectedValue(error);
        await expect(conReintentos(operacion)).rejects.toBe(error);
        expect(operacion).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });


    // Verifica que respeta retry-after antes de reintentar un 429



    it("respeta retry-after antes de reintentar un 429",
        async () => {
            const operacion = vi.fn()
                .mockRejectedValueOnce({
                    status: 429,
                    response: {
                        headers: {
                            "retry-after": "2"
                        }
                    }
                })
                .mockResolvedValueOnce("correcto");

            const pendiente = conReintentos(operacion);

            const comprobacion = expect(pendiente).resolves.toBe("correcto");

            await vi.advanceTimersByTimeAsync(1999);
            expect(operacion).toHaveBeenCalledTimes(1);

            await vi.advanceTimersByTimeAsync(1);
            expect(operacion).toHaveBeenCalledTimes(2);

            await comprobacion;

        });


    // Verifica que se detiene tras 3 intentos de rate limit



    it("se detiene tras 3 intentos de rate limit",
        async () => {
            const error = {
                status: 429,
                response: {
                    headers: {
                        "retry-after": "2"
                    }
                }
            }

            const operacion = vi.fn().mockRejectedValue(error);
            const pendiente = conReintentos(operacion);
            const comprobacion = expect(pendiente).rejects.toBe(error);

            await vi.advanceTimersByTimeAsync(2000);
            expect(operacion).toHaveBeenCalledTimes(2);

            await vi.advanceTimersByTimeAsync(2000);
            expect(operacion).toHaveBeenCalledTimes(3);

            await comprobacion;
            expect(vi.getTimerCount()).toBe(0);

        });

    // Verifica que respeta retry-after antes de reintentar un 403


    it("respeta retry-after antes de reintentar un 403", async () => {
        const operacion = vi.fn()
            .mockRejectedValueOnce({
                status: 403,
                response: {
                    headers: {
                        "retry-after": "2"
                    }
                }
            })
            .mockResolvedValueOnce("correcto");

        const pendiente = conReintentos(operacion);

        const comprobacion = expect(pendiente).resolves.toBe("correcto");

        await vi.advanceTimersByTimeAsync(1999);
        expect(operacion).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(operacion).toHaveBeenCalledTimes(2);

        await comprobacion;

    });


    // Verifica que no reintenta un 403 sin señal de rate limit



    it("no reintenta un 403 sin señal de rate limit", async () => {
        const error = { status: 403 };
        const operacion = vi.fn().mockRejectedValue(error);
        await expect(conReintentos(operacion)).rejects.toBe(error);
        expect(operacion).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    // Verifica que esperar 5 segundos cuando quedan 0


    it("esperar 5 segundos cuando quedan 0", async () => {
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
        const reset = Math.floor(Date.now() / 1000) + 5;

        const error = {
            status: 403,
            response: {
                headers: {
                    "x-ratelimit-remaining": "0",
                    "x-ratelimit-reset": String(reset)
                }
            }
        };
        const operacion = vi.fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce("correcto");

        const pendiente = conReintentos(operacion);
        const comprobacion = expect(pendiente).resolves.toBe("correcto");

        await vi.advanceTimersByTimeAsync(4999);
        expect(operacion).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(operacion).toHaveBeenCalledTimes(2);

        await comprobacion;
        expect(vi.getTimerCount()).toBe(0);
    });


    // Verifica que respeta retry-after de 0 y espera 1 segundo



    it("respeta retry-after de 0 y espera 1 segundo", async () => {
        const operacion = vi.fn()
            .mockRejectedValueOnce({
                status: 429,
                response: {
                    headers: {
                        "retry-after": "0"
                    }
                }
            })
            .mockResolvedValueOnce("correcto");

        const pendiente = conReintentos(operacion);
        const comprobacion = expect(pendiente).resolves.toBe("correcto");

        await vi.advanceTimersByTimeAsync(999);
        expect(operacion).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(operacion).toHaveBeenCalledTimes(2);

        await comprobacion;
    });

    // Verifica que devuelve el error sin reintentar si retry-after es 11


    it("devuelve el error sin reintentar si retry-after es 11", async () => {
        const error = {
            status: 429,
            response: {
                headers: {
                    "retry-after": "11"
                }
            }
        };
        const operacion = vi.fn().mockRejectedValue(error);
        await expect(conReintentos(operacion)).rejects.toBe(error);
        expect(operacion).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

})


