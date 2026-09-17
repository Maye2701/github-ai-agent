import { describe, it, expect } from "vitest";
import { createIssueSchema } from "../src/schemas/create-issues.schema.js";

describe("createIssueSchema", () => {
    it("Datos validos sin body", () => {
        const resultado = createIssueSchema.safeParse({ owner: "mi-repo", repo: "mi-repo", title: "mi-repo" });
        expect(resultado.success).toBe(true);
    })

    it("Rechazar titulo de solo espacios", () => {
        const resultado = createIssueSchema.safeParse({ owner: "mi-repo", repo: "mi-repo", title: "   " });
        expect(resultado.success).toBe(false);
    })

});


