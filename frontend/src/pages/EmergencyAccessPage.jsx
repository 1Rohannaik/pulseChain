import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // 👈 useSearchParams instead of useParams
import {
  FiAlertTriangle,
  FiPhone,
  FiDownload,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { jsPDF } from "jspdf";

function EmergencyAccessPage() {
  const [searchParams] = useSearchParams(); // 👈
  const token = searchParams.get("token"); // 👈 extract token from query string

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await fetch(
          `https://pulsechain.onrender.com/api/v1/emergency/info-from-token?token=${token}`
        );
        if (!res.ok) throw new Error("Invalid or expired QR token");
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPatientData();
    } else {
      setError("Missing token in URL");
      setLoading(false);
    }
  }, [token]);

  // ... rest of your component remains unchanged ...

  const downloadEmergencySummary = () => {
    if (!patient) return;

    const pdf = new jsPDF();

    // PDF Content (same as your original)
    pdf.setFontSize(20);
    pdf.setTextColor(0, 117, 216); // primary-500
    pdf.text("EMERGENCY MEDICAL SUMMARY", 105, 20, { align: "center" });

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Patient: ${patient.name}`, 20, 35);

    // ... rest of your PDF generation code ...

    pdf.save(`emergency-summary-${patient.name.replace(" ", "-")}.pdf`);
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Loading emergency information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
          <FiAlertCircle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Error Loading Patient Information
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Emergency banner */}
      <div className="bg-danger-100 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <FiAlertTriangle className="h-6 w-6 mr-2" />
          <span className="font-medium">EMERGENCY MEDICAL INFORMATION</span>
        </div>
        <button
          onClick={downloadEmergencySummary}
          className="btn btn-danger btn-sm flex items-center"
        >
          <FiDownload className="mr-2 h-4 w-4" />
          Download PDF
        </button>
      </div>

      {/* Patient overview */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-primary-500 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-primary-100">
            <div className="flex items-center">
              <span>Age: {patient.age}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold">Blood Type: {patient.bloodType}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Critical information section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
              <FiAlertTriangle className="text-danger-500 mr-2 h-5 w-5" />
              Critical Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Allergies */}
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-100 dark:border-danger-800 rounded-lg p-4">
                <h3 className="font-bold text-danger-700 dark:text-danger-300 mb-2">
                  Allergies
                </h3>
                {patient.allergies?.length > 0 ? (
                  <ul className="space-y-1">
                    {patient.allergies.map((allergy, index) => (
                      <li
                        key={index}
                        className="text-danger-800 dark:text-danger-200 font-medium"
                      >
                        • {allergy}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No known allergies
                  </p>
                )}
              </div>

              {/* Medications */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg p-4">
                <h3 className="font-bold text-primary-700 dark:text-primary-300 mb-2">
                  Medications
                </h3>
                {patient.medications?.length > 0 ? (
                  <ul className="space-y-1">
                    {patient.medications.map((medication, index) => (
                      <li
                        key={index}
                        className="text-primary-800 dark:text-primary-200"
                      >
                        • {medication}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No current medications
                  </p>
                )}
              </div>

              {/* Medical Conditions */}
              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-100 dark:border-warning-800 rounded-lg p-4">
                <h3 className="font-bold text-warning-700 dark:text-warning-300 mb-2">
                  Medical Conditions
                </h3>
                {patient.conditions?.length > 0 ? (
                  <ul className="space-y-1">
                    {patient.conditions.map((condition, index) => (
                      <li
                        key={index}
                        className="text-warning-800 dark:text-warning-200"
                      >
                        • {condition}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No known medical conditions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
              <FiPhone className="text-secondary-500 mr-2 h-5 w-5" />
              Emergency Contacts
            </h2>

            {patient.emergencyContacts?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {contact.name}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {contact.relationship}
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400 font-medium mt-1">
                      {contact.phone}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">
                No emergency contacts provided
              </p>
            )}
          </div>

          {/* Recent medical documents */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
              <FiFileText className="text-primary-500 mr-2 h-5 w-5" />
              Recent Medical Documents
            </h2>

            {patient.documents?.length > 0 ? (
              <div className="space-y-4">
                {patient.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${
                            doc.category === "Prescription"
                              ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                              : doc.category === "Lab Report"
                              ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
                              : "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200"
                          }`}
                        >
                          {doc.category}
                        </span>
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mt-1">
                          {doc.title}
                        </h3>
                      </div>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {doc.date}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 p-3 rounded">
                      {doc.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">
                No recent medical documents available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>This information is provided for emergency medical use only.</p>
        <p>Generated by PulseChain at {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default EmergencyAccessPage;
