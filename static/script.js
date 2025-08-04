document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const statusContainer = document.getElementById('status-container');


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            clientName: form.nombre.value,
            birthdate: form.fecha.value,
        };

        try {
            const response = await fetch('/api/generar-cancion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor ${JSON.stringify(response.body)}`);
            }

            const result = await response.json();
            console.log("JSON recibido:", result);
            const taskId = result.taskId;

            checkTaskStatus(taskId);
        } catch (error) {
            alert('Error al enviar el formulario: ' + error.message);
        }
    });

    async function checkTaskStatus(taskId) {
        const statusCard = document.createElement('div');
        statusCard.className = 'card'; // usa tu misma clase de estilo si quieres
        statusCard.innerHTML = `
                <h3>Solicitud en proceso</h3>
                <p>Estamos generando tu canción...</p>
                <p><strong>ID de tarea:</strong> ${taskId}</p>
            `;
        statusContainer.innerHTML = '';
        statusContainer.appendChild(statusCard);
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/task-status?taskId=${taskId}`);
                const result = await response.json()

                if (response.status === 200 && result.taskStatus === 'SUCCESS') {
                    clearInterval(interval);
                    statusContainer.innerHTML = '';
                    const songs = result.results;
                    const songsUI = await renderSongs(songs);
                    statusContainer.appendChild(songsUI);
                } else if (response.status !== 202) {
                    clearInterval(interval);
                    statusContainer.innerHTML = `
                    <div class="card">
                        <p>Ocurrió un error con tu solicitud.</p>
                    </div>`
                }
            } catch (err) {
                clearInterval(interval);
                statusContainer.innerHTML = `
                <div class="card">
                    <p>Error verificando el estado de la tarea.</p>
                </div>`;
            }
        }, 10000); // cada minuto
    }

    async function renderSongs(songs) {
        const container = document.createElement('div');
        for (const song of songs) {
            const card = document.createElement('div');
            card.className = 'song-card';

            const title = document.createElement('h4');
            title.textContent = song.title || song.id;

            const btn = document.createElement('button');
            btn.textContent = 'Descargar';
            btn.onclick = () => {
                // Llamada al Worker para descargar la canción
                window.location = `/api/descargar-cancion?songId=${song.id}`;
            };

            card.append(title, btn);
            container.appendChild(card);
        }
        return container;
    }
});


