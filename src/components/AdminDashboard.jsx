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
    Settings,
    LogOut,
    Home,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const refreshDashboard = () => {
    setLoading(true); // Add loading state if you haven't already
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Re-run your existing query
    const attendanceQuery = query(
        collection(db, 'attendance'),
        where('date', '>=', today)
    );

    // The onSnapshot listener will automatically update with new data
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Sidebar = ({ currentPage, setCurrentPage }) => (
    <div className="w-64 bg-white h-screen shadow-lg">
        <div className="p-4 border-b">
            <h1 className="text-xl font-bold">SJMC Admin</h1>
        </div>
        <nav className="p-4">
            <SidebarItem
                icon={<Home />}
                label="Overview"
                active={currentPage === 'overview'}
                onClick={() => setCurrentPage('overview')}
            />
            <SidebarItem
                icon={<Users />}
                label="Staff Management"
                active={currentPage === 'staff'}
                onClick={() => setCurrentPage('staff')}
            />
            <SidebarItem
                icon={<Clock />}
                label="Attendance"
                active={currentPage === 'attendance'}
                onClick={() => setCurrentPage('attendance')}
            />
            <SidebarItem
                icon={<FileText />}
                label="Reports"
                active={currentPage === 'reports'}
                onClick={() => setCurrentPage('reports')}
            />
            <SidebarItem
                icon={<Settings />}
                label="Settings"
                active={currentPage === 'settings'}
                onClick={() => setCurrentPage('settings')}
            />
            <Link to="/admin/init">
                <SidebarItem icon={<Database />}
                    label="Initialize Database" active={currentPage === 'init'}
                    onClick={() => setCurrentPage('init')}
                />
            </Link>
        </nav>
    </div>
);
// Helper functions
const isLateArrival = (time) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours > 7 || (hours === 7 && minutes > 45);
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

    useEffect(() => {
        let unsubscribe;

        const setupRealtimeListener = async () => {
            try {
                setLoading(true);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Real-time attendance listener
                const attendanceRef = collection(db, 'attendance');
                const todayQuery = query(
                    attendanceRef,
                    where('timestamp', '>=', Timestamp.fromDate(today)),
                    orderBy('timestamp', 'desc')
                );

                unsubscribe = onSnapshot(todayQuery, async (snapshot) => {
                    const attendanceData = [];
                    const staffPresent = new Set();
                    const onTimeStaff = new Set();

                    // Get all staff for reference
                    const staffSnapshot = await getDocs(collection(db, 'staff'));
                    const staffMap = new Map();
                    staffSnapshot.forEach(doc => {
                        staffMap.set(doc.id, doc.data());
                    });

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

                    console.log('Real-time update received:', attendanceData); // Debug log
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
                }, (error) => {
                    console.error('Snapshot listener error:', error);
                    setError(error.message);
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

    const handleRefresh = () => {
        console.log('Manual refresh triggered');
        // No need to manually refresh - snapshot listener will auto-update
        // Just trigger a loading state for UI feedback
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };
    const calculateDepartmentStats = (attendanceData, staffMap) => {
        const deptStats = {};

        // Initialize department counts
        for (const staffMember of staffMap.values()) {
            if (!deptStats[staffMember.department]) {
                deptStats[staffMember.department] = {
                    total: 0,
                    present: 0,
                    onTime: 0
                };
            }
            deptStats[staffMember.department].total++;
        }

        // Calculate present and on-time staff
        attendanceData.forEach(record => {
            if (record.status === 'IN') {
                const dept = record.department;
                if (deptStats[dept]) {
                    deptStats[dept].present++;
                    if (!isLateArrival(record.time)) {
                        deptStats[dept].onTime++;
                    }
                }
            }
        });

        // Calculate rates
        Object.keys(deptStats).forEach(dept => {
            const stats = deptStats[dept];
            stats.onTimeRate = stats.present ?
                Math.round((stats.onTime / stats.present) * 100) : 0;
        });

        return deptStats;
    };

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
                                    <p className="text-blue-100"> {loading ? 'Updating...' : 'Live Attendance Tracking'} </p>
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

                    {/* Filters */}
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

                    {/* Live Status Board */}
                    <LiveStatusBoard
                        data={data.currentStatus.filter(staff => {
                            if (filter === 'present') return staff.status === 'IN';
                            if (filter === 'out') return staff.status === 'OUT';
                            if (deptFilter !== 'all') return staff.department === deptFilter;
                            return true;
                        })}
                    />

                    {/* Weekly Trends */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">Weekly Trends</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.weeklyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="present" fill="#4ade80" name="Present" />
                                    <Bar dataKey="late" fill="#fbbf24" name="Late" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(data.departments).map(([name, stats]) => (
                            <DepartmentCard key={name} name={name} stats={stats} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
// QuickStatCard Component
const QuickStatCard = ({ title, value, percentage, icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
                {percentage !== undefined && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                {icon}
            </div>
        </div>
    </div>
);

// DepartmentCard Component
const DepartmentCard = ({ name, stats }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{name}</h3>
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-gray-500">Present</span>
                <span>{stats.present}/{stats.total}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(stats.present / stats.total) * 100}%` }}
                />
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">On Time</span>
                <span>{stats.onTimeRate}%</span>
            </div>
        </div>
    </div>
);

// LiveStatusBoard Component
const LiveStatusBoard = ({ data }) => {
    const calculateDuration = (timeIn, timeOut) => {
        if (!timeIn || !timeOut) return '-';
        const start = new Date(`2000/01/01 ${timeIn}`);
        const end = new Date(`2000/01/01 ${timeOut}`);
        const diff = (end - start) / (1000 * 60); // minutes
        const hours = Math.floor(diff / 60);
        const minutes = Math.round(diff % 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Live Status Board</h2>
                <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {data.filter(s => s.status === 'IN').length} Present
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                        {data.filter(s => s.status === 'OUT').length} Out
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left">Staff Member</th>
                            <th className="py-3 px-4 text-left">Department</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Time In</th>
                            <th className="py-3 px-4 text-left">Time Out</th>
                            <th className="py-3 px-4 text-left">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((staff, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium">{staff.name}</div>
                                        <div className="text-sm text-gray-500">ID: {staff.staffId}</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                        {staff.department}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${staff.status === 'IN'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {staff.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {staff.timeIn ? (
                                        <div>
                                            <div className="font-medium">{staff.timeIn}</div>
                                            <div className="text-sm text-gray-500">
                                                {isLateArrival(staff.timeIn) ? (
                                                    <span className="text-amber-600">Late</span>
                                                ) : (
                                                    <span className="text-green-600">On Time</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="py-3 px-4">
                                    {staff.timeOut ? (
                                        <div>
                                            <div className="font-medium">{staff.timeOut}</div>
                                            {staff.earlyDeparture && (
                                                <div className="text-sm text-amber-600">Early</div>
                                            )}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="py-3 px-4">
                                    {calculateDuration(staff.timeIn, staff.timeOut)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
};

export default AdminDashboard;