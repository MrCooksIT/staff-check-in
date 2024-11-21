import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader, Calendar, Users, Clock, AlertTriangle, School } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';

const AdminDashboard = () => {
    const [data, setData] = useState({
        presentToday: 0,
        totalStaff: 0,
        onTimeRate: 0,
        departments: {},
        recentActivity: [],
        weeklyTrends: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // For testing, use mock data first
            const mockData = {
                presentToday: 45,
                totalStaff: 52,
                onTimeRate: 92,
                departments: {
                    'Jnr': { present: 15, total: 18, onTimeRate: 89 },
                    'Snr': { present: 12, total: 15, onTimeRate: 95 },
                    'Admin': { present: 8, total: 9, onTimeRate: 90 },
                    'Estate': { present: 10, total: 10, onTimeRate: 100 }
                },
                recentActivity: [
                    { staffName: 'Test User', department: 'Jnr', status: 'IN', time: '08:00' }
                ],
                weeklyTrends: [
                    { date: 'Mon', present: 45, late: 5 },
                    { date: 'Tue', present: 48, late: 2 },
                    { date: 'Wed', present: 50, late: 0 }
                ]
            };

            // Later replace with actual API call:
            // const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getDashboard`);
            // const result = await response.json();

            setData(mockData);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

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

export default AdminDashboard;