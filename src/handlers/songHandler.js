import { isBirthday, calculateAge } from "../services/birthdayService";
import { generateSong } from "../services/songService";

export async function handlePostSongRequest(request, env) {
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

    try {
        const age = calculateAge(birthDate);
        //const songData = await generateSong(clientName, age, env.SUNO_API_KEY);
        const songData = {
            status: 200,
            data: {
                taskId: "test"
            }
        }
        const insertTaskQuery = env.SONGS_DB.prepare("INSERT INTO tasks (id) VALUES (?)");
        const insertTaskResult = await insertTaskQuery.bind(songData.data.taskId).run();
        return new Response(JSON.stringify({
            msg: "Task para generacion de cancion creado correctamente",
            taskId: songData.data.taskId,
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            msg: "Error generando cancion",
            error: error.message,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function handleGetSongRequest(request, env) {
    const url = new URL(request.url);
    const songId = url.searchParams.get("songId");
    try {
        const songObject = await env.SONGS_STORAGE.get(songId);

        if (songObject === null) {
            return new Response(JSON.stringify({
                msg: "Cancion no encontrada"
            }), { status: 404 });
        }

        const headers = new Headers();
        headers.set("Content-Type", "audio/mpeg");
        headers.set("Content-Disposition", `attachment; filename="${songId}.mp3"`);

        return new Response(songObject.body, { headers });

    } catch (error) {
        return new Response(`Error al obtener la canción: ${error.message}`, { status: 500 });
    }
}

export async function handleSunoCallback(request, env) {
    const reqBody = await request.json();
    const { code, task_id } = reqBody;
    if (code === 200) {
        try {// Marcar tarea como terminada
            const updateTaskQuery = env.SONGS_DB.prepare("UPDATE tasks SET status = ? WHERE id = ?")
            const updateTaskResult = await updateTaskQuery.bind("SUCCESS", task_id).run()
            const songs = reqBody.data;
            for (const song of songs) {
                const { id, audio_url, title } = song;
                const downloadFileResponse = await fetch(audio_url);
                if (!downloadFileResponse.ok) {
                    console.error(`Fetch fallido para ${audio_url}. Código: ${downloadFileResponse.status}`);
                    console.error("Mensaje de error:", await downloadFileResponse.text()); // Lee el cuerpo para ver qué es

                    throw new Error(`Error al descargar el archivo: ${downloadFileResponse.status} ${downloadFileResponse.statusText}`);
                }
                const songFile = await downloadFileResponse.arrayBuffer();
                // Guarda la cancion usando la id proprocionada por suno como key.
                await env.SONGS_STORAGE.put(id, songFile)
                const query = env.SONGS_DB.prepare("INSERT INTO songs (id,title,task_id) VALUES (?, ?, ?)");
                const result = await query.bind(id, title, task_id).run();
            }
        } catch (error) {
            console.error(error.message);
        }
    }
    return new Response("", {
        status: 200,
    });
}