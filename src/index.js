import { handleGetSongRequest, handlePostSongRequest, handleSunoCallback } from "./handlers/songHandler";
import { handleGetTaskStatusRequest } from "./handlers/taskHandler";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname, searchParams } = url;
        const SUNO_API_KEY = env.SUNO_API_KEY;

        if (!SUNO_API_KEY) {
            return new Response("Keys not configured", {
                status: 500
            });
        }

        if (pathname === "/api/generar-cancion") {
            if (request.method !== "POST") {
                return new Response("Método no permitido", {
                    status: 405, // Method Not Allowed
                    headers: { "Allow": "POST" }
                });
            }
            return handlePostSongRequest(request, env);
        }

        if (pathname === "/api/suno-callback") {
            if (request.method !== "POST") {
                return new Response("Método no permitido", {
                    status: 405, // Method Not Allowed
                    headers: { "Allow": "POST" }
                });
            }
            return await handleSunoCallback(request, env)
        }

        if (pathname === "/api/task-status") {
            if (request.method !== "GET") {
                return new Response("Método no permitido", {
                    status: 405, // Method Not Allowed
                    headers: { "Allow": "GET" }
                });
            }
            return await handleGetTaskStatusRequest(request, env)
        }

        if (pathname === "/descargar-cancion") {
            if (request.method !== "GET") {
                return new Response("Método no permitido", {
                    status: 405, // Method Not Allowed
                    headers: { "Allow": "GET" }
                });
            }
            return await handleGetSongRequest(request, env)
        }
        // Default response
        return new Response("Ruta no encontrada. Intenta /cancion?name=TuNombre&birthday=AAAA-MM-DD", { status: 404 });
    },
};