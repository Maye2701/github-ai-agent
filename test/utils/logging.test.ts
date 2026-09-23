import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registrarError } from "../../src/utils/logging.js";

describe('registrarError', () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    })

    it("no registra el mensaje sensible del error", () => {
        registrarError("list_issues", new Error("SECRETO_DE_PRUEBA"));
        expect(console.error).toHaveBeenCalledTimes(1);

        const llamadas = vi.mocked(console.error).mock.calls;
        expect(JSON.stringify(llamadas)).not.toContain("SECRETO_DE_PRUEBA");
    });
})