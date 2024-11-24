import { Home, Users, Clock, FileText, Settings, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QrCode } from 'lucide-react';

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

export const Sidebar = ({ currentPage, setCurrentPage }) => (
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
                icon={<QrCode />}
                label="QR Codes"
                active={currentPage === 'qrcodes'}
                onClick={() => setCurrentPage('qrcodes')}
            />
            <SidebarItem
                icon={<Settings />}
                label="Settings"
                active={currentPage === 'settings'}
                onClick={() => setCurrentPage('settings')}
            />

        </nav>
    </div>
);
