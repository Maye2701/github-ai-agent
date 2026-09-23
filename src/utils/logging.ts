import { clasificarError } from "../errors/index.js";
import { GitHubAPIError } from "../errors/index.js";


export function registrarError(tool: string, error: unknown): void {
    const errorClasificado = clasificarError(error)
    const registro = {
        fecha: new Date().toISOString(),
        nivel: "error",
        tool,
        categoria: errorClasificado.name,
        status: errorClasificado instanceof GitHubAPIError
            ? errorClasificado.status
            : undefined
    }


    console.error(JSON.stringify(registro));
}
