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
                const result = await response.json();

                if (response.status === 200 && result.taskStatus === "SUCCESS") {
                    clearInterval(interval);  // Detener polling

                    // Actualizar la tarjeta con resultados
                    const canciones = result.results.map(song => `
                        <li>${song.title} (ID: ${song.id})</li>
                    `).join('');
                    const statusCard = document.createElement('div');
                    statusCard.className = 'card'; // usa tu misma clase de estilo si quieres
                    statusCard.innerHTML = `
                        <div class="card">
                            <h3>Tu canción está lista 🎵</h3>
                            <ul>${canciones}</ul>
                        </div>
                    `;
                    statusContainer.innerHTML = '';
                    statusContainer.appendChild(statusCard);
                } else if (response.status === 202) {
                    console.log("Esperando resultado...");
                } else {
                    clearInterval(interval);
                    statusContainer.innerHTML = `
                        <div class="card">
                            <p>Ocurrió un error con tu solicitud.</p>
                        </div>
                    `;
                }

            } catch (error) {
                clearInterval(interval);
                statusContainer.innerHTML = `
                    <div class="card">
                        <p>Error al verificar el estado de la tarea.</p>
                    </div>
                `;
            }
        }, 10000); // cada minuto
    }
});


