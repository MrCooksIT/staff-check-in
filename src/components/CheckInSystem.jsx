import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const Modal = ({ status, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
                {status === 'IN' ? 'Signed In!' : 'Signed Out!'}
            </h2>
            <p className="text-gray-600 mb-6">
                {status === 'IN'
                    ? 'Welcome to SJMC'
                    : 'Thank you for your work today'}
            </p>
            <button
                onClick={onClose}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // ... existing useEffect hooks stay the same ...

    const handleModalClose = () => {
        setShowModal(false);
        window.close();
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

            const now = new Date();
            const saTz = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Africa/Johannesburg',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);

            const data = {
                staffId,
                status,
                timestamp: saTz,
                location: `${location.latitude},${location.longitude}`
            };

            // Send to Google Sheets
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(data)
            });

            setSubmitted(true);
            setShowModal(true);

        } catch (error) {
            console.error('Submission error:', error);
            setError('Failed to submit. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {!submitted && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter Staff ID"
                            value={staffId}
                            onChange={(e) => {
                                setStaffId(e.target.value);
                                if (e.target.value) validateStaffId(e.target.value);
                            }}
                            className="w-full px-4 py-6 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                            maxLength="4"
                            required
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full p-6 text-2xl font-semibold text-white rounded-lg transition-colors ${status === 'IN'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <Loader className="w-6 h-6 animate-spin mr-2" />
                                    Submitting...
                                </span>
                            ) : (
                                `Confirm ${status}`
                            )}
                        </button>
                    </form>
                )}

                {showModal && (
                    <Modal
                        status={status}
                        onClose={handleModalClose}
                    />
                )}
            </div>
        </div>
    );
};

export default CheckInSystem;