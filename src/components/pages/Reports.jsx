// src/components/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Download, Loader, AlertCircle } from 'lucide-react';

const Reports = () => {
    const [dateRange, setDateRange] = useState({
        start: format(new Date(), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [reportType, setReportType] = useState('attendance');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateReport = async () => {
        try {
            setLoading(true);
            setError(null);

            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);

            const attendanceRef = collection(db, 'attendance');
            const q = query(
                attendanceRef,
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                where('timestamp', '<=', Timestamp.fromDate(endDate))
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Convert to CSV
            const csvContent = generateCSV(data);
            downloadCSV(csvContent, `attendance-report-${format(startDate, 'yyyy-MM-dd')}`);

        } catch (err) {
            setError('Failed to generate report: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateCSV = (data) => {
        const headers = ['Date', 'Staff ID', 'Name', 'Department', 'Status', 'Time', 'Location'];
        const rows = data.map(record => [
            format(record.timestamp.toDate(), 'yyyy-MM-dd'),
            record.staffId,
            record.name || 'Unknown',
            record.department || 'Unassigned',
            record.status,
            format(record.timestamp.toDate(), 'HH:mm:ss'),
            record.location
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Reports</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Report Type
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="attendance">Attendance Report</option>
                            <option value="punctuality">Punctuality Report</option>
                            <option value="department">Department Report</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>

                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    Generate Report
                </button>
            </div>
        </div>
    );
};

export default Reports;