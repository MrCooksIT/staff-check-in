import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getDashboard');
                const data = await response.json();
                setDashboardData(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold">SJMC Staff Dashboard</h1>
                    <p className="text-blue-200">Live Attendance Overview</p>
                </motion.header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users />}
                        title="Present Today"
                        value={`${dashboardData.presentToday}/${dashboardData.totalStaff}`}
                        percentage={(dashboardData.presentToday / dashboardData.totalStaff) * 100}
                    />
                    <StatCard
                        icon={<Clock />}
                        title="On Time Rate"
                        value={`${dashboardData.onTimeRate}%`}
                        trend={dashboardData.onTimeRate > 90 ? 'up' : 'down'}
                    />
                    {/* Add more stats */}
                </div>

                {/* Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Object.entries(dashboardData.departments).map(([dept, data], index) => (
                        <motion.div
                            key={dept}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <DepartmentCard
                                department={dept}
                                {...data}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {dashboardData.recentActivity.map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between bg-white/5 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${activity.action === 'IN' ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {activity.action === 'IN' ? <ArrowUp /> : <ArrowDown />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{activity.staffName}</p>
                                        <p className="text-sm text-blue-200">{activity.department}</p>
                                    </div>
                                </div>
                                <time className="text-sm text-blue-200">{activity.time}</time>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add your StatCard and DepartmentCard components here...

export default AdminDashboard;