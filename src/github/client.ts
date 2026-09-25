import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import { conReintentos } from "../utils/retry.js";

config({ quiet: true });

export function createOctokit(): Octokit {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error(
            "Falta GITHUB_TOKEN. Configúralo en tu archivo .env."
        );
    }

    const octokit = new Octokit({
        auth: token,
        userAgent: "github-ai-agent"
    });

octokit.hook.wrap("request", (request, options) => {
        const metodo = (options.method ?? "GET").toUpperCase();

        if (metodo === "GET") {
            return conReintentos(
                async () => request(options),
                `${options.method} ${options.url}`
            );
        }

        // Las escrituras (POST/PUT/DELETE) no se reintentan:
        // hacerlo podría duplicar recursos en GitHub.
        return request(options);
    });

    return octokit;
}

export const githubClient = createOctokit();
