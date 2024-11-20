import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Clock, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    presentToday: 0,
    totalStaff: 0,
    onTimeRate: 0,
    departments: {
      'Jnr': { present: 0, total: 0 },
      'Snr': { present: 0, total: 0 },
      'Admin': { present: 0, total: 0 },
      'Estate': { present: 0, total: 0 }
    }
  });

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
            value={`${dashboardData.presentToday}/${dashboardData.totalStaff}`}
            subtitle={`${((dashboardData.presentToday/dashboardData.totalStaff) * 100).toFixed(1)}% Attendance`}
          />
          <StatCard 
            icon={<Clock className="w-6 h-6" />}
            title="On Time Rate"
            value={`${dashboardData.onTimeRate}%`}
            subtitle="Today's Punctuality"
          />
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(dashboardData.departments).map(([dept, data]) => (
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
        style={{ width: `${(present/total) * 100}%` }}
      />
    </div>
  </div>
);

export default AdminDashboard;