import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FiCamera, FiUpload, FiLink, FiAlertCircle } from 'react-icons/fi';
import jsQR from "jsqr";


function QRScanPage() {
  const [scanMode, setScanMode] = useState('camera'); // 'camera', 'upload', or 'link'
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState('');
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  

useEffect(() => {
  let interval;

  if (isScanning && scanMode === "camera") {
    interval = setInterval(async () => {
      const video = webcamRef.current?.video;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code?.data) {
        setIsScanning(false);
        clearInterval(interval);

        try {
          const url = new URL(code.data);
          const parts = url.pathname.split("/");
          const userId = parts[2];
          if (userId) navigate(`/emergency/${userId}`);
        } catch (err) {
          console.error("Invalid QR code content", err);
        }
      }
    }, 500);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isScanning, scanMode, navigate]);

  
  const startScanning = () => {
    setError('');
    setIsScanning(true);
  };
  
  const stopScanning = () => {
    setIsScanning(false);
  };

 const handleFileUpload = (e) => {
   const file = e.target.files[0];
   if (!file) return;

   const reader = new FileReader();
   reader.onload = (event) => {
     const img = new Image();
     img.src = event.target.result;

     img.onload = () => {
       const canvas = document.createElement("canvas");
       canvas.width = img.width;
       canvas.height = img.height;
       const ctx = canvas.getContext("2d");
       ctx.drawImage(img, 0, 0);

       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
       const code = jsQR(imageData.data, canvas.width, canvas.height);

       if (code) {
         try {
           const url = new URL(code.data);
           const userId = url.pathname.split("/")[2]; 

           if (userId) {
             navigate(`/emergency/${userId}`);
           } else {
             setError("User ID not found in QR code");
           }
         } catch (err) {
           console.error("Invalid QR code content:", code.data);
           setError("Scanned QR code is not a valid URL");
         }
       } else {
         setError("No QR code detected in image");
       }
     };
   };

   reader.readAsDataURL(file);
 };

  
  const handlePatientIdSubmit = (e) => {
    e.preventDefault();
    
    if (!patientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }
    
    navigate(`/emergency/${patientId}`);
  };
  
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white text-center mb-2">
        Emergency Medical Access
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 text-center mb-8 max-w-2xl mx-auto">
        Scan a patient's QR code to access their critical medical information for emergency care.
      </p>
      
      {/* Mode selection */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setScanMode('camera')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              scanMode === 'camera'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-700'
            }`}
          >
            <FiCamera className="h-4 w-4 mr-2 inline" />
            Scan QR
          </button>
          <button
            type="button"
            onClick={() => {
              setScanMode('upload');
              setIsScanning(false);
            }}
            className={`px-4 py-2 text-sm font-medium ${
              scanMode === 'upload'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 border-t border-b border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-700'
            }`}
          >
            <FiUpload className="h-4 w-4 mr-2 inline" />
            Upload QR
          </button>
          <button
            type="button"
            onClick={() => {
              setScanMode('link');
              setIsScanning(false);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              scanMode === 'link'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-700'
            }`}
          >
            <FiLink className="h-4 w-4 mr-2 inline" />
            Enter ID
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger flex items-center mb-6 max-w-md mx-auto">
          <FiAlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Scan modes */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden max-w-md mx-auto">
        {/* Camera mode */}
        {scanMode === 'camera' && (
          <div className="p-4">
            <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden mb-4">
              {isScanning ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "environment"
                    }}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary-500 rounded-lg animate-pulse"></div>
                  </div>
                  
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="inline-block px-3 py-1 bg-neutral-900/70 text-white text-sm rounded-full">
                      Scanning for QR code...
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <FiCamera className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Camera preview will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              {isScanning ? (
                <button
                  onClick={stopScanning}
                  className="btn btn-danger"
                >
                  Stop Scanning
                </button>
              ) : (
                <button
                  onClick={startScanning}
                  className="btn btn-primary"
                >
                  Start Camera Scan
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Upload mode */}
        {scanMode === 'upload' && (
          <div className="p-6">
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
              <FiUpload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Upload an image containing a PulseChain QR code
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-file-upload"
              />
              <label
                htmlFor="qr-file-upload"
                className="btn btn-primary cursor-pointer"
              >
                Select Image
              </label>
            </div>
          </div>
        )}
        
        {/* Link/ID mode */}
        {scanMode === 'link' && (
          <div className="p-6">
            <form onSubmit={handlePatientIdSubmit}>
              <div className="mb-4">
                <label htmlFor="patient-id" className="form-label">
                  Patient ID
                </label>
                <input
                  type="text"
                  id="patient-id"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID (e.g., user-123)"
                  className="form-input"
                />
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-primary">
                  Access Emergency Info
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-8 max-w-md mx-auto bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 border border-primary-100 dark:border-primary-800">
        <h3 className="text-primary-800 dark:text-primary-300 font-medium mb-2">
          How to access emergency information:
        </h3>
        <ul className="text-primary-700 dark:text-primary-400 text-sm space-y-2">
          <li><strong>Scan QR Code:</strong> Point your camera at the patient's PulseChain QR code</li>
          <li><strong>Upload Image:</strong> If you have an image of the QR code, upload it here</li>
          <li><strong>Enter ID:</strong> If you know the patient's ID, enter it directly</li>
        </ul>
      </div>
    </div>
  );
}

export default QRScanPage;