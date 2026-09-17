import { githubClient } from "./client.js";
import type { CreateRepositoryInput } from "../schemas/create-repositories.schema.js";

export async function listarRepositorios() {
    const response = await githubClient.repos.listForAuthenticatedUser();
    return response.data;

}



export async function crearRepositorio(datos: CreateRepositoryInput) {
    const parametros: { name: string; description?: string } = {
        name: datos.name
    }
    if (datos.description !== undefined) {
        parametros.description = datos.description
    }

    const response = await githubClient.repos.createForAuthenticatedUser(parametros);

    return response.data;
}


