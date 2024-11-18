import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const CheckInSystem = () => {
    const [staffId, setStaffId] = useState('');
    const [status, setStatus] = useState('');
    const [location, setLocation] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get status from URL parameter (for QR code scanning)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get('status');
        if (urlStatus === 'IN' || urlStatus === 'OUT') {
            setStatus(urlStatus);
        }
    }, []);

    // Get location
    useEffect(() => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setLoading(false);
                },
                (error) => {
                    setError('Please enable location access to check in/out');
                    setLoading(false);
                }
            );
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location) {
            setError('Location is required');
            return;
        }

        try {
            setLoading(true);
            // TODO: Add Google Sheets API connection here
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess(true);
            setStaffId('');

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-primary p-6">
                    <h1 className="text-2xl font-bold text-white text-center">
                        Staff {status || 'Check-In'} System
                    </h1>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="number"
                                placeholder="Enter Staff ID"
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                                required
                                className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {!status && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStatus('IN')}
                                    className="p-4 text-lg font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                >
                                    Check In
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('OUT')}
                                    className="p-4 text-lg font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    Check Out
                                </button>
                            </div>
                        )}

                        {status && (
                            <div className={`text-center p-4 rounded-lg ${status === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                Selected: {status}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-center text-red-600 gap-2 p-4 bg-red-50 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center justify-center text-green-600 gap-2 p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span>Successfully checked {status.toLowerCase()}!</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !location || !staffId || !status}
                            className="w-full p-4 text-lg font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                `Confirm ${status || 'Check-In'}`
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckInSystem;