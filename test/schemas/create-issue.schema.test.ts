import { describe, it, expect } from "vitest";
import { createIssueSchema } from "../../src/schemas/create-issues.schema.js";

describe("createIssueSchema", () => {
    // Verifica que Datos validos sin body

    it("Datos validos sin body", () => {
        const resultado = createIssueSchema.safeParse({ owner: "mi-repo", repo: "mi-repo", title: "mi-repo" });
        expect(resultado.success).toBe(true);
    })

    // Verifica que Rechazar titulo de solo espacios


    it("Rechazar titulo de solo espacios", () => {
        const resultado = createIssueSchema.safeParse({ owner: "mi-repo", repo: "mi-repo", title: "   " });
        expect(resultado.success).toBe(false);
    })

});


