import { calculateAge } from "../services/birthdayService";
import { generateMusicStyle } from "../services/musicStyleService";
import { generateSong } from "../services/songService";

export async function handlePostSongRequest(request, env) {
    let requestData;
    try {
        requestData = await request.json();
    } catch (error) {
        return new Response(JSON.stringify({ error: "Formato del cuerpo de la petición no es JSON válido." }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { clientName, birthdate: birthdateString, style, singerGenre } = requestData;

    if (!clientName || !birthdateString) {
        return new Response(JSON.stringify({ error: "Los parámetros 'clientName' y 'birthdate' son obligatorios en el cuerpo de la petición." }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let birthDate;
    try {
        // Forcing UTC format
        birthDate = new Date(birthdateString + "T00:00:00.000Z");

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
        const musicStyle = await generateMusicStyle(style || "Pop", env);
        const singer = singerGenre || "femenina";
        const songData = await generateSong(clientName, age, musicStyle, singer, env.SUNO_API_KEY);
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
        console.error(`Error generando cancion: ${error.message} taskId = ${songData.data.taskId}`)
        return new Response(JSON.stringify({
            msg: "Error generando cancion",
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

        const songResult = await env.SONGS_DB.prepare("SELECT title FROM songs WHERE id = ?").bind(songId).first();
        const songTitle = songResult.title;

        const headers = new Headers();
        headers.set("Content-Type", "audio/mpeg");
        headers.set("Content-Disposition", `inline; filename="${songTitle}.mp3"`);

        return new Response(songObject.body, { headers });

    } catch (error) {
        console.error(
            `Error al intertar devolver cancion id = ${songId}. msg = ${error.message}`
        )
        return new Response(`Error al obtener la canción: ${error.message}`, { status: 500 });
    }
}

export async function handleGetAllSongsRequest(request, env) {
    try {
        const query = env.SONGS_DB.prepare("SELECT id, title FROM songs");
        const { results } = await query.all();
        if (!results) {
            return new Response(JSON.stringify({ msg: "No hay canciones disponibles." }), { status: 404 });
        }
        return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(`Error al obtener canciones: ${error.message}`);
        return new Response(JSON.stringify({ error: "Error al obtener las canciones." }), { status: 500 });
    }
}

export async function handleSunoCallback(request, env) {
    const reqBody = await request.json();
    const { code } = reqBody;
    const { task_id, callbackType, data: songs } = reqBody.data;
    if (code === 200 && callbackType === "complete") {
        try {// Marcar tarea como terminada
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
                console.log(`Insertando cancion ${id} en BD`)
                const query = env.SONGS_DB.prepare(`
                    INSERT INTO songs (id, title, task_id) VALUES (?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    task_id = excluded.task_id;
                `);
                const result = await query.bind(id, title, task_id).run();
                console.log(`${result}`)
                console.log(`Tarea ${task_id} completada, actualizando status en BD`)
                const updateTaskQuery = env.SONGS_DB.prepare("UPDATE tasks SET status = ? WHERE id = ?")
                const updateTaskResult = await updateTaskQuery.bind("SUCCESS", task_id).run()
            }
        } catch (error) {
            console.error(error.message);
        }
    }
    return new Response("", {
        status: 200,
    });
}
