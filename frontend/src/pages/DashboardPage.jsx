import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import PatientProfile from "../components/dashboard/PatientProfile";
import PatientQRCode from "../components/dashboard/PatientQRCode";
import {
  FiFileText,
  FiUpload,
  FiDownload,
  FiAlertCircle,
} from "react-icons/fi";
import { jsPDF } from "jspdf";

function DashboardPage() {
  const { currentUser, userRole, isPatient } = useAuth();
  const { documents, loading } = useUser();

  const exportToPDF = () => {
    const name = currentUser?.name || "N/A";
    const bloodType = currentUser?.bloodType || "N/A";
    const allergies = currentUser?.allergies?.join(", ") || "None";
    const medications = currentUser?.medications?.join(", ") || "None";
    const conditions = currentUser?.conditions?.join(", ") || "None";
    const contacts = currentUser?.emergencyContacts || [];

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Medical Summary", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${name}`, 20, 40);
    doc.text(`Blood Type: ${bloodType}`, 20, 48);
    doc.text(`Allergies: ${allergies}`, 20, 56);
    doc.text(`Medications: ${medications}`, 20, 64);
    doc.text(`Medical Conditions: ${conditions}`, 20, 72);

    let y = 82;
    doc.setFontSize(14);
    doc.text("Emergency Contacts:", 20, y);
    doc.setFontSize(12);
    y += 8;
    contacts.forEach((contact) => {
      doc.text(
        `• ${contact.name} (${contact.relationship}): ${contact.phone}`,
        22,
        y
      );
      y += 8;
    });

    if (documents?.length > 0) {
      y += 6;
      doc.setFontSize(14);
      doc.text("Recent Medical Documents:", 20, y);
      y += 8;
      doc.setFontSize(12);
      documents.forEach((docItem) => {
        doc.text(
          `• ${docItem.title} (${docItem.category}) - ${docItem.date}`,
          22,
          y
        );
        y += 8;
        if (docItem.content) {
          const lines = doc.splitTextToSize(docItem.content, 160);
          lines.forEach((line) => {
            doc.text(line, 24, y);
            y += 6;
          });
          y += 4;
        }
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save(`medical-summary-${name.replace(" ", "-")}.pdf`);
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isPatient) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
          Medical Staff Dashboard
        </h1>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-8">
          <div className="text-center py-8">
            <FiAlertCircle className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Welcome to PulseChain Medical Portal
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-6">
              As a medical professional, you can access patient emergency
              information by scanning their QR code or using the patient ID.
            </p>
            <Link to="/scan" className="btn btn-primary">
              Scan Patient QR Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        Patient Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PatientProfile />
        <PatientQRCode />
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
        Recent Documents
      </h2>
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-8">
        {documents.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                      <h3 className="mt-2 text-base font-medium text-neutral-900 dark:text-white">
                        {doc.title}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {doc.date}
                      </p>
                    </div>
                    <div className="flex">
                      <span className="text-secondary-500 hover:text-secondary-600 cursor-pointer">
                        <FiFileText className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/documents"
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                View all documents ({documents.length})
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiFileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No documents yet
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Upload your medical documents to keep track of your health
              information.
            </p>
            <Link to="/documents" className="btn btn-primary">
              <FiUpload className="mr-2 h-4 w-4" />
              Upload Documents
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
              Export Medical Summary
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Download a complete summary of your health profile for offline
              use.
            </p>
          </div>
          <button onClick={exportToPDF} className="btn btn-primary">
            <FiDownload className="mr-2 h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
