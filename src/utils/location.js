// src/utils/location.js
export const SCHOOL_LOCATION = {
    lat: -33.958937,
    lng: 18.475184,
    plusCode: '2FRG+C5',
    name: 'Marist Schools',
    radius: 100 // meters
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const isWithinSchoolRadius = (location) => {
    if (!location) return false;

    const [lat, lng] = location.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return false;

    const distance = calculateDistance(
        lat, lng,
        SCHOOL_LOCATION.lat,
        SCHOOL_LOCATION.lng
    );

    return {
        isValid: distance <= SCHOOL_LOCATION.radius,
        distance: Math.round(distance),
        unit: 'meters'
    };
};