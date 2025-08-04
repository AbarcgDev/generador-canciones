export function isBirthday(birthDate) {
    const today = new Date()
    const isSameDay = birthDate.getUTCDate() === today.getUTCDate();
    const isSameMonth = birthDate.getUTCMonth() === today.getUTCMonth();

    return isSameDay && isSameMonth;
}

export function calculateAge(birthDate) {
    const today = new Date();
    return today.getUTCFullYear() - birthDate.getUTCFullYear();
}
