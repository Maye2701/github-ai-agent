import { describe, it, expect } from "vitest";
import { GitHubAPIError } from "../../src/errors/index.js";
import { AuthenticationError } from "../../src/errors/index.js";
import { ValidationError } from "../../src/errors/index.js";
import { NetworkError } from "../../src/errors/index.js";
import { clasificarError } from "../../src/errors/index.js";


describe("GitHubAPIError", () => {
    // Verifica que conserva el mensaje y el estado HTTP

    it("conserva el mensaje y el estado HTTP", () => {
        const error = new GitHubAPIError("Mensaje no encontrado", 404);
        expect(error).toBeInstanceOf(GitHubAPIError);
        expect(error.message).toBe("Mensaje no encontrado");
        expect(error.status).toBe(404);
        expect(error.name).toBe("GitHubAPIError");
        expect(error).toBeInstanceOf(Error);
    })

    // Verifica que conserva la misma instancia de un error ya clasificado


    it("conserva la misma instancia de un error ya clasificado", () => {
        const errorOriginal = new GitHubAPIError("Mensaje no encontrado", 404);
        expect(clasificarError(errorOriginal)).toBe(errorOriginal);
    })


    // Verifica que remplaza el mensaje de un error desconocido



    it("remplaza el mensaje de un error desconocido", () => {
        const errorOriginal = new Error("Mensaje no encontrado");
        const resultado = clasificarError(errorOriginal);
        expect(resultado).toBeInstanceOf(Error);
        expect(resultado.name).toBe("Error");
        expect(resultado.message).toBe("Ocurrió un error inesperado");
    })

    // Verifica que convierte un error 401 en AuthenticationError


    it("convierte un error 401 en AuthenticationError", () => {
        const error = { status: 401 };
        const resultado = clasificarError(error);
        expect(resultado).toBeInstanceOf(AuthenticationError);
        expect(resultado.message).toBe("GitHub rechazó la autenticación. Revisa que GITHUB_TOKEN sea válido y no haya caducado.");
    })

    // Verifica que convierte un error 404 en GitHubAPIError


    it("convierte un error 404 en GitHubAPIError", () => {
        const error = { status: 404 };
        const resultado = clasificarError(error);
        expect(resultado).toBeInstanceOf(GitHubAPIError);
        expect(resultado.message).toBe("No se encontró el recurso solicitado en GitHub. Verifica el propietario, el nombre y tus permisos de acceso.");

        if (!(resultado instanceof GitHubAPIError)) {
            throw new Error("Se esperaba un GitHubAPIError");
        }
        expect(resultado.status).toBe(404);
    })


    it.each([403, 409, 500, 503, 429])("conserva el estado HTTP %i", (status) => {
        const resultado = clasificarError({ status });

        expect(resultado).toBeInstanceOf(GitHubAPIError);

        if (!(resultado instanceof GitHubAPIError)) {
            throw new Error("Se esperaba un GitHubAPIError");
        }

        expect(resultado.status).toBe(status);
    });


})

describe("AuthenticationError", () => {
    // Verifica que Token inválido

    it("Token inválido", () => {
        const error = new AuthenticationError("Token inválido");
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(error.message).toBe("Token inválido");
        expect(error.name).toBe("AuthenticationError");
        expect(error).toBeInstanceOf(Error);
    })
})

describe("ValidationError", () => {
    // Verifica que El nombre es obligatorio

    it("El nombre es obligatorio", () => {
        const error = new ValidationError("El nombre es obligatorio");
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe("El nombre es obligatorio");
        expect(error.name).toBe("ValidationError");
        expect(error).toBeInstanceOf(Error);
    })

    // Verifica que convierte un error 422 en ValidationError


    it("convierte un error 422 en ValidationError", () => {
        const error = { status: 422 };
        const resultado = clasificarError(error);
        expect(resultado).toBeInstanceOf(ValidationError);
        expect(resultado.message).toBe("GitHub no pudo procesar los datos. Revisa los campos y si el recurso ya existe.");
    });


})

describe("NetworkError", () => {
    // Verifica que No se pudo conectar a GitHub

    it("No se pudo conectar a GitHub", () => {
        const error = new NetworkError("No se pudo conectar a GitHub");
        expect(error).toBeInstanceOf(NetworkError);
        expect(error.message).toBe("No se pudo conectar a GitHub");
        expect(error.name).toBe("NetworkError");
        expect(error).toBeInstanceOf(Error);
    })

    it.each(["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"])("error %s en NetworkError", (code) => {
        const resultado = clasificarError({ code });
        expect(resultado).toBeInstanceOf(NetworkError);
    })

    // Verifica que error que no se reconoce como error de red


    it("error que no se reconoce como error de red", () => {
        const error = { code: "OTRO_CODIGO" };
        const resultado = clasificarError(error);
        expect(resultado).not.toBeInstanceOf(NetworkError);
        expect(resultado.message).toBe("Ocurrió un error inesperado");
    })

    // Verifica que reconoce un error de red dentro de cause


    it("reconoce un error de red dentro de cause", () => {
        const error = {
            message: "Falló la petición",
            cause: { code: "ECONNRESET" }
        }
        const resultado = clasificarError(error);
        expect(resultado).toBeInstanceOf(NetworkError);
    })

    it("reconoce un error de red anidado con status", () => {
        const error = {
            status: 500,
            cause: {
                cause: { code: "ECONNRESET" }
            }
        };
        const resultado = clasificarError(error);
        expect(resultado).toBeInstanceOf(NetworkError);
    })
})





