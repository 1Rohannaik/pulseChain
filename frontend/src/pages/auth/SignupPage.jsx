import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiBriefcase,
} from "react-icons/fi";

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [licenseId, setLicenseId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation to match validation.js
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      (role === "medical" && !licenseId)
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (fullName.length < 3 || fullName.length > 50) {
      setError("Full name must be between 3 and 50 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (role === "medical" && (licenseId.length < 5 || licenseId.length > 50)) {
      setError("Medical License ID must be between 5 and 50 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Pass licenseId as null for patient role to match validation.js
      await signup(
        email,
        password,
        confirmPassword,
        fullName,
        role,
        role === "medical" ? licenseId : null
      );
      navigate("/dashboard");
    } catch (err) {
      // Handle specific backend errors
      const errorMessage = err.message.includes("Email already exists")
        ? "This email is already registered"
        : err.message.includes("Passwords do not match")
        ? "Passwords do not match"
        : err.message.includes("Medical License ID")
        ? "Invalid Medical License ID"
        : err.message || "Failed to create account";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-8">
              Create your PulseChain account
            </h2>

            {error && (
              <div className="flex items-center text-red-600 bg-red-100 dark:bg-red-900/40 rounded-md px-4 py-3 mb-6">
                <FiAlertCircle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input pl-10"
                    placeholder="John Smith"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* License ID (only for medical) */}
              {role === "medical" && (
                <div className="mb-4">
                  <label htmlFor="licenseId" className="form-label">
                    Medical License ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBriefcase className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <input
                      id="licenseId"
                      type="text"
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      className="form-input pl-10"
                      placeholder="e.g., MED123456"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="mb-6">
                <label className="form-label">I am a:</label>
                <div className="mt-2 flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="patient"
                      checked={role === "patient"}
                      onChange={() => setRole("patient")}
                      className="form-radio h-4 w-4 text-primary-500"
                      disabled={loading}
                    />
                    <span className="ml-2 text-neutral-700 dark:text-neutral-300">
                      Patient
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="medical"
                      checked={role === "medical"}
                      onChange={() => setRole("medical")}
                      className="form-radio h-4 w-4 text-primary-500"
                      disabled={loading}
                    />
                    <span className="ml-2 text-neutral-700 dark:text-neutral-300">
                      Medical Professional
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-600">
            <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
