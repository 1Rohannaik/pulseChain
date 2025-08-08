import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on initial load using /check endpoint
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "https://pulsechain.onrender.com/api/v1/users/check",
          {
            method: "GET",
            credentials: "include", // Include cookies for JWT
          }
        );
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          setUserRole(userData.role);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error.message);
        setCurrentUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(
        "https://pulsechain.onrender.com/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for JWT
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const userData = await response.json();
      setCurrentUser(userData);
      setUserRole(userData.role);
      return userData;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  };

  // Signup function
  const signup = async (
    email,
    password,
    confirmPassword,
    fullName,
    role,
    licenseId
  ) => {
    try {
      // Conditionally include licenseId only for medical role
      const body = {
        email,
        password,
        confirmPassword,
        fullName,
        role,
      };
      if (role === "medical") {
        body.licenseId = licenseId;
      }

      const response = await fetch(
        "https://pulsechain.onrender.com/api/v1/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for JWT
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const userData = await response.json();
      setCurrentUser(userData);
      setUserRole(userData.role);
      return userData;
    } catch (error) {
      throw new Error(error.message || "Signup failed");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await fetch(
        "https://pulsechain.onrender.com/api/v1/users/logout",
        {
          method: "POST",
          credentials: "include", // Include cookies for JWT
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error during logout:", error.message);
      throw new Error(error.message || "Logout failed");
    }
  };

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
    isPatient: userRole === "patient",
    isMedical: userRole === "medical",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
