import { useState, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "../../context/UserContext";
import {
  FiUpload,
  FiX,
  FiFile,
  FiTag,
  FiCalendar,
  FiEdit,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid"; // Add UUID for unique temp IDs

const documentCategories = [
  "Prescription",
  "Lab Report",
  "Medical History",
  "Vaccination Record",
  "Discharge Summary",
  "Imaging Report",
  "Specialist Consultation",
  "Insurance Document",
  "Other",
];

function DocumentUpload({ onClose }) {
  const { addDocument } = useUser();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentInfo, setDocumentInfo] = useState({
    title: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
    tags: "",
  });
  const [error, setError] = useState(null);

  const processOCR = async (file) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let mockOcrText = "";
    let suggestedCategory = "";
    let suggestedTitle = file.name.replace(/\.[^/.]+$/, "");

    if (file.name.toLowerCase().includes("prescription")) {
      mockOcrText =
        "PRESCRIPTION\n\nPatient: John Doe\nDate: 2023-06-15\n\nRx: Metformin 500mg\nSig: Take one tablet twice daily with meals\nQty: 60\nRefills: 3\n\nDr. Sarah Johnson, MD\nLicense: 12345";
      suggestedCategory = "Prescription";
    } else if (
      file.name.toLowerCase().includes("lab") ||
      file.name.toLowerCase().includes("blood")
    ) {
      mockOcrText =
        "LABORATORY RESULTS\n\nPatient: John Doe\nDate Collected: 2023-05-20\n\nGlucose: 110 mg/dL (Reference: 70-99)\nHbA1c: 6.2% (Reference: <5.7%)\nTotal Cholesterol: 185 mg/dL (Reference: <200)\nHDL: 45 mg/dL (Reference: >40)\nLDL: 110 mg/dL (Reference: <100)";
      suggestedCategory = "Lab Report";
    } else if (file.name.toLowerCase().includes("history")) {
      mockOcrText =
        "MEDICAL HISTORY\n\nPatient: John Doe\nDOB: 05/12/1975\n\nDiagnoses:\n- Type 2 Diabetes - diagnosed 2015\n- Hypertension - diagnosed 2018\n\nSurgeries:\n- Appendectomy - 2002\n\nFamily History:\n- Father: Heart disease\n- Mother: Breast cancer";
      suggestedCategory = "Medical History";
    } else {
      mockOcrText =
        "Document content extracted by OCR will appear here.\n\nThis is a sample of detected text that would normally be extracted from your document.";
      suggestedCategory = "Other";
    }

    setOcrText(mockOcrText);
    setDocumentInfo({
      ...documentInfo,
      title: suggestedTitle,
      category: suggestedCategory,
      content: mockOcrText,
    });
    setIsProcessing(false);
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
      await processOCR(selectedFile);
    },
    [documentInfo]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const dropzoneStyle = useMemo(
    () => ({
      borderWidth: 2,
      borderRadius: "0.5rem",
      borderColor: "#e5e7eb",
      borderStyle: "dashed",
      padding: "2rem",
      outline: "none",
      transition: "border .24s ease-in-out",
      ...(isDragActive ? { borderColor: "#3b82f6" } : {}),
      ...(isDragAccept ? { borderColor: "#10b981" } : {}),
      ...(isDragReject ? { borderColor: "#ef4444" } : {}),
    }),
    [isDragActive, isDragAccept, isDragReject]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentInfo({ ...documentInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file || !documentInfo.title || !documentInfo.category) {
      setError("File, title, and category are required.");
      return;
    }

    const tags = documentInfo.tags
      ? documentInfo.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", documentInfo.title);
    formData.append("category", documentInfo.category);
    formData.append("date", documentInfo.date);
    formData.append("content", documentInfo.content);
    formData.append("tags", JSON.stringify(tags));

    try {
      console.log("Uploading document to API...");
      const uploadedDoc = await addDocument(formData);
      console.log("addDocument response:", uploadedDoc);
      onClose(uploadedDoc);
    } catch (err) {
      console.error("Document upload error:", err);
      setError(err.message || "Failed to upload document. Please try again.");
      const fallbackDoc = {
        id: `temp-${uuidv4()}`, // Use UUID for unique temp ID
        title: documentInfo.title,
        category: documentInfo.category,
        date: documentInfo.date,
        content: documentInfo.content,
        tags: tags,
        fileName: file.name,
      };
      console.log("Using fallback document:", fallbackDoc);
      onClose(fallbackDoc);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setOcrText("");
    setDocumentInfo({
      title: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      content: "",
      tags: "",
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg w-full max-w-4xl mx-auto overflow-hidden">
      <div className="bg-primary-50 dark:bg-primary-900/30 px-6 py-4 border-b border-primary-100 dark:border-primary-900">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-primary-700 dark:text-primary-300">
            Upload Medical Document
          </h3>
          <button
            onClick={() => onClose(null)}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
            aria-label="Close upload modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="px-6 py-4">
        {error && (
          <div
            className="mb-4 p-3 bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200 rounded"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        {!file ? (
          <div {...getRootProps({ style: dropzoneStyle })}>
            <input {...getInputProps()} />
            <div className="text-center">
              <FiUpload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop a file here, or click to select a file"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                Supports: PDF, JPG, PNG
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <FiFile className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                  {file.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {(file.size / 1024).toFixed(2)} KB · {file.type}
                </p>
              </div>
              <button
                onClick={removeFile}
                className="ml-4 text-neutral-500 hover:text-danger-500 dark:text-neutral-400 dark:hover:text-danger-400"
                aria-label="Remove selected file"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Document Text (OCR)
              </h4>
              <div className="h-32 overflow-y-auto p-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    <span className="ml-2 text-neutral-600 dark:text-neutral-400">
                      Processing document...
                    </span>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                    {ocrText}
                  </pre>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="title"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    <FiEdit className="h-4 w-4 mr-1" />
                    Document Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={documentInfo.title}
                    onChange={handleChange}
                    className="form-input"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    <FiTag className="h-4 w-4 mr-1" />
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={documentInfo.category}
                    onChange={handleChange}
                    className="form-input"
                    required
                    aria-required="true"
                  >
                    <option value="">Select category</option>
                    {documentCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="date"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    <FiCalendar className="h-4 w-4 mr-1" />
                    Document Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={documentInfo.date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tags"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    <FiTag className="h-4 w-4 mr-1" />
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={documentInfo.tags}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. diabetes, medication, quarterly"
                  />
                </div>
              </div>
              <div className="text-right mt-6">
                <button
                  type="button"
                  onClick={() => onClose(null)}
                  className="btn btn-secondary mr-2"
                  aria-label="Cancel upload"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessing}
                  aria-label="Save document"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentUpload;
