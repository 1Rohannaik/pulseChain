import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import {
  FiFileText,
  FiTag,
  FiCalendar,
  FiTrash2,
  FiDownload,
  FiSearch,
  FiFilter,
  FiLoader,
} from "react-icons/fi";

function DocumentList({ refreshTrigger }) {
  const { documents, deleteDocument, fetchDocuments } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [newDocument, setNewDocument] = useState(null);
  const [pendingDocument, setPendingDocument] = useState(null);
  const [lastUploadedId, setLastUploadedId] = useState(null); // ✅ used to clear duplicate key warning
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://pulsechain.onrender.com/api/v1";

  useEffect(() => {
    if (
      refreshTrigger &&
      typeof refreshTrigger === "object" &&
      refreshTrigger.id
    ) {
      const normalizedDoc = {
        id: refreshTrigger.id,
        title: refreshTrigger.title || "Untitled",
        content: refreshTrigger.content || "No content",
        category: refreshTrigger.category || "Uncategorized",
        date: refreshTrigger.date || "No date",
        tags: Array.isArray(refreshTrigger.tags) ? refreshTrigger.tags : [],
        fileName: refreshTrigger.fileName || "document",
      };
      setNewDocument(normalizedDoc);
      setLastUploadedId(normalizedDoc.id);
      fetchDocuments();
    } else if (refreshTrigger) {
      setPendingDocument({
        id: `pending-${Date.now()}`,
        title: "Uploading Document...",
        content: "Processing...",
        category: "Uncategorized",
        date: new Date().toISOString().split("T")[0],
        tags: [],
        fileName: "document",
        isPending: true,
      });
    }
  }, [refreshTrigger, fetchDocuments]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete document. Please try again.");
      await fetchDocuments();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, fileName) => {
    setDownloadingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "document");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download document. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const categories = [
    ...new Set(documents.map((doc) => doc.category || "Uncategorized")),
  ];

 const allDocs = [
  ...(pendingDocument ? [pendingDocument] : []),
  ...(newDocument ? [newDocument] : []),
  ...documents,
 ];

 // Deduplicate based on doc.id (Map will keep the last one)
 const uniqueDocs = Array.from(
   new Map(allDocs.map((doc) => [doc.id, doc])).values()
 );

 // Apply search and filter
 const filteredDocuments = uniqueDocs.filter((doc) => {
   const searchLower = searchTerm.toLowerCase();

   const matchesSearch =
     doc.title?.toLowerCase().includes(searchLower) ||
     doc.content?.toLowerCase().includes(searchLower) ||
     (Array.isArray(doc.tags) &&
       doc.tags.some((tag) => tag.toLowerCase().includes(searchLower)));

   const matchesCategory = !categoryFilter || doc.category === categoryFilter;

   return matchesSearch && matchesCategory;
 });


  if (error) {
    return (
      <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow">
        <div className="text-danger-500 mb-4" aria-live="assertive">
          Error: {error}
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchDocuments();
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
          />
        </div>
        <div className="md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="h-5 w-5 text-neutral-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input pl-10 w-full border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Cards */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                doc.isPending ? "opacity-50" : ""
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${
                        doc.category === "Prescription"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                          : doc.category === "Lab Report"
                          ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
                          : doc.category === "Medical History"
                          ? "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200"
                          : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200"
                      }`}
                    >
                      {doc.category || "Uncategorized"}
                    </span>
                    <h3 className="mt-2 text-base font-medium text-neutral-900 dark:text-white">
                      {doc.title || "Untitled"}
                    </h3>
                  </div>
                  <FiFileText className="h-6 w-6 text-neutral-400" />
                </div>

                <div className="mt-2 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <FiCalendar className="mr-1.5 h-4 w-4" />
                  <span>{doc.date || "No date"}</span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {doc.content || "No content"}
                  </p>
                </div>

                {doc.tags?.length > 0 && (
                  <div className="mt-3 flex items-center flex-wrap">
                    <FiTag className="mr-1 h-4 w-4 text-neutral-400" />
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-neutral-500 dark:text-neutral-400 mr-2"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 flex justify-between">
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id || doc.isPending}
                  className="text-sm text-danger-500 hover:text-danger-600 dark:hover:text-danger-400 flex items-center disabled:opacity-50"
                >
                  {deletingId === doc.id ? (
                    <FiLoader className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FiTrash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </button>
                <button
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  disabled={downloadingId === doc.id || doc.isPending}
                  className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center disabled:opacity-50"
                >
                  {downloadingId === doc.id ? (
                    <FiLoader className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FiDownload className="h-4 w-4 mr-1" />
                  )}
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow">
          <FiFileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No documents found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {searchTerm || categoryFilter
              ? "Try adjusting your search or filter criteria."
              : "Upload your first medical document to get started."}
          </p>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
