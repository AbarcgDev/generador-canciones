# Generacion de canciones de cumpleaños
---
## ⚡ Endpoints de la API

### `GET /cancion`

Este endpoint verifica si la fecha de nacimiento proporcionada coincide con el día y mes actuales (en UTC).

#### Parámetros de Consulta (`Query Parameters`)

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
| :-------- | :--- | :------- | :---------- | :------ |
| `name` | `string` | Sí | El nombre de la persona cuyo cumpleaños se está verificando. | `Alvaro` |
| `birthday` | `string` | Sí | Si solo se envía `YYYY-MM-DD`, la API lo interpretará como medianoche UTC de ese día (`YYYY-MM-DDTH00:00:00.000Z`). | `1998-07-30` |

#### Ejemplo de Solicitud

```bash
# Ejemplo usando curl
curl "http://localhost:8787/cancion?name=Alvaro&birthday=1998-07-30"

# O simplemente en tu navegador
http://localhost:8787/cancion?name=Robert&birthday=1998-07-30

#### Ejemplos de Respuesta

**1. Es Cumpleaños (hoy es 30 de julio de 2025)**

```json
{
  "isBirthday": true,
  "song": "Feliz Cumpleaños numero 27 Alvaro",
  "age": 27
}

2. No es Cumpleaños

```json
{
  "isBirthday": false,
  "message": "Hoy no es tu cumpleaños."
}
```
3. Parámetros Faltantes

```json
{
  "error": "Los parámetros 'name' y 'birthday' son obligatorios."
}
```

4. Formato de Fecha Inválido

```json
{
  "error": "Formato de fecha de nacimiento inválido. Esperado YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS.sssZ."
}
```
5. Método HTTP No Permitido

```
Método no permitido
(Con un estado HTTP 405 Method Not Allowed)
```