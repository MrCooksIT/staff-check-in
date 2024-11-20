import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, TrendingUp, ArrowUp, ArrowDown, Download, Filter } from 'lucide-react';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXX2oCwGeanOHRhQg4uLYakN-a7X5DMfvh--3X4rQtKJm8haJewHJX2YOxDh_xZgW6/exec';
const AdminDashboard = () => {
    const [data, setData] = useState({
        presentToday: 0,
        totalStaff: 0,
        onTimeRate: 0,
        departments: {},
        recentActivity: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [dateRange, setDateRange] = useState('today');

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Add this
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                    action: 'getDashboard',
                    department: selectedDepartment,
                    dateRange: dateRange
                })
            });
            setData({
                presentToday: 45,
                totalStaff: 80,
                onTimeRate: 94.2,
                departments: {
                    'Jnr': { present: 15, total: 20 },
                    'Snr': { present: 12, total: 15 },
                    'Admin': { present: 8, total: 10 },
                    'Estate': { present: 10, total: 12 }
                },
                recentActivity: [
                    {
                        staffName: 'John Doe',
                        department: 'Jnr',
                        status: 'IN',
                        time: '08:30'
                    },
                    // Add more sample activities
                ]
            });
            setLoading(false);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="text-white text-xl">Loading dashboard...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="text-red-400 text-xl">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users />}
                        title="Present Today"
                        value={`${data.presentToday}/${data.totalStaff}`}
                        percentage={(data.presentToday / data.totalStaff) * 100}
                    />
                    <StatCard
                        icon={<Clock />}
                        title="On Time Rate"
                        value={`${data.onTimeRate}%`}
                        trend={data.onTimeRate > 90 ? 'positive' : 'negative'}
                    />
                </div>

                {/* Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Object.entries(data.departments).map(([dept, stats]) => (
                        <DepartmentCard
                            key={dept}
                            department={dept}
                            {...stats}
                        />
                    ))}
                </div>

                {/* Recent Activity */}
                <ActivityFeed activities={data.recentActivity} />
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, percentage }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-lg">
                {icon}
            </div>
            <div>
                <h3 className="text-sm text-blue-200">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
            <div
                className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />
        </div>
    </div>
);

const DepartmentCard = ({ department, present, total }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
        <h3 className="text-lg font-semibold mb-2">{department}</h3>
        <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold">{present}</span>
            <span className="text-blue-200">of {total}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
            <div
                className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${(present / total) * 100}%` }}
            />
        </div>
    </div>
);

const ActivityFeed = ({ activities }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
            {activities.map((activity, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${activity.status === 'IN' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                            {activity.status === 'IN' ? <ArrowUp /> : <ArrowDown />}
                        </div>
                        <div>
                            <p className="font-medium">{activity.staffName}</p>
                            <p className="text-sm text-blue-200">{activity.department}</p>
                        </div>
                    </div>
                    <time className="text-sm text-blue-200">{activity.time}</time>
                </div>
            ))}
        </div>
    </div>
);

export default AdminDashboard;