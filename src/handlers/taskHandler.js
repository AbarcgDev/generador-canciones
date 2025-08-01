export async function handleGetTaskStatusRequest(request, env) {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const getTaskStatusQuery = env.SONGS_DB.prepare("SELECT status FROM tasks WHERE id = ?");
    const taskStatus = await getTaskStatusQuery.bind(taskId).first();
    if (!taskStatus) {
        return Response(JSON.stringify({
            msg: `$Solicitud {task_id} no encontrada`
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    switch (taskStatus.status) {
        case "SUCCESS":
            const getSongsQuery = env.SONGS_DB.prepare("SELECT id,title FROM songs WHERE task_id = ?");
            const getSongsResult = await getSongsQuery.bind(taskId).all()
            const { success, results } = getSongsResult;
            if (success) {
                return new Response(JSON.stringify({
                    msg: "Tarea terminada",
                    taskStatus: "SUCCESS",
                    results: results
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            }
        case "PENDING":
            return new Response(JSON.stringify({
                msg: "La cancion aun no está lista",
                taskStatus: taskStatus
            }), {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
            })
    }
}