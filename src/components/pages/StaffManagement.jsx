// src/components/pages/StaffManagement.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { AlertCircle, Loader, Plus, Edit2, Trash2 } from 'lucide-react';


const generateNextStaffId = async () => {
    try {
        const staffRef = collection(db, 'staff');
        const snapshot = await getDocs(staffRef);
        const staffIds = snapshot.docs
            .map(doc => doc.data().staffId)
            .filter(id => !isNaN(parseInt(id))) // Filter out non-numeric IDs
            .map(id => parseInt(id));

        if (staffIds.length === 0) return '1001'; // Start from 1001 if no existing IDs
        const maxId = Math.max(...staffIds);
        return (maxId + 1).toString();
    } catch (error) {
        console.error('Error generating staff ID:', error);
        return null;
    }
};
const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        staffId: '',
        firstName: '',
        lastName: '',
        department: '',
        email: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'staffId', direction: 'asc' });
    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setShowModal(true);
    };
    const handleAdd = () => {
        setEditingStaff(null); // Reset editing staff for new addition
        setShowModal(true);
    };

    const handleDelete = async (staffId) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                setLoading(true);
                await deleteDoc(doc(db, 'staff', staffId));
                await fetchStaff();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedStaff = React.useMemo(() => {
        const sorted = [...staff].sort((a, b) => {
            if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

            if (sortConfig.key === 'name') {
                const aName = `${a.firstName} ${a.lastName}`;
                const bName = `${b.firstName} ${b.lastName}`;
                return sortConfig.direction === 'asc'
                    ? aName.localeCompare(bName)
                    : bName.localeCompare(aName);
            }

            return sortConfig.direction === 'asc'
                ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
                : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
        });
        return sorted;
    }, [staff, sortConfig]);
    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            if (editingStaff) {
                // Update existing staff
                await updateDoc(doc(db, 'staff', editingStaff.id), formData);
            } else {
                // Add new staff
                await addDoc(collection(db, 'staff'), {
                    ...formData,
                    createdAt: new Date(),
                    active: true
                });
            }
            await fetchStaff(); // Refresh staff list
            setShowModal(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const staffRef = collection(db, 'staff');
            const snapshot = await getDocs(staffRef);
            const staffData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStaff(staffData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <Plus className="w-4 h-4" />
                    Add Staff Member
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            {[
                                { key: 'staffId', label: 'Staff ID' },
                                { key: 'firstName', label: 'Name' },
                                { key: 'department', label: 'Department' },
                                { key: 'email', label: 'Email' },
                                { key: 'active', label: 'Status' }
                            ].map(column => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column.key)}
                                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {sortConfig.key === column.key && (
                                            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedStaff.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">{member.staffId}</td>
                                <td className="py-3 px-4">
                                    {member.firstName} {member.lastName}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                        {member.department}
                                    </span>
                                </td>
                                <td className="py-3 px-4">{member.email}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${member.active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {member.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <StaffModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                staff={editingStaff}
                onSubmit={handleSubmit}
            />

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {!loading && staff.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No staff members found
                </div>
            )}
        </div>
    );
};



const StaffModal = ({ isOpen, onClose, staff = null, onSubmit }) => {
    const [formData, setFormData] = useState({
        staffId: staff?.staffId || '',
        firstName: staff?.firstName || '',
        lastName: staff?.lastName || '',
        department: staff?.department || '',
        email: staff?.email || '',
        active: staff?.active ?? true
    });

    // Load initial data
    useEffect(() => {
        const initializeForm = async () => {
            if (staff) {
                // Editing existing staff
                setFormData({
                    staffId: staff.staffId || '',
                    firstName: staff.firstName || '',
                    lastName: staff.lastName || '',
                    department: staff.department || '',
                    email: staff.email || '',
                    active: staff.active ?? true
                });
            } else {
                // New staff - generate ID
                const nextId = await generateNextStaffId();
                setFormData(prev => ({
                    ...prev,
                    staffId: nextId
                }));
            }
        };
        initializeForm();
    }, [staff]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {staff ? 'Edit Staff Member' : 'Add Staff Member'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Staff ID</label>
                        <input
                            type="text"
                            value={formData.staffId}
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                            required
                            disabled // Make it read-only
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Auto-generated ID
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <select
                            value={formData.department}
                            onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="Jnr">Junior</option>
                            <option value="Snr">Senior</option>
                            <option value="Admin">Admin</option>
                            <option value="Estate">Estate</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {staff ? 'Save Changes' : 'Add Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default StaffManagement;