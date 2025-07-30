import { isBirthday, calculateAge } from "../services/birthdayService";

export async function handleBirthdayRequest(request) {
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

    const age = calculateAge(birthDate);

    return new Response(JSON.stringify({
        isBirthday: true,
        song: `Feliz Cumpleaños numero ${age} ${clientName}`,
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}