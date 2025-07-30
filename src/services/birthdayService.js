export const isBirthday = (birthDate) => {
    const today = new Date()
    const isSameDay = birthDate.getUTCDate() === today.getUTCDate();
    const isSameMonth = birthDate.getUTCMonth() === today.getUTCMonth();

    return isSameDay && isSameMonth;
};

export const calculateAge = (birthDate) => {
    const today = new Date();
    return today.getUTCFullYear() - birthDate.getUTCFullYear();
};
