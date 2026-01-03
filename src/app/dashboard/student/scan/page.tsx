'use client';

import { useState, useEffect, useRef } from 'react';
import { markAttendance, getMyAttendanceHistory } from '../../../../actions/attendance';
import { Camera, CheckCircle, XCircle, MapPin, Loader2, History, QrCode, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface AttendanceHistory {
    id: number;
    room_number: string;
    floor_number: number;
    building_name: string;
    marked_at: string;
    distance_m: number;
}

// Detect if device is mobile or tablet (has camera + GPS typically)
function isMobileOrTablet(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'webos', 'blackberry', 'windows phone', 'opera mini', 'mobile', 'tablet'];

    // Check user agent
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));

    // Also check touch capability and screen size
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;

    return isMobileUA || (hasTouch && isSmallScreen);
}

export default function StudentScanPage() {
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'locating' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [history, setHistory] = useState<AttendanceHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isMobile, setIsMobile] = useState(true); // Default to true for SSR
    const [debugLat, setDebugLat] = useState<string | null>(null);
    const [debugLng, setDebugLng] = useState<string | null>(null);
    const [gettingGPS, setGettingGPS] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    function getGPSDebug() {
        setGettingGPS(true);
        if (!navigator.geolocation) {
            alert('Geolocation not supported');
            setGettingGPS(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setDebugLat(pos.coords.latitude.toFixed(6));
                setDebugLng(pos.coords.longitude.toFixed(6));
                setGettingGPS(false);
            },
            (err) => {
                alert('Error: ' + err.message);
                setGettingGPS(false);
            },
            { enableHighAccuracy: true }
        );
    }

    useEffect(() => {
        loadHistory();
        // Check device type on client side
        setIsMobile(isMobileOrTablet());

        // Also listen for resize in case of responsive testing
        const handleResize = () => setIsMobile(isMobileOrTablet());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function loadHistory() {
        const result = await getMyAttendanceHistory();
        if (result.history) {
            setHistory(result.history);
        }
    }

    function startScanning() {
        setScanning(true);
        setStatus('scanning');
        setMessage(null);

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                    showTorchButtonIfSupported: true
                },
                false
            );

            scanner.render(
                async (decodedText) => {
                    // QR scanned successfully
                    scanner.clear();
                    setScanning(false);
                    await processQRCode(decodedText);
                },
                (error) => {
                    // Scanning error (ignore - keep scanning)
                }
            );

            scannerRef.current = scanner;
        }, 100);
    }

    function stopScanning() {
        if (scannerRef.current) {
            scannerRef.current.clear();
        }
        setScanning(false);
        setStatus('idle');
    }

    async function processQRCode(qrData: string) {
        setStatus('locating');
        setMessage('Getting your location...');

        try {
            // Parse QR payload
            let payload: { token: string };
            try {
                payload = JSON.parse(qrData);
            } catch {
                setStatus('error');
                setMessage('Invalid QR code format');
                return;
            }

            if (!payload.token) {
                setStatus('error');
                setMessage('Invalid QR code - no token found');
                return;
            }

            // Get GPS location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation not supported'));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            setStatus('submitting');
            setMessage('Marking attendance...');

            // Submit attendance
            const result = await markAttendance(payload.token, lat, lng);

            if (result.error) {
                setStatus('error');
                setMessage(result.error);
            } else {
                setStatus('success');
                setMessage(`✅ ${result.message}\n📍 Location: Verified\n🚪 ${result.classroom}`);
                await loadHistory();
            }
        } catch (error: any) {
            setStatus('error');
            if (error.code === 1) {
                setMessage('Location access denied. Please enable GPS permission.');
            } else if (error.code === 2) {
                setMessage('Unable to get location. Please try again.');
            } else if (error.code === 3) {
                setMessage('Location request timed out. Please try again.');
            } else {
                setMessage(error.message || 'An error occurred');
            }
        }
    }

    // Desktop/Laptop Detection - Show Mobile Required Message
    if (!isMobile) {
        return (
            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Smartphone size={40} className="text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-3">Mobile Device Required</h1>
                        <p className="text-gray-600 mb-6">
                            QR code scanning requires a camera and GPS which are typically available on mobile phones and tablets.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 justify-center text-gray-500 mb-3">
                                <Monitor size={24} />
                                <span className="text-lg">→</span>
                                <Smartphone size={24} />
                            </div>
                            <p className="text-sm text-gray-500">
                                Please open this page on your <strong>mobile phone</strong> or <strong>tablet</strong> to mark attendance.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                            <p className="font-medium text-blue-800 mb-2">📱 How to access on mobile:</p>
                            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                                <li>Open your mobile browser</li>
                                <li>Go to the same URL</li>
                                <li>Login with your credentials</li>
                                <li>Navigate to Scan QR</li>
                            </ol>
                        </div>
                    </div>

                    {/* Still show history on desktop */}
                    <div className="mt-6 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <History size={20} />
                            Your Attendance History
                        </h3>
                        {history.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No attendance records yet</p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {history.map((h) => (
                                    <div key={h.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                        <div>
                                            <p className="font-medium">{h.building_name} - Floor {h.floor_number}</p>
                                            <p className="text-sm text-gray-500">Room {h.room_number}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(h.marked_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Mobile/Tablet View - Full Scanner
    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <Camera size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Scan QR</h1>
                            <p className="text-gray-500 text-sm">Mark your attendance</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <History size={20} />
                    </button>
                </div>

                {showHistory ? (
                    /* Attendance History */
                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold mb-4">Attendance History</h3>
                        {history.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No attendance records yet</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {history.map((h) => (
                                    <div key={h.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                        <div>
                                            <p className="font-medium">{h.building_name} - Floor {h.floor_number}</p>
                                            <p className="text-sm text-gray-500">Room {h.room_number}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(h.marked_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <CheckCircle size={20} className="text-green-600" />
                                            {/* <p className="text-xs text-gray-400">{h.distance_m}m</p> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Scanner Area */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4">
                            {status === 'idle' && (
                                <div className="text-center py-8">
                                    <QrCode size={64} className="mx-auto mb-4 text-gray-300" />
                                    <button
                                        onClick={startScanning}
                                        className="px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 mx-auto hover:bg-gray-800"
                                    >
                                        <Camera size={24} />
                                        Start Scanning
                                    </button>
                                    <p className="text-gray-400 text-sm mt-4">
                                        Point your camera at the QR code shown by your teacher
                                    </p>

                                    {/* Debug / Confidence Info */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 font-mono text-left">
                                        <p className="font-bold mb-1">📍 GPS Debug Info:</p>
                                        <p>Status: {gettingGPS ? 'Acquiring...' : 'Ready'}</p>
                                        {debugLat && <p>Your Lat: {debugLat}</p>}
                                        {debugLng && <p>Your Lng: {debugLng}</p>}
                                        <button
                                            onClick={() => getGPSDebug()}
                                            className="mt-2 text-blue-600 hover:underline"
                                        >
                                            Check My Location
                                        </button>
                                    </div>
                                </div>
                            )}

                            {scanning && (
                                <div>
                                    <div id="qr-reader" className="rounded-xl overflow-hidden" />
                                    <button
                                        onClick={stopScanning}
                                        className="w-full mt-4 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {(status === 'locating' || status === 'submitting') && (
                                <div className="text-center py-12">
                                    <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
                                    <p className="text-gray-600">{message}</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={48} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-700 mb-2">Attendance Marked!</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{message}</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle size={48} className="text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-700 mb-2">Failed</h3>
                                    <p className="text-gray-600">{message}</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Location Info */}
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-orange-800">
                                <p className="font-medium">Location Required</p>
                                <p className="text-orange-600">Your GPS location will be verified to ensure you're in the classroom. Make sure location services are enabled.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
