import { describe, it, expect } from "vitest";
import { listIssuesSchema } from "../../src/schemas/list-issues.schema.js";

describe("listIssuesSchema", () => {
    // Verifica que owner y repo validos

    it("owner y repo validos", () => {
        const resultado = listIssuesSchema.safeParse({ owner: "usuario-prueba", repo: "repo-prueba" });
        expect(resultado.success).toBe(true);
    })

    // Verifica que owner o repo invalidos


    it("owner o repo invalidos", () => {
        const resultado = listIssuesSchema.safeParse({ owner: "", repo: "" });
        expect(resultado.success).toBe(false);
    })


})  