import { logger } from "./logging.js";

const MAX_INTENTOS = 3;
const ESPERA_INICIAL_MS = 500;
const ESTADOS_TRANSITORIOS = [429, 500, 502, 503, 504];

export function esperar(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

function obtenerStatus(error: unknown): number | undefined {
    if (
        typeof error !== "object" ||
        error === null ||
        !("status" in error) ||
        typeof error.status !== "number"
    ) {
        return undefined;
    }

    return error.status;
}

export async function conReintentos<T>(
    operacion: () => Promise<T>,
    etiqueta = "operacion"
): Promise<T> {
    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
        try {
            return await operacion();
        } catch (error) {
            const status = obtenerStatus(error);

            if (
                status === undefined ||
                !ESTADOS_TRANSITORIOS.includes(status)
            ) {
                throw error;
            }

            if (intento === MAX_INTENTOS) {
                // registrarError, en el handler, registra el fallo final.
                throw error;
            }

            const esperaMs = ESPERA_INICIAL_MS * (2 ** (intento - 1));

            logger.warn("Se reintentará la operación", {
                operacion: etiqueta,
                status,
                intentoFallido: intento,
                siguienteIntento: intento + 1,
                esperaMs
            });

            await esperar(esperaMs);
        }
    }

    throw new Error("No se pudo completar la operación");
}