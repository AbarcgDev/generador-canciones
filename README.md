# Cancion Worker

> [!IMPORTANTE]
> Este proyecto requiere acceso a SunoAi y configuración previa de credenciales para funcionar correctamente. Consulta la documentación interna antes de desplegar en producción.

Servicio alojado en Cloudflare Workers que genera una cancion de cumpleaños utilizando SunoAi.

## Tabla de Contenidos

- [Get Started](#get-started)
- [Uso](#uso)

# Get Started

```bash
# Clona el repositorio
git clone https://github.com/TuUsuario/cancion-worker.git
cd cancion-worker
```
## Desarrollo
Puedes instalar las dependencias y comenzar a desarrollar directamente con wrangler en tu
maquina local

```bash
# Instala dependencias 
npm install
# Inicia servidor de desarrollo
npx wrangler dev
```

La otra opcion es utilizar docker, con los servicios que ya vienen definidos dentro del repositorio
en el archivo docker-compose.yml

```bash
# Inicia servidor de desarrollo
docker-compose up dev
```
> [!IMPORTANTE]
> Si se configura la variable de entorno SUNO_API_KEY en el entorno de desarrollo las pruebas
> pueden agotar los tockens de la API

# Uso
## Endpoints REST

A continuación se describen los endpoints principales expuestos por el servicio:

### 🎵 POST `/api/generar-cancion`

Crea una tarea para generar una canción personalizada basada en el nombre del cliente y su fecha de nacimiento. La canción será generada en segundo plano.

---

### 📥 Solicitud

**Método:** `POST`
**Ruta:** `/api/generar-cancion`
**Content-Type:** `application/json`

#### 🔸 Cuerpo (`JSON`)

```json
{
  "clientName": "Juan Pérez",
  "birthdate": "1990-05-15"
}
```

| Campo        | Tipo     | Requerido | Descripción                                 |
| ------------ | -------- | --------- | ------------------------------------------- |
| `clientName` | `string` | ✅         | Nombre del cliente                          |
| `birthdate`  | `string` | ✅         | Fecha de nacimiento en formato `YYYY-MM-DD` |

---

### 📤 Respuestas

#### ✅ 201 Created

```json
{
  "msg": "Task para generacion de cancion creado correctamente",
  "taskId": "abc123xyz"
}
```

#### ⚠️ 400 Bad Request

Errores comunes:

```json
{
  "error": "Los parámetros 'clientName' y 'birthdate' son obligatorios en el cuerpo de la petición."
}
```

```json
{
  "error": "Formato de fecha de nacimiento inválido. Usa YYYY-MM-DD."
}
```

```json
{
  "error": "Formato del cuerpo de la petición no es JSON válido."
}
```

#### ❌ 500 Internal Server Error

```json
{
  "msg": "Error generando cancion",
  "error": "Mensaje del error interno"
}
```

---

### 🔐 Autenticación

Este endpoint no requiere autenticación explícita, pero internamente utiliza una API externa (`SUNO_API_KEY`) para la generación de canciones.

---

### 💡 Notas

* El endpoint valida que el JSON sea válido y que los campos requeridos estén presentes.
* La tarea de generación de canción se crea de forma asincrónica, identificada por un `taskId`.
* Se espera que un servicio separado consulte este `taskId` para obtener el estado o resultado de la canción.

---

### 🔍 GET `/api/task-status?taskId={id}`

Consulta el estado de una tarea de generación de canción personalizada. Devuelve si la tarea está en proceso o completada, y en caso de éxito, una lista de canciones generadas.

---

### 📥 Solicitud

**Método:** `GET`
**Ruta:** `/api/task-status`
**Parámetros de consulta:**

| Parámetro | Tipo     | Requerido | Descripción                |
| --------- | -------- | --------- | -------------------------- |
| `taskId`  | `string` | ✅         | ID de la tarea a consultar |

---

### 📤 Respuestas

#### ✅ 200 OK (tarea completada con éxito)

```json
{
  "msg": "Tarea terminada",
  "taskStatus": "SUCCESS",
  "results": [
    {
      "id": "song_001",
      "title": "Canción de Juan"
    }
  ]
}
```

#### ⏳ 202 Accepted (tarea en proceso)

```json
{
  "msg": "La cancion aun no está lista",
  "taskStatus": {
    "status": "PENDING"
  }
}
```

#### ❌ 404 Not Found (tarea no encontrada)

```json
{
  "msg": "$Solicitud {task_id} no encontrada"
}
```

---

### ⚠️ Posibles Estados de Tarea

| Estado    | Descripción                                 |
| --------- | ------------------------------------------- |
| `SUCCESS` | La canción fue generada correctamente       |
| `PENDING` | La tarea sigue en proceso                   |
| *Otros*   | El controlador actual no maneja otros casos |

---

### 🔐 Autenticación

Este endpoint **no requiere autenticación**, pero depende de una base de datos interna (`env.SONGS_DB`).

---

### 📝 Notas técnicas

* La búsqueda de estado se realiza consultando `tasks.status` por `id = taskId`.
* Si el estado es `SUCCESS`, se buscan canciones relacionadas en la tabla `songs`.
* Si no hay resultados en `tasks`, se devuelve 404.
* El controlador aún **no maneja errores de base de datos ni estados distintos a SUCCESS/PENDING**.

Perfecto, ya con este tercer controlador (`GET /songs/download?songId={id}`), aquí tienes la documentación completa del **endpoint de descarga de canción** en formato Markdown para tu API:

---

### ⬇️ GET `/api/descargar-cancion?songId={id}`

Descarga el archivo de audio MP3 correspondiente a una canción previamente generada.

---

#### 📥 Solicitud

**Método:** `GET`
**Ruta:** `/api/descargar-cancion`
**Parámetros de consulta:**

| Parámetro | Tipo     | Requerido | Descripción                  |
| --------- | -------- | --------- | ---------------------------- |
| `songId`  | `string` | ✅         | ID de la canción a descargar |

---

### 📤 Respuestas

#### ✅ 200 OK (descarga exitosa)

**Cabeceras:**

```http
Content-Type: audio/mpeg  
Content-Disposition: attachment; filename="MiCancion.mp3"
```

**Cuerpo:**

* Binario del archivo `.mp3`

---

#### ❌ 404 Not Found (canción no encontrada)

```json
{
  "msg": "Cancion no encontrada"
}
```

#### ❌ 500 Internal Server Error (error inesperado)

```text
Error al obtener la canción: [mensaje del error]
```

---

### 🔐 Autenticación

Este endpoint **no requiere autenticación**, pero accede a almacenamiento privado (`env.SONGS_STORAGE`) y a una base de datos (`env.SONGS_DB`) para obtener el título.

---

### 📝 Notas técnicas

* La canción se recupera de `env.SONGS_STORAGE.get(songId)`.
* El título se consulta en la tabla `songs` usando el `songId`.
* Se configuran cabeceras para forzar la descarga como archivo `.mp3` con un nombre amigable.

---

### 📦 Flujo sugerido de uso completo de la API

1. `POST /api/generar-cancion` → Crea la tarea (devuelve `taskId`)
2. `GET /api/task-status?taskId=...` → Esperar estado `SUCCESS`
<<<<<<< HEAD
3. `GET /api/descargar-cancion?songId=...` → Descargar archivo `.mp3`
=======
3. `GET /api/descargar-cancion?songId=...` → Descargar archivo `.mp3`
>>>>>>> release/1.2.0
