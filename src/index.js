/**
 * src/index.js
 *
 * This is the entry point for your Cloudflare Worker.
 * Responds with a simple "Hello Worker!" to any request.
 */

import { handleBirthdayRequest } from "./handlers/birthdayHandler";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname, searchParams } = url;

        if (pathname === "/cancion") {
            if (request.method !== "GET") {
                return new Response("Método no permitido", {
                    status: 405, // Method Not Allowed
                    headers: { "Allow": "GET" }
                });
            }
            return handleBirthdayRequest(request);
        }
        // Default response
        return new Response("Ruta no encontrada. Intenta /cancion?name=TuNombre&birthday=AAAA-MM-DD", { status: 404 });
    },
};