export const isLateArrival = (time) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours > 7 || (hours === 7 && minutes > 45);
};

export const isEarlyDeparture = (time) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours < 14 || (hours === 14 && minutes < 30);
};