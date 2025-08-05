export async function generateMusicStyle(artistName, env) {
    try {
        const aiQuery = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
            prompt: "Genera una descripcion en 100 caracteres del estilo musical del artista " + artistName +
                ". Responde solo con la descripcion, sin comillas ni texto adicional y sin el nombre del artista.",
        });
        return aiQuery.response.trim();
    } catch (error) {
        console.error("Error en generateMusicStyle:", error);
        throw error;
    }
}