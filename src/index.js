import { handleGetAllSongsRequest, handleGetSongRequest, handlePostSongRequest, handleSunoCallback } from "./handlers/songHandler";
import { handleGetTaskStatusRequest } from "./handlers/taskHandler";
import { AutoRouter } from "itty-router"

const router = AutoRouter();

router.post("/api/generar-cancion", handlePostSongRequest);
router.post("/api/suno-callback", handleSunoCallback);
router.get("/api/task-status", handleGetTaskStatusRequest);
router.get("/api/descargar-cancion", handleGetSongRequest);
router.get("/api/canciones", handleGetAllSongsRequest);

router.all("*", () => new Response("Ruta no encontrada.", { status: 404 }));

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Primero intenta resolver con el router (API y otras rutas)
        const response = await router.fetch(request, env, ctx);

        // Si no se resolvió (es decir, el router devolvió undefined o un 404)
        if (!response || response.status === 404) {
            try {
                // Intenta servir archivo estático (solo si tienes [site] o env.ASSETS)
                return await env.ASSETS.fetch(request);
            } catch (err) {
                return new Response("Archivo no encontrado.", { status: 404 });
            }
        }

        return response;
    },
};