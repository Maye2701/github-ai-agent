import { describe, it, expect } from "vitest";
import { createRepositorySchema } from "../../src/schemas/create-repositories.schema.js";

describe("createRepositorySchema", () => {
    // Verifica que nombre valido sin descripcion

    it("nombre valido sin descripcion", () => {
        const resultado = createRepositorySchema.safeParse({ name: "mi-repositorio" });
        expect(resultado.success).toBe(true);
    })

    // Verifica que nombre demasiado corto


    it("nombre demasiado corto", () => {
        const resultado = createRepositorySchema.safeParse({ name: "mi" });
        expect(resultado.success).toBe(false);
    })

    // Verifica que nombre con guion bajo


    it("nombre con guion bajo", () => {
        const resultado = createRepositorySchema.safeParse({ name: "mi_repositorio" });
        expect(resultado.success).toBe(false);
    })
});


