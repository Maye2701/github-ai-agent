import { describe, it, expect } from "vitest";
import { createCommitSchema } from "../../src/schemas/create-commit.schema.js";

describe("createCommitSchema", () => {
    // Verifica que acepta datos validos sin sha
    it("acepta datos validos sin sha", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            message: "commit de prueba",
            content: "Hola"
        });
        expect(resultado.success).toBe(true);
    })

    // Verifica que acepta un sha opcional

    it("acepta un sha opcional", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            message: "commit de prueba",
            content: "Hola",
            sha: "sha-archivo-anterior"
        });
        expect(resultado.success).toBe(true);
    })

    // Verifica que rechaza owner vacio

    it("rechaza owner vacio", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "",
            repo: "repo-prueba",
            path: "notas.txt",
            message: "commit de prueba",
            content: "Hola"
        });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza repo vacio

    it("rechaza repo vacio", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "usuario-prueba",
            repo: " ",
            path: "notas.txt",
            message: "commit de prueba",
            content: "Hola"
        });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza path vacio

    it("rechaza path vacio", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "",
            message: "commit de prueba",
            content: "Hola"
        });
        expect(resultado.success).toBe(false);
    })

    // Verifica que rechaza message vacio

    it("rechaza message vacio", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            message: "   ",
            content: "Hola"
        });
        expect(resultado.success).toBe(false);
    })

    // Verifica que acepta contenido vacio ya que no se recorta

    it("acepta contenido vacio ya que no se recorta", () => {
        const resultado = createCommitSchema.safeParse({
            owner: "usuario-prueba",
            repo: "repo-prueba",
            path: "notas.txt",
            message: "commit de prueba",
            content: ""
        });
        expect(resultado.success).toBe(true);
    })
});