import { handleGetSongRequest, handlePostSongRequest, handleSunoCallback } from "./handlers/songHandler";
import { handleGetTaskStatusRequest } from "./handlers/taskHandler";
import { AutoRouter } from "itty-router"

const router = AutoRouter();

router.post("/api/generar-cancion", handlePostSongRequest);
router.post("/api/suno-callback", handleSunoCallback);
router.get("/api/task-status", handleGetTaskStatusRequest);
router.get("/api/descargar-cancion", handleGetSongRequest);

router.all("*", () => new Response("Ruta no encontrada.", { status: 404 }));

export default { ...router };