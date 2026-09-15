import { githubClient } from "./client.js";

export async function listarRepositorios() {
    const response = await githubClient.repos.listForAuthenticatedUser();
    return response.data;

}

