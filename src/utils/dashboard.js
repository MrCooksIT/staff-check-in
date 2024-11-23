// Create src/utils/dashboard.js
export const processAttendanceData = (attendanceData, staffMap) => {
    const latestStatus = new Map();

    attendanceData.forEach(record => {
        const existing = latestStatus.get(record.staffId);
        if (!existing || record.timestamp > existing.timestamp) {
            latestStatus.set(record.staffId, record);
        }
    });

    const SCHOOL_LOCATION = {
        lat: -33.958937,
        lng: 18.475184,
        radius: 100
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
    };

    return Array.from(latestStatus.values()).map(record => {
        const staffInfo = staffMap.get(record.staffId);
        const [lat, lng] = record.location.split(',').map(Number);
        const distance = calculateDistance(lat, lng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);

        return {
            id: record.id,
            staffId: record.staffId,
            name: staffInfo ? `${staffInfo.firstName} ${staffInfo.lastName}` : 'Unknown Staff',
            department: staffInfo?.department || 'Unassigned',
            status: record.status,
            timeIn: record.status === 'IN' ? record.time : '',
            timeOut: record.status === 'OUT' ? record.time : '',
            isLate: record.status === 'IN' && isLateArrival(record.time),
            isEarlyDeparture: record.status === 'OUT' && isEarlyDeparture(record.time),
            location: distance <= SCHOOL_LOCATION.radius ? 'At School' : 'Off Campus',
            distance: Math.round(distance),
            timestamp: record.timestamp
        };
    }).sort((a, b) => b.timestamp - a.timestamp);
};