import React from 'react';

// Add these utility functions at the top of your file
const SCHOOL_LOCATION = {
    lat: -33.958937,
    lng: 18.475184,
    radius: 100
};

const calculateDistance = (location) => {
    if (!location) return null;
    
    const [lat, lng] = location.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;

    const R = 6371e3;
    const φ1 = lat * Math.PI/180;
    const φ2 = SCHOOL_LOCATION.lat * Math.PI/180;
    const Δφ = (SCHOOL_LOCATION.lat-lat) * Math.PI/180;
    const Δλ = (SCHOOL_LOCATION.lng-lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export const LiveStatusBoard = ({ data }) => {
    // Process current status with location validation
    const currentStatus = data.reduce((acc, record) => {
        const existing = acc.get(record.staffId);
        if (!existing || record.timestamp > existing.timestamp) {
            // Add location validation
            const distance = calculateDistance(record.location);
            const locationStatus = distance && distance <= SCHOOL_LOCATION.radius 
                ? 'At School' 
                : 'Off Campus';
            
            acc.set(record.staffId, {
                ...record,
                locationStatus,
                distance
            });
        }
        return acc;
    }, new Map());

    const processedData = Array.from(currentStatus.values());
    const presentCount = processedData.filter(s => s.status === 'IN').length;
    const outCount = processedData.filter(s => s.status === 'OUT').length;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {/* Keep your existing header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Live Status Board</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {presentCount} Present
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                        {outCount} Out
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    {/* Keep your existing thead */}
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left">Staff Member</th>
                            <th className="py-3 px-4 text-left">Department</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Time</th>
                            <th className="py-3 px-4 text-left">Location</th>
                            <th className="py-3 px-4 text-left">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {processedData.map((record) => (
                            <tr key={record.staffId} className="hover:bg-gray-50">
                                {/* Keep your existing staff info cells */}
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium">{record.name}</div>
                                        <div className="text-sm text-gray-500">ID: {record.staffId}</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                        {record.department}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        record.status === 'IN' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">{record.time}</td>
                                {/* Updated location cell with distance info */}
                                <td className="py-3 px-4">
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-sm ${
                                            record.locationStatus === 'At School'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {record.locationStatus}
                                        </span>
                                        {record.distance && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {record.distance}m from school
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                    {record.status === 'IN' && record.isLate && 'Late Arrival'}
                                    {record.status === 'OUT' && record.isEarlyDeparture && 'Early Departure'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {processedData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No attendance records found for today
                    </div>
                )}
            </div>
        </div>
    );
};