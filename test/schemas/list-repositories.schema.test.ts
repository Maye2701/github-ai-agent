import { describe, it, expect } from "vitest";
import { listRepositoriesSchema } from "../../src/schemas/list-repositories.schema.js";

describe("listRepositoriesSchema", () => {
    // Verifica que exige el propietario (owner)

    it("rechaza un objeto sin propietario", () => {
        const resultado = listRepositoriesSchema.safeParse({});
        expect(resultado.success).toBe(false);
    })

    // Verifica que requiere owner no vacío

    it("rechaza owner vacío", () => {
        const resultado = listRepositoriesSchema.safeParse({ owner: "   " });
        expect(resultado.success).toBe(false);
    })

    // Verifica que acepta solo owner

    it("acepta solo el propietario", () => {
        const resultado = listRepositoriesSchema.safeParse({ owner: "usuario-prueba" });
        expect(resultado.success).toBe(true);
    })

    // Verifica que acepta página dentro del rango 1 a 100

    it("acepta página dentro del rango 1 a 100", () => {
        const resultado = listRepositoriesSchema.safeParse({ owner: "usuario-prueba", page: 1 });
        expect(resultado.success).toBe(true);

        const pagina100 = listRepositoriesSchema.safeParse({ owner: "usuario-prueba", page: 100 });
        expect(pagina100.success).toBe(true);
    })

    // Verifica que rechaza page menor a 1

    it("rechaza page menor a 1", () => {
        const resultado = listRepositoriesSchema.safeParse({ owner: "usuario-prueba", page: 0 });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza page mayor a 100

    it("rechaza page mayor a 100", () => {
        const resultado = listRepositoriesSchema.safeParse({ owner: "usuario-prueba", page: 101 });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza page decimal

    it("rechaza page decimal", () => {
        const resultado = listRepositoriesSchema.safeParse({ owner: "usuario-prueba", page: 2.5 });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza campos que ya no se usan

    it("rechaza campos que ya no se usan (type, per_page, sort...)", () => {
        const resultado = listRepositoriesSchema.safeParse({
            owner: "usuario-prueba",
            per_page: 30,
            type: "owner",
            sort: "pushed",
            direction: "desc"
        });
        expect(resultado.success).toBe(false);
    })

});