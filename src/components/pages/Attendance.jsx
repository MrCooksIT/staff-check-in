import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { isWithinSchoolRadius } from '../../utils/location'; // Remove isAtSchool import
import { Loader, Map } from 'lucide-react';

const Attendance = () => {
    const [dateRange, setDateRange] = useState({
        start: format(new Date(), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                const staffRef = collection(db, 'staff');
                const snapshot = await getDocs(staffRef);
                const staff = snapshot.docs.map(doc => {
                    const data = doc.data();
                    console.log('Staff member:', data); // Debug each staff member
                    return {
                        id: doc.id,
                        ...data
                    };
                });
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
                const startDate = new Date(dateRange.start);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);

                const attendanceRef = collection(db, 'attendance');

                // Build query conditions array
                const queryConditions = [
                    where('timestamp', '>=', Timestamp.fromDate(startDate)),
                    where('timestamp', '<=', Timestamp.fromDate(endDate))
                ];

                // Add staff filter if specific staff selected
                if (selectedStaff !== 'all') {
                    console.log('Filtering for staff ID:', selectedStaff);
                    queryConditions.push(where('staffId', '==', selectedStaff));
                }

                // Add ordering
                queryConditions.push(orderBy('timestamp', 'desc'));

                // Create query with all conditions
                const baseQuery = query(attendanceRef, ...queryConditions);

                // Execute query
                const snapshot = await getDocs(baseQuery);
                console.log('Query results count:', snapshot.size);

                const attendanceData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    console.log('Record data:', data); // Debug each record
                    const locationStatus = isWithinSchoolRadius(data.location);

                    return {
                        id: doc.id,
                        ...data,
                        locationStatus: locationStatus.isValid,
                        distance: locationStatus.distance,
                        formattedTime: format(data.timestamp.toDate(), 'HH:mm:ss'),
                        formattedDate: format(data.timestamp.toDate(), 'dd/MM/yyyy')
                    };
                });

                setRecords(attendanceData);
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [dateRange.start, dateRange.end, selectedStaff]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Attendance Records</h1>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff Member
                    </label>
                    <select
                        value={selectedStaff}
                        onChange={(e) => {
                            console.log('Selected staff ID:', e.target.value); // Debug log
                            setSelectedStaff(e.target.value);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="py-3 px-4 text-left">Date</th>
                                        <th className="py-3 px-4 text-left">Time</th>
                                        <th className="py-3 px-4 text-left">Staff ID</th>
                                        <th className="py-3 px-4 text-left">Status</th>
                                        <th className="py-3 px-4 text-left">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">{record.formattedDate}</td>
                                            <td className="py-3 px-4">{record.formattedTime}</td>
                                            <td className="py-3 px-4">
                                                {staffList.find(s => s.staffId === record.staffId)?.firstName} {staffList.find(s => s.staffId === record.staffId)?.lastName}
                                                <div className="text-xs text-gray-500">ID: {record.staffId}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-sm ${record.status === 'IN'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Map className="w-4 h-4" />
                                                    <span className={`px-2 py-1 rounded-full text-xs ${record.locationStatus
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {record.locationStatus
                                                            ? 'At School'
                                                            : `${record.distance}${record.distance ? 'm away' : ' Unknown'}`
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {records.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {selectedStaff === 'all'
                                    ? 'No records found for the selected period'
                                    : `No records found for ${staffList.find(s => s.staffId === selectedStaff)?.firstName || ''
                                    } ${staffList.find(s => s.staffId === selectedStaff)?.lastName || ''
                                    } during the selected period`
                                }
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Attendance;