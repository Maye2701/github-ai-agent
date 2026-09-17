import { githubClient } from "./client.js";
import type { CreateRepositoryInput } from "../schemas/create-repositories.schema.js";
import type { CreateIssueInput } from "../schemas/create-issues.schema.js";

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



export async function crearIssue(datos: CreateIssueInput) {
    const parametros: { owner: string; repo: string; title: string; body?: string } = {
        owner: datos.owner,
        repo: datos.repo,
        title: datos.title,

    };
    if (datos.body !== undefined) {
        parametros.body = datos.body;
    }

    const response = await githubClient.issues.create(parametros);

    return response.data;
}



