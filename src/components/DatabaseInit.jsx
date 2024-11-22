import React, { useState } from 'react';
import { db } from '../config/firebase';
import { staffData } from '../utils/processStaffData';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';


const DatabaseInit = () => {
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);

    const initializeStaffData = async () => {
        try {
            setStatus('Starting staff data initialization...');
            const batch = writeBatch(db);
            const staffRef = collection(db, 'staff');
            console.log('Staff Data:', staffData);

            staffData.forEach((staff, index) => {
                const docRef = doc(staffRef); // Let Firestore auto-generate the ID
                batch.set(docRef, {
                    ...staff,
                    createdAt: new Date(),
                    lastUpdated: new Date()
                });

                // Update progress
                setProgress(((index + 1) / staffData.length) * 100);
            });

            await batch.commit();
            setStatus('Staff data initialized successfully! 🎉');

        } catch (error) {
            console.error('Error:', error);
            setStatus(`Error initializing data: ${error.message}`);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Database Initialization</h2>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        This will initialize the database with staff data.
                        Total staff members to add: {staffData.length}
                    </p>

                    {progress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <button
                        onClick={initializeStaffData}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Initialize Staff Data
                    </button>

                    {status && (
                        <div className={`p-4 rounded-lg ${status.includes('Error')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}>
                            {status}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2">Preview of Staff Data</h3>
                <div className="max-h-60 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Department</th>
                                <th className="px-4 py-2 text-left">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {staffData.slice(0, 5).map((staff) => (
                                <tr key={staff.staffId}>
                                    <td className="px-4 py-2">{staff.staffId}</td>
                                    <td className="px-4 py-2">{`${staff.firstName} ${staff.lastName}`}</td>
                                    <td className="px-4 py-2">{staff.department}</td>
                                    <td className="px-4 py-2">{staff.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {staffData.length > 5 && (
                        <p className="text-sm text-gray-500 p-2">
                            ... and {staffData.length - 5} more staff members
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseInit;