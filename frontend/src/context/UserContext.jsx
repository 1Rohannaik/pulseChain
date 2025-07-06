import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:3000";

  const fetchProfile = async () => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const profileData = await response.json();
      const newProfile = {
        name: profileData.fullName || "",
        age: profileData.age || "",
        bloodType: profileData.bloodType || "",
        allergies: Array.isArray(profileData.allergies)
          ? profileData.allergies
          : [],
        medications: Array.isArray(profileData.medications)
          ? profileData.medications
          : [],
        conditions: Array.isArray(profileData.conditions)
          ? profileData.conditions
          : [],
        emergencyContacts: Array.isArray(profileData.emergencyContacts)
          ? profileData.emergencyContacts
          : [],
      };
      setProfile(newProfile);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/documents`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch documents error:", err);
      setDocuments([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (currentUser) {
        await Promise.all([fetchProfile(), fetchDocuments()]);
      } else {
        setProfile(null);
        setDocuments([]);
      }
      setLoading(false);
    };
    init();
  }, [currentUser]);

  const updateProfile = async (updatedProfile) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      await fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const addDocument = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/documents/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      console.log("addDocument API response:", data);

      const newDoc = data.document || data;
      if (!newDoc || !newDoc.id) {
        console.warn("Invalid document response:", newDoc);
        throw new Error("No valid document returned from server");
      }

      const normalizedDoc = {
        id: newDoc.id,
        title: newDoc.title || "Untitled",
        content: newDoc.content || "No content",
        category: newDoc.category || "Uncategorized",
        date: newDoc.date || new Date().toISOString().split("T")[0],
        tags: Array.isArray(newDoc.tags) ? newDoc.tags : [],
        fileName: newDoc.fileName || "document",
      };

      // Rely on DocumentList for optimistic display, only sync state after fetch
      return normalizedDoc;
    } catch (err) {
      console.error("addDocument error:", err);
      throw err;
    }
  };

  const updateDocument = (id, updatedDocument) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updatedDocument } : doc))
    );
  };

  const deleteDocument = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("deleteDocument error:", err);
      throw err;
    }
  };

  const value = {
    profile,
    documents,
    loading,
    error,
    updateProfile,
    addDocument,
    updateDocument,
    deleteDocument,
    fetchDocuments,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
