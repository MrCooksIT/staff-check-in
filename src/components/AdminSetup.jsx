import React, { useState } from 'react';
import { createAdminUser } from '../config/firebase';

const AdminSetup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await createAdminUser(email, password);
            setSuccess('Admin user created successfully!');
            setEmail('');
            setPassword('');
        } catch (error) {
            setError('Failed to create admin: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6">Create Admin User</h1>
                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Admin User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSetup;