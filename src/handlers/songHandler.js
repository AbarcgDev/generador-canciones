import { isBirthday, calculateAge } from "../services/birthdayService";
import { generateSong } from "../services/songService";

export async function handlePostSongRequest(request, SUNO_API_KEY) {
    const url = new URL(request.url);
    const clientName = url.searchParams.get("name");
    const birthdayString = url.searchParams.get("birthday"); // Example: "1998-07-30"

    if (!clientName || !birthdayString) {
        return new Response(JSON.stringify({ error: "Los parámetros 'name' y 'birthday' son obligatorios." }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let birthDate;
    try {
        // Forcing UTC format
        birthDate = new Date(birthdayString + "T00:00:00.000Z");

        // Check for "Invalid Date"
        if (isNaN(birthDate.getTime())) {
            throw new Error("Formato de fecha de nacimiento inválido. Usa YYYY-MM-DD.");
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!isBirthday(birthDate)) {
        return new Response(JSON.stringify({
            isBirthday: false,
            message: "Hoy no es tu cumpleaños."
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const age = calculateAge(birthDate);
        const songData = await generateSong(clientName, age, SUNO_API_KEY);

        return new Response(JSON.stringify({
            msg: "Task para generacion de cancion creado correctamente",
            taskId: songData["data"]["taskId"],
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            msg: "Error generando cancion",
            error: error,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function handleSunoCallback(params) {
    // TODO: Implementar logica para guardar canciones en storage Cloudflare
    // Actualizar status de taskID en BD e incluir links de archivo en storage.
}