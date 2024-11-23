import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    where,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
    School,
    Loader,  // Added this
    AlertCircle,
    Users,
    Database,
    FileText,
    UserPlus,
    LogOut,
    Home,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { processAttendanceData } from '../utils/dashboard';
import { QuickStatCard } from './dashboard/QuickStatCard';
import { DepartmentCard } from './dashboard/DepartmentCard';
import { LiveStatusBoard } from './dashboard/LiveStatusBoard';
import { Sidebar } from './dashboard/Sidebar';
import { isLateArrival, isEarlyDeparture } from '../utils/time';
import { isAtSchool } from '../utils/location';
import StaffManagement from './pages/StaffManagement';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
const refreshDashboard = () => {
    setLoading(true); // Add loading state if you haven't already
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Re-run your existing query
    const attendanceQuery = query(
        collection(db, 'attendance'),
        where('date', '>=', today)
    );
};


const initialState = {
    presentToday: 0,
    totalStaff: 0,
    onTimeRate: 0,
    departments: {},
    recentActivity: [],
    weeklyTrends: [],
    currentStatus: []
};

const AdminDashboard = () => {
    const [data, setData] = useState(initialState);
    const [filter, setFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const renderPage = () => {
        switch (currentPage) {
            case 'staff':
                return <StaffManagement />;
            case 'attendance':
                return <Attendance />;
            case 'reports':
                return <Reports />;
            case 'settings':
                return <Settings />;
            case 'overview':
            default:
                return (
                    <>
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <QuickStatCard
                                title="Present Today"
                                value={`${data.presentToday}/${data.totalStaff}`}
                                percentage={Math.round((data.presentToday / data.totalStaff) * 100)}
                                icon={<Users className="w-6 h-6" />}
                                color="bg-green-500"
                            />
                            <QuickStatCard
                                title="On Time Rate"
                                value={`${data.onTimeRate}%`}
                                icon={<Clock className="w-6 h-6" />}
                                color="bg-blue-500"
                            />
                        </div>

                        {/* Filters and Live Status Board */}
                        <div className="mb-8">
                            <div className="flex gap-4 mb-4">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    <option value="all">All Staff</option>
                                    <option value="present">Currently Present</option>
                                    <option value="out">Currently Out</option>
                                </select>

                                <select
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    <option value="all">All Departments</option>
                                    {Object.keys(data.departments).map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <LiveStatusBoard
                                data={data.currentStatus.filter(staff => {
                                    if (filter === 'present') return staff.status === 'IN';
                                    if (filter === 'out') return staff.status === 'OUT';
                                    if (deptFilter !== 'all') return staff.department === deptFilter;
                                    return true;
                                })}
                            />
                        </div>

                        {/* Department Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(data.departments).map(([name, stats]) => (
                                <DepartmentCard key={name} name={name} stats={stats} />
                            ))}
                        </div>
                    </>
                );
        }
    };

    useEffect(() => {
        let unsubscribe;
        const setupRealtimeListener = async () => {
            try {
                setLoading(true);
                // Get staff data first
                const staffSnapshot = await getDocs(collection(db, 'staff'));
                const staffMap = new Map();
                staffSnapshot.forEach(doc => {
                    staffMap.set(doc.data().staffId, { // Use staffId instead of doc.id
                        ...doc.data()
                    });
                });

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const attendanceRef = collection(db, 'attendance');
                const todayQuery = query(
                    attendanceRef,
                    where('timestamp', '>=', Timestamp.fromDate(today)),
                    orderBy('timestamp', 'desc')
                );

                unsubscribe = onSnapshot(todayQuery, (snapshot) => {
                    const attendanceData = [];
                    const staffPresent = new Set();
                    const onTimeStaff = new Set();

                    snapshot.forEach(doc => {
                        const record = doc.data();
                        const staffInfo = staffMap.get(record.staffId) || {
                            firstName: 'Unknown',
                            lastName: 'Staff',
                            department: 'Unassigned'
                        };

                        const processedRecord = {
                            id: doc.id,
                            ...record,
                            name: `${staffInfo.firstName} ${staffInfo.lastName}`,
                            department: staffInfo.department,
                            isLate: isLateArrival(record.time)
                        };

                        attendanceData.push(processedRecord);

                        if (record.status === 'IN') {
                            staffPresent.add(record.staffId);
                            if (!isLateArrival(record.time)) {
                                onTimeStaff.add(record.staffId);
                            }
                        }
                    });

                    setData(prevData => ({
                        ...prevData,
                        presentToday: staffPresent.size,
                        totalStaff: staffMap.size,
                        onTimeRate: staffPresent.size ?
                            Math.round((onTimeStaff.size / staffPresent.size) * 100) : 0,
                        currentStatus: attendanceData,
                        departments: calculateDepartmentStats(attendanceData, staffMap)
                    }));
                    setLoading(false);
                });

            } catch (error) {
                console.error('Setup error:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        setupRealtimeListener();
        return () => unsubscribe && unsubscribe();
    }, []);

    const processAttendanceData = (attendanceData, staffMap) => {
        // Group by staff ID to get latest status
        const latestStatus = new Map();

        attendanceData.forEach(record => {
            const existing = latestStatus.get(record.staffId);
            if (!existing || record.timestamp > existing.timestamp) {
                latestStatus.set(record.staffId, record);
            }
        });

        // Calculate location validity
        const SCHOOL_LOCATION = {
            lat: -33.958937,
            lng: 18.475184,
            radius: 100 // meters
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
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        };

        return Array.from(latestStatus.values()).map(record => {
            const staffInfo = staffMap.get(record.staffId);
            const [lat, lng] = record.location.split(',').map(Number);
            const distance = calculateDistance(
                lat, lng,
                SCHOOL_LOCATION.lat,
                SCHOOL_LOCATION.lng
            );
            const isAtSchool = distance <= SCHOOL_LOCATION.radius;

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
                location: isAtSchool ? 'At School' : 'Off Campus',
                distance: Math.round(distance),
                timestamp: record.timestamp
            };
        }).sort((a, b) => b.timestamp - a.timestamp);
    };

    const handleRefresh = () => {
        console.log('Manual refresh triggered');
        // No need to manually refresh - snapshot listener will auto-update
        // Just trigger a loading state for UI feedback
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };
    function calculateDepartmentStats(attendanceData, staffMap) {
        const deptStats = {};

        // Initialize department counts
        for (const [_, staffInfo] of staffMap) {
            const dept = staffInfo.department;
            if (!deptStats[dept]) {
                deptStats[dept] = {
                    total: 0,
                    present: 0,
                    onTime: 0,
                    earlyDepartures: 0,
                    avgHours: 0
                };
            }
            deptStats[dept].total++;
        }

        // Process attendance records
        attendanceData.forEach(record => {
            const dept = record.department;
            if (!deptStats[dept]) return;

            if (record.status === 'IN') {
                deptStats[dept].present++;
                if (!record.isLate) {
                    deptStats[dept].onTime++;
                }
            } else if (record.status === 'OUT' && isEarlyDeparture(record.time)) {
                deptStats[dept].earlyDepartures++;
            }
        });

        // Calculate rates and averages
        Object.keys(deptStats).forEach(dept => {
            const stats = deptStats[dept];
            stats.attendanceRate = stats.present ?
                Math.round((stats.present / stats.total) * 100) : 0;
            stats.onTimeRate = stats.present ?
                Math.round((stats.onTime / stats.present) * 100) : 0;
        });

        return deptStats;
    }

    function isEarlyDeparture(time) {
        if (!time) return false;
        const [hours, minutes] = time.split(':').map(Number);
        return hours < 14 || (hours === 14 && minutes < 30); // Before 14:30
    }

    return (
        <div className="flex">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex-1 min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="bg-blue-600 text-white">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <School className="w-8 h-8" />
                                <div>
                                    <h1 className="text-2xl font-bold">SJMC Staff Dashboard</h1>
                                    <p className="text-blue-100">
                                        {loading ? 'Updating...' : 'Live Attendance Tracking'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    'Refresh Data'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <Loader className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="container mx-auto px-6 py-8">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;