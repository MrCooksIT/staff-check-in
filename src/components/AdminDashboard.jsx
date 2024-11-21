import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader, Calendar, Users, Clock, AlertTriangle, School } from 'lucide-react';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHe5MhOiGEzHc0UjBnGnP4hKI2ZUWQVfHT6UUp0feC5fEf3ri_X9UlF-t8_rVGzqw-/exec';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getDashboard`);
            const result = await response.json();
            setData(result);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-8 h-8 mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    const {
        presentToday,
        totalStaff,
        onTimeRate,
        departments,
        recentActivity
    } = data;

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
                        value={`${presentToday}/${totalStaff}`}
                        percentage={Math.round((presentToday / totalStaff) * 100)}
                        icon={<Users className="w-6 h-6" />}
                        color="bg-green-500"
                    />
                    <QuickStatCard
                        title="On Time Rate"
                        value={`${onTimeRate}%`}
                        icon={<Clock className="w-6 h-6" />}
                        color="bg-blue-500"
                    />
                    {/* Add more quick stats */}
                </div>

                {/* Department Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-6">Department Attendance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(departments).map(([name, stats]) => (
                            <DepartmentCard
                                key={name}
                                name={name}
                                stats={stats}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <ActivityRow key={index} activity={activity} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Helper Components
const Stat = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

const QuickStatCard = ({ icon, title, value, percentage, trend, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <p className="text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
                {percentage && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
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
        {trend !== undefined && (
            <div className="mt-4 flex items-center text-sm">
                <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
                </span>
                <span className="text-gray-500 ml-2">vs last week</span>
            </div>
        )}
    </div>
);

export default AdminDashboard;