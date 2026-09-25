import { githubClient } from "./client.js";
import type { CreateRepositoryInput } from "../schemas/create-repositories.schema.js";
import type { CreateIssueInput } from "../schemas/create-issues.schema.js";
import type { ListIssuesInput } from "../schemas/list-issues.schema.js";
import type { CreateCommitInput } from "../schemas/create-commit.schema.js";
import type { ListRepositoriesInput } from "../schemas/list-repositories.schema.js";


export async function listarRepositorios(datos: ListRepositoriesInput) {
    const parametros: Parameters<typeof githubClient.repos.listForUser>[0] = {
        username: datos.owner,
    };

    if (datos.page !== undefined) {
        parametros.page = datos.page;
    }

    const response = await githubClient.repos.listForUser(parametros);
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



export async function listarIssues(datos: ListIssuesInput) {

    const response = await githubClient.issues.listForRepo({
        owner: datos.owner,
        repo: datos.repo,
        state: "open"
    }
    );

    return response.data.filter((issue) => issue.pull_request === undefined);
};



export async function createCommit(datos: CreateCommitInput) {

    const contenidoBase64 = Buffer.from(datos.content, "utf8").toString("base64");

    const parametros: {
        owner: string;
        repo: string;
        path: string;
        message: string;
        content: string;
        sha?: string;
    } = {
        owner: datos.owner,
        repo: datos.repo,
        path: datos.path,
        message: datos.message,
        content: contenidoBase64,
    };

    if (datos.sha !== undefined) {
        parametros.sha = datos.sha;
    }

    const response = await githubClient.repos.createOrUpdateFileContents(parametros);
    return response.data;
}








