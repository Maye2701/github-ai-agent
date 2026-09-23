import { describe, it, expect } from "vitest";
import { listRepositoriesSchema } from "../../src/schemas/list-repositories.schema.js";

describe("listRepositoriesSchema", () => {
    // Verifica que acepta un objeto vacio
    it("acepta un objeto vacio", () => {
        const resultado = listRepositoriesSchema.safeParse({});
        expect(resultado.success).toBe(true);
    })

    // Verifica que acepta parametros de paginacion validos

    it("acepta parametros de paginacion validos", () => {
        const resultado = listRepositoriesSchema.safeParse({
            page: 2,
            per_page: 30,
            sort: "pushed",
            direction: "desc"
        });
        expect(resultado.success).toBe(true);
    })

    // Verifica que rechaza page menor a 1

    it("rechaza page menor a 1", () => {
        const resultado = listRepositoriesSchema.safeParse({ page: 0 });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza per_page mayor a 100

    it("rechaza per_page mayor a 100", () => {
        const resultado = listRepositoriesSchema.safeParse({ per_page: 101 });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza un tipo no permitido

    it("rechaza un tipo no permitido", () => {
        const resultado = listRepositoriesSchema.safeParse({ type: "invalido" });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza un sort no permitido

    it("rechaza un sort no permitido", () => {
        const resultado = listRepositoriesSchema.safeParse({ sort: "stars" });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza direction no permitida

    it("rechaza direction no permitida", () => {
        const resultado = listRepositoriesSchema.safeParse({ direction: "lateral" });
        expect(resultado.success).toBe(false);
    })

    // Verifica que acepta affiliation como arreglo

    it("acepta affiliation como arreglo", () => {
        const resultado = listRepositoriesSchema.safeParse({ affiliation: ["owner", "collaborator"] });
        expect(resultado.success).toBe(true);
    })

    // Verifica que si se pasa type, no se puede pasar visibility

    it("si se pasa type, no se puede pasar visibility", () => {
        const resultado = listRepositoriesSchema.safeParse({ type: "owner", visibility: "private" });
        expect(resultado.success).toBe(false);
    })

    // Verifica que si se pasa type, no se puede pasar affiliation

    it("si se pasa type, no se puede pasar affiliation", () => {
        const resultado = listRepositoriesSchema.safeParse({ type: "owner", affiliation: ["owner"] });
        expect(resultado.success).toBe(false);
    })

    // Verifica que permite combinar visibility y affiliation sin type

    it("permite combinar visibility y affiliation sin type", () => {
        const resultado = listRepositoriesSchema.safeParse({ visibility: "private", affiliation: ["owner"] });
        expect(resultado.success).toBe(true);
    })

});