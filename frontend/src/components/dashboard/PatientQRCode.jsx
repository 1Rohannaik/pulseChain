import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { FiDownload, FiPrinter } from "react-icons/fi";

function PatientQRCode() {
  const { currentUser } = useAuth();
  const qrCodeRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [emergencyUrl, setEmergencyUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes in seconds

  // Fetch QR code Data URL from API
  useEffect(() => {
    const fetchQRCodeUrl = async () => {
      if (!currentUser?.id) {
        setError("No authenticated user");
        setLoading(false);
        return;
      }

      const qrApiUrl = `http://localhost:3000/api/v1/qr/${currentUser.id}`;
      try {
        const response = await fetch(qrApiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch QR code: ${response.statusText}`);
        }

        const data = await response.json();
        setQrCodeDataUrl(data.qrCode || "");
        setEmergencyUrl(
          `http://localhost:5173/emergency/access?token=${data.token}`
        );
        setSecondsLeft(300); // Reset countdown to 5 minutes after successful fetch
      } catch (err) {
        console.error("Error fetching QR code:", err);
        setError(`Failed to load QR code: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodeUrl(); // Initial fetch

    // Set up interval to refresh QR code every 4 minutes (240,000ms)
    const refreshInterval = setInterval(fetchQRCodeUrl, 4 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval); // Clean up interval on component unmount
    };
  }, [currentUser]);

  // Countdown timer for next refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // When countdown reaches 0, reset to 5 minutes (300 seconds)
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clean up timer on component unmount
  }, []);

  // Format seconds into MM:SS for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const downloadQRCode = async () => {
    if (!qrCodeRef.current) return;
    try {
      const dataUrl = await toPng(qrCodeRef.current);
      const link = document.createElement("a");
      link.download = `pulsechain-emergency-qr-${
        currentUser?.name || "user"
      }.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setError("Failed to download QR code.");
    }
  };

  const downloadEmergencyCard = async () => {
    if (!qrCodeRef.current) return;
    try {
      const dataUrl = await toPng(qrCodeRef.current);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 55],
      });
      pdf.addImage(dataUrl, "PNG", 5, 5, 30, 30);
      pdf.setFontSize(10);
      pdf.text("Emergency Medical Info", 40, 10);
      pdf.setFontSize(8);
      pdf.text(`Name: ${currentUser?.name || "Not specified"}`, 40, 15);
      pdf.text(
        `Blood Type: ${currentUser?.bloodType || "Not specified"}`,
        40,
        20
      );
      pdf.setFontSize(6);
      pdf.text("Scan QR or visit:", 5, 40);
      pdf.text(emergencyUrl, 5, 45, { maxWidth: 75 });
      pdf.save(`pulsechain-emergency-card-${currentUser?.name || "user"}.pdf`);
    } catch (error) {
      console.error("Error generating emergency card:", error);
      setError("Failed to generate emergency card.");
    }
  };

  const printQRCode = async () => {
    if (!qrCodeRef.current) return;
    try {
      const dataUrl = await toPng(qrCodeRef.current);
      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      document.body.appendChild(printFrame);

      printFrame.contentDocument.write(`
        <html>
          <head>
            <title>PulseChain Emergency QR Code</title>
            <style>
              body { text-align: center; font-family: Arial; padding: 20px; }
              .card { border: 1px solid #ccc; padding: 15px; display: inline-block; margin: 0 auto; }
              img { max-width: 150px; }
              h2, p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <div className="card">
              <h2>Medical Emergency Info</h2>
              <img src="${dataUrl}" alt="Emergency QR Code" />
              <p><strong>Name:</strong> ${
                currentUser?.name || "Not specified"
              }</p>
              <p><strong>Scan QR code for emergency access</strong></p>
            </div>
          </body>
        </html>
      `);

      setTimeout(() => {
        printFrame.contentWindow.print();
        document.body.removeChild(printFrame);
      }, 500);
    } catch (error) {
      console.error("Error printing QR code:", error);
      setError("Failed to print QR code.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
        <p className="text-danger-600 dark:text-danger-400">{error}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Using fallback emergency URL: {emergencyUrl}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
        Your Emergency QR Code
      </h3>

      <div className="flex flex-col items-center max-w-full">
        <div
          ref={qrCodeRef}
          className="bg-white p-4 rounded-lg shadow-sm overflow-hidden"
          style={{ width: "fit-content", maxWidth: "100%" }}
        >
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="Emergency QR Code"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <QRCode
              value={emergencyUrl}
              size={180}
              level="H"
              fgColor="#0275d8"
            />
          )}
        </div>

        <div className="mt-4 text-center w-full">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            Scan this QR code to access your emergency medical information.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-2 break-words">
            Emergency URL: {emergencyUrl}
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400 mb-4">
            QR code refreshes in: {formatTime(secondsLeft)}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={downloadQRCode}
              className="btn btn-secondary text-sm py-2 px-4"
            >
              <FiDownload className="mr-2 h-4 w-4" /> Download QR
            </button>

            <button
              onClick={downloadEmergencyCard}
              className="btn btn-primary text-sm py-2 px-4"
            >
              <FiDownload className="mr-2 h-4 w-4" /> Emergency Card PDF
            </button>

            <button
              onClick={printQRCode}
              className="btn btn-secondary text-sm py-2 px-4"
            >
              <FiPrinter className="mr-2 h-4 w-4" /> Print QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientQRCode;
