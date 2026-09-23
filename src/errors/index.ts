
export class GitHubAPIError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "GitHubAPIError";
    }
};

export class AuthenticationError extends Error {

    constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";

    }
}


export class ValidationError extends Error {

    constructor(message: string) {
        super(message);
        this.name = "ValidationError";

    }
}


export class NetworkError extends Error {

    constructor(message: string) {
        super(message);
        this.name = "NetworkError";

    }
}

export function clasificarError(error: unknown, profundidad = 0): Error {
    if (error instanceof GitHubAPIError || error instanceof AuthenticationError || error instanceof ValidationError || error instanceof NetworkError) {
        return error
    }

    if (profundidad < 3 &&
        typeof error === "object" &&
        error !== null &&
        "cause" in error) {
        const causaClasificada = clasificarError(error.cause, profundidad + 1);
        if (causaClasificada instanceof NetworkError) {
            return causaClasificada
        }
    }

    if (typeof error === "object" && error !== null && "status" in error) {
        if (error.status === 401) {
            return new AuthenticationError("GitHub rechazó la autenticación. Revisa que GITHUB_TOKEN sea válido y no haya caducado.");
        };

        if (error.status === 404) {
            return new GitHubAPIError("No se encontró el recurso solicitado en GitHub. Verifica el propietario, el nombre y tus permisos de acceso.", 404)
        };

        if (error.status === 403) {
            return new GitHubAPIError("GitHub rechazó la operación. Revisa tus permisos y los límites de solicitudes.", 403);
        };

        if (error.status === 409) {
            return new GitHubAPIError("La operación entra en conflicto con el estado actual del repositorio. Revisa la rama y, si actualizas un archivo, su SHA actual.", 409);
        };

        if (error.status === 422) {
            return new ValidationError("GitHub no pudo procesar los datos. Revisa los campos y si el recurso ya existe.");
        };


        if (error.status === 429) {
            return new GitHubAPIError("Se alcanzó un límite de solicitudes a GitHub. Espera antes de intentarlo nuevamente.", 429);
        };

        if (
            typeof error.status === 'number' &&
            error.status >= 500 &&
            error.status <= 599
        ) {
            return new GitHubAPIError("GitHub tuvo un problema interno. Antes de repetir una operación de escritura, comprueba si llegó a completarse.", error.status);
        };

    }


    if (typeof error === "object" && error !== null && "code" in error) {
        if (error.code === "ECONNRESET") {
            return new NetworkError("Se interrumpió la conexión con GitHub. Comprueba el estado de la operación antes de intentarlo nuevamente.");
        }
        if (error.code === "ETIMEDOUT") {
            return new NetworkError("Se agotó el tiempo de espera al comunicarse con GitHub. Comprueba si la operación se completó antes de repetirla.");
        }
        if (error.code === "ENOTFOUND") {
            return new NetworkError("No se pudo encontrar el host de GitHub. Comprueba tu conexión a Internet o la dirección del servidor.");
        }
    }

    return new Error("Ocurrió un error inesperado");
}






