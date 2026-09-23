import { clasificarError, NetworkError } from "../errors/index.js";



export function esperar(ms: number): Promise<void> {
    return new Promise<void>((resolve => {
        setTimeout(resolve, ms);
    }));
}

export function obtenerEsperaRateLimit(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null) {
        return undefined;

    } if (!("status" in error) ||
        (error.status !== 429 && error.status !== 403)) {
        return undefined;

    } if (!("response" in error)) {
        return undefined;
    }
    const response = error.response;
    if (typeof response !== "object" || response === null) {
        return undefined;
    }
    if (!("headers" in response)) {
        return undefined;
    }

    const headers = response.headers;
    if (typeof headers !== "object" || headers === null) {
        return undefined;
    }


    if ("retry-after" in headers) {

        const valor = headers["retry-after"];
        if (typeof valor !== "string" && typeof valor !== "number") {
            return undefined;

        } if (typeof valor === "string" && valor.trim() === "") {
            return undefined;
        }


        const segundos = Number(valor);
        if (!Number.isFinite(segundos) || segundos < 0) {
            return undefined;
        }

        return Math.max(1000, segundos * 1000);
    }

    if (
        "x-ratelimit-remaining" in headers &&
        "x-ratelimit-reset" in headers
    ) {
        const restantes = headers["x-ratelimit-remaining"];

        if (restantes !== "0" && restantes !== 0) {
            return undefined;
        }

        const reset = headers["x-ratelimit-reset"];
        if (typeof reset !== "string" && typeof reset !== "number") {
            return undefined;
        }

        if (typeof reset === "string" && reset.trim() === "") {
            return undefined;
        }

        const segundosReset = Number(reset);
        if (!Number.isFinite(segundosReset) || segundosReset < 0) {
            return undefined;
        }

        return Math.max(1000, segundosReset * 1000 - Date.now());
    }


    return undefined;
}




export async function conReintentos<T>(
    operacion: () => Promise<T>
): Promise<T> {

    for (let intento = 1; intento <= 3; intento++) {
        try {
            return await operacion();
        } catch (error) {
            const errorClasificado = clasificarError(error);
            const esperaRateLimit = obtenerEsperaRateLimit(error);

            if (esperaRateLimit !== undefined && intento < 3) {
                if (!Number.isFinite(esperaRateLimit) || esperaRateLimit > 10_000) {
                    throw error;
                }
                await esperar(esperaRateLimit);
                continue;
            }

            if (errorClasificado instanceof NetworkError && intento < 3) {
                await esperar(1000 * (2 ** (intento - 1)));
                continue;
            }
            throw error;
        }
    }
    throw new Error("No se pudo completar la operación");

}


