import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxu5M6xlmcuQheN2Vbx6lLPsmmWEexlZerRQHXYj-fD04oX4a2BxVbez0OxdCoqE05_/exec';


const CheckInSystem = () => {
    const [staffId, setStaffId] = useState('');
    const [status, setStatus] = useState('');
    const [location, setLocation] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    // Get status from URL parameter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get('status')?.toUpperCase();
        if (urlStatus === 'IN' || urlStatus === 'OUT') {
            setStatus(urlStatus);
        } else {
            setError('Invalid access method. Please scan the correct QR code.');
        }
    }, []);

    // Get location on load
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    setError('Please enable location services to sign in/out.');
                }
            );
        }
    }, []);

    const validateStaffId = (id) => {
        const isValid = /^\d{4}$/.test(id);
        if (!isValid) {
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
            const timestamp = new Date().toISOString();
            const data = {
                staffId,
                status,
                timestamp,
                location: `${location.latitude},${location.longitude}`
            };

            // Send to Google Sheets
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
                mode: 'no-cors'
            });

            console.log('Data sent:', data);
            setSubmitted(true);

            setTimeout(() => {
                window.close();
                document.body.innerHTML = '<div style="text-align: center; padding: 20px;">You can now close this window</div>';
            }, 2000);

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

                {!submitted && !error && (
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

                {submitted && (
                    <div className="py-8 text-center">
                        <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
                        <p className="text-xl font-semibold text-gray-800">
                            {status === 'IN' ? 'Signed In' : 'Signed Out'} Successfully
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            This window will close automatically
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckInSystem;