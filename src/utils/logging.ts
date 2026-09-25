import { clasificarError, GitHubAPIError } from "../errors/index.js";

type Level = "INFO" | "WARN" | "ERROR";

const GITHUB_TOKEN_PATTERN =
    /\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)\b/g;

function hideSecrets(text: string): string {
    return text.replace(GITHUB_TOKEN_PATTERN, "***");
}

function write(
    level: Level,
    message: string,
    data?: unknown
): void {
    const time = new Date().toISOString();
    let extra = "";

    if (data !== undefined) {
        try {
            extra = ` ${JSON.stringify(data)}`;
        } catch {
            extra = " [Datos no serializables]";
        }
    }

    // stdout se reserva para MCP; todos los logs van a stderr.
    console.error(
        hideSecrets(`${time} [${level}] ${message}${extra}`)
    );
}

export const logger = {
    info: (message: string, data?: unknown): void =>
        write("INFO", message, data),

    warn: (message: string, data?: unknown): void =>
        write("WARN", message, data),

    error: (message: string, data?: unknown): void =>
        write("ERROR", message, data)
};

export function registrarError(tool: string, error: unknown): void {
    const errorClasificado = clasificarError(error);

    // Solo registramos metadatos, nunca el error original completo.
    logger.error("Falló la ejecución de una herramienta", {
        tool,
        categoria: errorClasificado.name,
        status: errorClasificado instanceof GitHubAPIError
            ? errorClasificado.status
            : undefined
    });
}