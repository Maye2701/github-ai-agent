import { Octokit } from "@octokit/rest";
import { config } from 'dotenv';




config({ quiet: true });

const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error(" Falta configurar GITHUB_TOKEN");
};

export const githubClient = new Octokit({
    auth: token,

});



