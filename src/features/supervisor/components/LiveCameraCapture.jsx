import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveCameraCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please allow permissions.");
            toast.error("Camera access failed");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Match canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Overlay Date/Time
        const now = new Date();
        const timestamp = now.toLocaleString();

        // Draw timestamp on image
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.strokeText(timestamp, 20, canvas.height - 30);
        ctx.fillText(timestamp, 20, canvas.height - 30);

        canvas.toBlob((blob) => {
            // Get Location immediately after capture
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by this browser.");
                return;
            }

            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setLocation(loc);
                    setCapturedImage(URL.createObjectURL(blob)); // Preview
                    setLoading(false);

                    // Setup file for upload
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file, loc, now);
                    stopCamera(); // Stop camera after capture
                },
                (err) => {
                    setLoading(false);
                    toast.error("Location access denied. Location is required.");
                    console.error(err);
                },
                { enableHighAccuracy: true }
            );
        }, 'image/jpeg', 1.0);

    }, [onCapture, stream]);

    const retake = () => {
        setCapturedImage(null);
        setLocation(null);
        startCamera();
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-col text-center">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p>{error}</p>
                <button onClick={startCamera} className="mt-2 text-sm underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto relative rounded-xl overflow-hidden shadow-lg bg-black">
            {!capturedImage ? (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <button
                            onClick={capturePhoto}
                            disabled={loading}
                            className="bg-white p-4 rounded-full shadow-lg border-4 border-gray-200 hover:bg-gray-100 active:scale-95 transition-all"
                        >
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </>
            ) : (
                <div className="relative w-full">
                    <img src={capturedImage} alt="Captured" className="w-full h-auto" />
                    <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                            onClick={retake}
                            className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                    {location && (
                        <div className="p-2 bg-green-50 text-green-700 text-xs flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Loc: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                        </div>
                    )}
                </div>
            )}
            {/* Hidden Canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    <div className="animate-spin mr-2">⏳</div>
                    Fetching Location...
                </div>
            )}
        </div>
    );
};

export default LiveCameraCapture;
