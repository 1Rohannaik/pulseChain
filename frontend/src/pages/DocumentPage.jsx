import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import DocumentList from "../components/documents/DocumentList";
import DocumentUpload from "../components/documents/DocumentUpload";
import { FiUpload, FiInfo } from "react-icons/fi";

function DocumentPage() {
  const { isPatient } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(null);

  if (!isPatient) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
          <FiInfo className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Access Restricted
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            Document management is only available for patients. Medical staff
            can access patient information through the emergency QR code system.
          </p>
        </div>
      </div>
    );
  }

  const handleUploadClose = (newDoc) => {
    console.log("DocumentPage handleUploadClose newDoc:", newDoc);
    setShowUploadModal(false);
    if (newDoc && newDoc.id) {
      setRefreshTrigger({ ...newDoc, timestamp: Date.now() });
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            My Medical Documents
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Manage and organize your medical records, prescriptions, and
            reports.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary flex items-center"
            aria-label="Open upload document modal"
          >
            <FiUpload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>
      <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 mb-8 border border-primary-100 dark:border-primary-800">
        <div className="flex">
          <FiInfo className="h-5 w-5 text-primary-500 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">
              Document Management Tips
            </h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-primary-700 dark:text-primary-400 space-y-1">
              <li>
                Upload prescriptions, lab reports, and medical histories to keep
                them organized.
              </li>
              <li>
                Documents are processed with OCR to extract searchable text.
              </li>
              <li>Use tags to easily filter your documents later.</li>
              <li>
                In emergencies, medical personnel can access critical info via
                your QR code.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <DocumentList refreshTrigger={refreshTrigger} />
      {showUploadModal && (
        <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <DocumentUpload onClose={handleUploadClose} />
        </div>
      )}
    </div>
  );
}

export default DocumentPage;
