import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        presentToday: 0,
        totalStaff: 0,
        onTimeRate: 0,
        departments: {}
    });

    // Fetch data from your Google Sheet
    const GOOGLE_SCRIPT_URL = 'YOUR_SCRIPT_URL'; // Use the same URL as CheckInSystem

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // For now, using placeholder data
                setStats({
                    presentToday: 45,
                    totalStaff: 80,
                    onTimeRate: 94.2,
                    departments: {
                        'Jnr': { present: 15, total: 20 },
                        'Snr': { present: 12, total: 15 },
                        'Admin': { present: 8, total: 10 },
                        'Estate': { present: 10, total: 12 }
                    }
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">SJMC Staff Dashboard</h1>
                    <p className="text-blue-200">Live Attendance Overview</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        title="Present Today"
                        value={`${stats.presentToday}/${stats.totalStaff}`}
                        subtitle={`${((stats.presentToday / stats.totalStaff) * 100).toFixed(1)}% Attendance`}
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        title="On Time Rate"
                        value={`${stats.onTimeRate}%`}
                        subtitle="Today's Punctuality"
                    />
                    {/* Add more stat cards */}
                </div>

                {/* Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(stats.departments).map(([dept, data]) => (
                        <DepartmentCard
                            key={dept}
                            department={dept}
                            present={data.present}
                            total={data.total}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-lg">
                {icon}
            </div>
            <div>
                <h3 className="text-sm text-blue-200">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
        <p className="text-sm text-blue-200">{subtitle}</p>
    </div>
);

const DepartmentCard = ({ department, present, total }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
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

export default AdminDashboard;