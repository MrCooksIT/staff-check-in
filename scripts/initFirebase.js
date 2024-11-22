// scripts/initFirebase.js
import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { staffData } from '../utils/processStaffData'; // Import your existing staff data
import { format, parseISO } from 'date-fns';


export const initializeStaffData = async () => {
    try {
        const staffRef = collection(db, 'staff');
        const staffPromises = staffData.map(staff =>
            addDoc(staffRef, {
                staffId: staff.staffId,
                firstName: staff.firstName,
                lastName: staff.lastName,
                department: staff.department,
                email: staff.email,
                createdAt: Timestamp.now(),
                active: true
            })
        );

        await Promise.all(staffPromises);
        console.log('Staff data initialized successfully');
    } catch (error) {
        console.error('Error initializing staff data:', error);
        throw error;
    }
};

export const initializeAttendanceData = async () => {
    const attendanceRef = collection(db, 'attendance');

    const sampleAttendance = [
        {
            staffId: "1014",
            status: "OUT",
            location: "-33.93196436534561,18.405955257167598",
            date: "2024-11-21",
            time: "16:57:44",
            locationStatus: "Not At School",
            timestamp: Timestamp.fromDate(new Date("2024-11-21T16:57:44"))
        }
    ];

    try {
        const attendancePromises = sampleAttendance.map(record =>
            addDoc(attendanceRef, {
                ...record,
                createdAt: Timestamp.now()
            })
        );

        await Promise.all(attendancePromises);
        console.log('Attendance data initialized successfully');
    } catch (error) {
        console.error('Error initializing attendance data:', error);
        throw error;
    }
};

export const initializeDatabase = async () => {
    try {
        await initializeStaffData();
        await initializeAttendanceData();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};