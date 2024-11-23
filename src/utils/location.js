export const SCHOOL_LOCATION = {
    lat: -33.958937,
    lng: 18.475184,
    radius: 100
};

export const isAtSchool = (location) => {
    if (!location) return false;

    const [lat, lng] = location.split(',').map(Number);
    const R = 6371e3;
    const φ1 = lat * Math.PI/180;
    const φ2 = SCHOOL_LOCATION.lat * Math.PI/180;
    const Δφ = (SCHOOL_LOCATION.lat-lat) * Math.PI/180;
    const Δλ = (SCHOOL_LOCATION.lng-lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return distance <= SCHOOL_LOCATION.radius;
};
