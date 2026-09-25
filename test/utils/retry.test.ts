import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from "vitest";
import { conReintentos } from "../../src/utils/retry.js";

describe("conReintentos", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("devuelve el resultado sin reintentar cuando tiene éxito", async () => {
        const operacion = vi.fn().mockResolvedValue("correcto");

        await expect(conReintentos(operacion)).resolves.toBe("correcto");

        expect(operacion).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it.each([429, 500, 502, 503, 504])(
        "reintenta el estado %i después de 500 ms",
        async (status) => {
            const operacion = vi.fn()
                .mockRejectedValueOnce({ status })
                .mockResolvedValueOnce("correcto");

            const pendiente = conReintentos(operacion);
            const comprobacion = expect(pendiente).resolves.toBe("correcto");

            await vi.advanceTimersByTimeAsync(499);
            expect(operacion).toHaveBeenCalledTimes(1);

            await vi.advanceTimersByTimeAsync(1);
            expect(operacion).toHaveBeenCalledTimes(2);

            await comprobacion;
            expect(vi.getTimerCount()).toBe(0);
        }
    );

    it("se detiene tras tres intentos y conserva el error original", async () => {
        const error = { status: 503 };
        const operacion = vi.fn().mockRejectedValue(error);

        const pendiente = conReintentos(operacion);
        const comprobacion = expect(pendiente).rejects.toBe(error);

        await vi.advanceTimersByTimeAsync(500);
        expect(operacion).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(999);
        expect(operacion).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(1);
        expect(operacion).toHaveBeenCalledTimes(3);

        await comprobacion;
        expect(vi.getTimerCount()).toBe(0);
    });

    it("puede recuperarse en el tercer intento", async () => {
        const operacion = vi.fn()
            .mockRejectedValueOnce({ status: 500 })
            .mockRejectedValueOnce({ status: 502 })
            .mockResolvedValueOnce("recuperado");

        const pendiente = conReintentos(operacion);
        const comprobacion = expect(pendiente).resolves.toBe("recuperado");

        await vi.advanceTimersByTimeAsync(1500);

        await comprobacion;
        expect(operacion).toHaveBeenCalledTimes(3);
        expect(vi.getTimerCount()).toBe(0);
    });

    it.each([401, 403, 404, 422, 501])(
        "no reintenta el estado %i",
        async (status) => {
            const error = { status };
            const operacion = vi.fn().mockRejectedValue(error);

            await expect(conReintentos(operacion)).rejects.toBe(error);

            expect(operacion).toHaveBeenCalledTimes(1);
            expect(vi.getTimerCount()).toBe(0);
        }
    );

    it.each([
        { code: "ECONNRESET" },
        { status: "500" },
        new Error("Error desconocido"),
        null,
        undefined
    ])("no reintenta un error sin estado numérico reconocido: %j", async (error) => {
        const operacion = vi.fn().mockRejectedValue(error);

        await expect(conReintentos(operacion)).rejects.toBe(error);

        expect(operacion).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it("registra el reintento como WARN con la etiqueta de la operación", async () => {
        const operacion = vi.fn()
            .mockRejectedValueOnce({ status: 503 })
            .mockResolvedValueOnce("correcto");

        const pendiente = conReintentos(operacion, "list_repositories");
        const comprobacion = expect(pendiente).resolves.toBe("correcto");

        await vi.advanceTimersByTimeAsync(500);
        await comprobacion;

        expect(console.error).toHaveBeenCalledTimes(1);

        const registro = vi.mocked(console.error).mock.calls[0]?.[0];

        expect(registro).toContain("[WARN]");
        expect(registro).toContain("list_repositories");
        expect(registro).toContain('"esperaMs":500');
    });
});