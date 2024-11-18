import React from 'react';

const QRGenerator = () => {
    // Replace this with your actual Vercel URL
    const baseUrl = 'https://staff-check-in-git-main-ayden-coetzees-projects.vercel.app';

    const generateQRUrl = (status) => {
        const url = `${baseUrl}?status=${status}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    };

    const downloadQR = (status) => {
        const link = document.createElement('a');
        link.href = generateQRUrl(status);
        link.download = `staff-${status.toLowerCase()}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Staff Check-In QR Codes</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sign In QR */}
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-semibold text-green-600 mb-4">Sign In QR Code</h2>
                        <div className="mb-4 p-4 border-4 border-green-500 rounded-lg inline-block">
                            <img
                                src={generateQRUrl('IN')}
                                alt="Sign In QR Code"
                                className="mx-auto"
                            />
                        </div>
                        <button
                            onClick={() => downloadQR('IN')}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Download
                        </button>
                    </div>

                    {/* Sign Out QR */}
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-semibold text-red-600 mb-4">Sign Out QR Code</h2>
                        <div className="mb-4 p-4 border-4 border-red-500 rounded-lg inline-block">
                            <img
                                src={generateQRUrl('OUT')}
                                alt="Sign Out QR Code"
                                className="mx-auto"
                            />
                        </div>
                        <button
                            onClick={() => downloadQR('OUT')}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Download
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-600">
                    <p>Print these QR codes and place them in appropriate locations.</p>
                    <p>Staff members can scan these codes to sign in and out.</p>
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;