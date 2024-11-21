
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader, Calendar, Users, Clock, AlertTriangle, School } from 'lucide-react';

const AdminDashboard = () => {
    const [data, setData] = useState({
        presentToday: 0,
        totalStaff: 0,
        onTimeRate: 0,
        departments: {},
        recentActivity: [],
        weeklyTrends: [],
        currentStatus: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [filter, setFilter] = useState('all'); // Add this
    const [deptFilter, setDeptFilter] = useState('all'); // Add this

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHe5MhOiGEzHc0UjBnGnP4hKI2ZUWQVfHT6UUp0feC5fEf3ri_X9UlF-t8_rVGzqw-/exec';

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getDashboard`);
            const result = await response.json();

            // Transform the data for the dashboard
            setData({
                presentToday: result.presentToday,
                totalStaff: result.totalStaff,
                onTimeRate: result.onTimeRate,
                departments: result.departments || {},
                weeklyTrends: result.weeklyTrends || [],
                currentStatus: result.currentStatus.map(staff => ({
                    name: staff.name,
                    staffId: staff.staffId,
                    department: staff.department,
                    status: staff.status,
                    timeIn: staff.timeIn,
                    timeOut: staff.timeOut,
                    isLate: staff.isLate,
                    earlyDeparture: staff.earlyDeparture,
                    duration: staff.duration
                }))
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };
    const filteredStatusData = data.currentStatus
        .filter(staff => {
            if (filter === 'present') return staff.status === 'IN';
            if (filter === 'out') return staff.status === 'OUT';
            return true;
        })
        .filter(staff => {
            if (deptFilter === 'all') return true;
            return staff.department === deptFilter;
        });

    // Pass the filtered data to the LiveStatusBoard
    <LiveStatusBoard data={filteredStatusData} />
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <School className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">SJMC Staff Dashboard</h1>
                                <p className="text-blue-100">Live Attendance Tracking</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Quick Stats */}
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

                const [filter, setFilter] = useState('all'); // 'all', 'present', 'out'
                const [deptFilter, setDeptFilter] = useState('all');

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
                    data={[
                        {
                            name: "John Smith",
                            staffId: "1234",
                            department: "Jnr",
                            status: "IN",
                            timeIn: "07:30",
                            timeOut: null,
                            isLate: false,
                            duration: "2h 30m",
                        },
                        {
                            name: "Sarah Jones",
                            staffId: "5678",
                            department: "Snr",
                            status: "OUT",
                            timeIn: "07:45",
                            timeOut: "14:30",
                            isLate: false,
                            earlyDeparture: true,
                            duration: "6h 45m",
                        },
                        // ... your actual staff data
                    ]}
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

                {/* Department Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(data.departments).map(([name, stats]) => (
                        <DepartmentCard key={name} name={name} stats={stats} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const QuickStatCard = ({ title, value, percentage, icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
                {percentage && (
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
const LiveStatusBoard = ({ data }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Live Status Board</h2>
            <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">{data.filter(s => s.status === 'IN').length} Present</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">{data.filter(s => s.status === 'OUT').length} Out</span>
            </div>
        </div>

        <div className="overflow-auto">
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
                                            {staff.isLate ?
                                                <span className="text-amber-600">Late</span> :
                                                <span className="text-green-600">On Time</span>
                                            }
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
                                {staff.duration || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default AdminDashboard;