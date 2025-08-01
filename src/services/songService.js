
export async function generateSong(name, age, SUNO_API_KEY) {
    const url = 'https://api.sunoapi.org/api/v1/generate';
    const options = {
        method: 'POST',
        headers: { Authorization: `Bearer ${SUNO_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: `Una cancion alegre para desearle felicidades a ${name} en su cumpleaños numero ${age}
            de parte de FINSUS, su asesor finaciero. Que quiere recordarle que puede celebrar con gusto
            ya que gracias a su confianza y lealtad a los servicios que FINSUS le ofrece su patrimonio
            se encuentra seguro y protegido`,
            style: "Pop",
            title: `Cumpleaños de ${name}`,
            customMode: false,
            instrumental: false, // Esto podría ser un problema si esperas voz
            model: "V3_5",
            callBackUrl: ""
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        // *** IMPORTANTE: Verifica si la respuesta HTTP es exitosa ***
        if (!data.code !== 200) {
            // Si la respuesta no es OK (por ejemplo, 400, 500), lanza un error con los detalles de la API
            const errorMsg = data.msg || JSON.stringify(data); // Usa el mensaje de la API o la respuesta completa
            throw new Error(`Error de la API de Suno (estado: ${data.code}): ${errorMsg}`);
        }

        // *** Verifica si taskId existe en la respuesta de la API ***
        if (!data || !data.data || !data.data.taskId) {
            throw new Error(`La respuesta de la API de Suno no contiene un taskId válido.`);
        }

        return data;
    } catch (error) {
        console.error("Error en generateSong:", error);
        throw error;
    }
}
