// src/components/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);
    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                const staffRef = collection(db, 'staff');
                const snapshot = await getDocs(staffRef);
                const staff = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort staff by name
                staff.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
                setStaffList(staff);
            } catch (error) {
                console.error('Error fetching staff list:', error);
            }
        };

        fetchStaffList();
    }, []);

    useEffect(() => {

        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999);

                const attendanceRef = collection(db, 'attendance');
                let q = query(
                    attendanceRef,
                    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
                    where('timestamp', '<=', Timestamp.fromDate(endOfDay))
                );

                if (selectedStaff !== 'all') {
                    q = query(q, where('staffId', '==', selectedStaff));
                }

                const snapshot = await getDocs(q);
                const attendanceData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setRecords(attendanceData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching attendance:', error);
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [selectedDate, selectedStaff]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Attendance Records</h1>

            <div className="mb-6 flex gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                    </label>
                    <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="px-3 py-2 border rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff Member
                    </label>
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="all">All Staff</option>
                        {staffList.map(staff => (
                            <option key={staff.id} value={staff.staffId}>
                                {staff.firstName} {staff.lastName} ({staff.staffId})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="py-3 px-4 text-left">Staff ID</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Time</th>
                            <th className="py-3 px-4 text-left">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {records.map(record => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">{record.staffId}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${record.status === 'IN'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">{record.time}</td>
                                <td className="py-3 px-4">{record.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && (
                    <div className="text-center py-4">Loading...</div>
                )}

                {!loading && records.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No records found for this date
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;