import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJPm1NFLbNS-rdIrrmQC-Vvw0ZVQfgMxL9GtfFs0kZnXlcU3Ran-XP_CyQxA-icTvy/exec';

const SuccessModal = ({ status, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
            <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${status === 'IN' ? 'text-green-500' : 'text-red-500'}`} />
            <h2 className="text-2xl font-bold mb-2">
                Successfully {status === 'IN' ? 'Signed In!' : 'Signed Out!'}
            </h2>
            <p className="text-gray-600 mb-6">
                {status === 'IN' ? 'Welcome to SJMC' : 'Thank you for your work today'}
            </p>
            <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg text-white ${status === 'IN' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
            >
                Close
            </button>
        </div>
    </div>
);

const CheckInSystem = () => {
    const [staffId, setStaffId] = useState('');
    const [status, setStatus] = useState('');
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Get status from URL and enforce QR code usage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get('status')?.toUpperCase();

        if (urlStatus !== 'IN' && urlStatus !== 'OUT') {
            setError('Please scan the appropriate QR code to sign in or out.');
            return;
        }

        setStatus(urlStatus);
    }, []);

    // Get location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                () => {
                    setError('Please enable location services to sign in/out.');
                }
            );
        }
    }, []);

    const validateStaffId = (id) => {
        const isValid = /^\d{4}$/.test(id);
        if (!isValid && id.length === 4) {
            setError('Please enter a valid 4-digit staff ID');
        } else {
            setError('');
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStaffId(staffId)) return;
        if (!location) {
            setError('Location is required');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const data = {
                staffId,
                status,
                timestamp: new Date().toISOString(),
                location: `${location.latitude},${location.longitude}`
            };

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(data)
            });

            setShowModal(true);

        } catch (error) {
            console.error('Submission error:', error);
            setError('Failed to submit. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClose = () => {
        window.close();
        // Fallback if window.close() is blocked
        document.body.innerHTML = '<div class="text-center p-8">You can now close this window</div>';
    };

    if (error && !status) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-lg shadow-lg p-6 ${status === 'IN' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                {error && (
                    <div className="mb-4 p-3 bg-white/50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter Staff ID"
                        value={staffId}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 4) {
                                setStaffId(value);
                                if (value.length === 4) validateStaffId(value);
                            }
                        }}
                        className="w-full px-4 py-6 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        required
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full p-6 text-2xl font-semibold text-white rounded-lg transition-colors ${status === 'IN'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <Loader className="w-6 h-6 animate-spin mr-2" />
                                Processing...
                            </span>
                        ) : (
                            status === 'IN' ? 'Sign In' : 'Sign Out'
                        )}
                    </button>
                </form>

                {showModal && (
                    <SuccessModal
                        status={status}
                        onClose={handleModalClose}
                    />
                )}
            </div>
        </div>
    );
};

export default CheckInSystem;