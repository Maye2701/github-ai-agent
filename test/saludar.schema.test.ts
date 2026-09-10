import { describe, it, expect } from "vitest";
import { saludarSchema } from "../src/schemas/saludar.schema.js";

describe("saludarSchema", () => {
    it("acepta un nombre valido", () => {
        const resultado = saludarSchema.safeParse({ nombre: "Mayerly" });
        expect(resultado.success).toBe(true);
    })

    it("rechaza un nombre invalido", () => {
        const resultado = saludarSchema.safeParse({ nombre: " " });
        expect(resultado.success).toBe(false);
    })
});


