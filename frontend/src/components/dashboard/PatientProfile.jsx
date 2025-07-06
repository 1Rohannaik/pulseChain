import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";

function PatientProfile() {
  const { profile, updateProfile, loading, error } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    bloodType: "",
    allergies: "",
    medications: "",
    conditions: "",
    emergencyContacts: [],
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.name || "",
        age: profile.age || "",
        bloodType: profile.bloodType || "",
        allergies: Array.isArray(profile.allergies)
          ? profile.allergies.join(", ")
          : "",
        medications: Array.isArray(profile.medications)
          ? profile.medications.join(", ")
          : "",
        conditions: Array.isArray(profile.conditions)
          ? profile.conditions.join(", ")
          : "",
        emergencyContacts: Array.isArray(profile.emergencyContacts)
          ? [...profile.emergencyContacts]
          : [],
      });
    }
  }, [profile]);

  const handleEdit = () => {
    if (!profile) return;

    setFormData({
      fullName: profile.name || "",
      age: profile.age || "",
      bloodType: profile.bloodType || "",
      allergies: Array.isArray(profile.allergies)
        ? profile.allergies.join(", ")
        : "",
      medications: Array.isArray(profile.medications)
        ? profile.medications.join(", ")
        : "",
      conditions: Array.isArray(profile.conditions)
        ? profile.conditions.join(", ")
        : "",
      emergencyContacts: Array.isArray(profile.emergencyContacts)
        ? [...profile.emergencyContacts]
        : [],
    });
    setIsEditing(true);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData({ ...formData, emergencyContacts: updatedContacts });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      emergencyContacts: [
        ...formData.emergencyContacts,
        { name: "", relationship: "", phone: "" },
      ],
    });
  };

  const removeContact = (index) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts.splice(index, 1);
    setFormData({ ...formData, emergencyContacts: updatedContacts });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setFormError("Full name is required.");
      return false;
    }
    if (
      formData.age &&
      (isNaN(formData.age) || formData.age < 0 || formData.age > 150)
    ) {
      setFormError("Please enter a valid age (0-150).");
      return false;
    }
    for (const contact of formData.emergencyContacts) {
      if (!contact.name.trim() || !contact.phone.trim()) {
        setFormError(
          "All emergency contacts must have a name and phone number."
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validateForm()) {
      return;
    }

    const updatedProfile = {
      fullName: formData.fullName.trim(),
      age: formData.age ? parseInt(formData.age, 10) : "",
      bloodType: formData.bloodType,
      allergies: formData.allergies
        ? formData.allergies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      medications: formData.medications
        ? formData.medications
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      conditions: formData.conditions
        ? formData.conditions
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      emergencyContacts: formData.emergencyContacts,
    };

    try {
      await updateProfile(updatedProfile);
      setFormSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setFormError(
        err.message || "Failed to update profile. Please try again."
      );
    }
  };

  // Display loading state
  if (loading || !profile) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mb-3"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-3"></div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow">
        <p className="text-danger-600 dark:text-danger-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md">
      <div className="p-6">
        {formError && (
          <div className="mb-4 p-3 bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200 rounded">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 p-3 bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 rounded">
            {formSuccess}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            Personal Information
          </h3>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <FiEdit2 className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="form-label">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="150"
                />
              </div>

              <div>
                <label htmlFor="bloodType" className="form-label">
                  Blood Type
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="allergies" className="form-label">
                Allergies (separated by commas)
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="form-input"
                placeholder="Penicillin, Peanuts, etc."
              />
            </div>

            <div>
              <label htmlFor="medications" className="form-label">
                Medications (separated by commas)
              </label>
              <input
                type="text"
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                className="form-input"
                placeholder="Lisinopril, Metformin, etc."
              />
            </div>

            <div>
              <label htmlFor="conditions" className="form-label">
                Medical Conditions (separated by commas)
              </label>
              <input
                type="text"
                id="conditions"
                name="conditions"
                value={formData.conditions}
                onChange={handleChange}
                className="form-input"
                placeholder="Hypertension, Diabetes, etc."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Emergency Contacts</label>
                <button
                  type="button"
                  onClick={addContact}
                  className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  + Add Contact
                </button>
              </div>

              {formData.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg mb-3"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Contact #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-sm text-danger-500 hover:text-danger-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="form-label text-xs">Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) =>
                          handleContactChange(index, "name", e.target.value)
                        }
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="form-label text-xs">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={contact.relationship}
                          onChange={(e) =>
                            handleContactChange(
                              index,
                              "relationship",
                              e.target.value
                            )
                          }
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label text-xs">Phone</label>
                        <input
                          type="text"
                          value={contact.phone}
                          onChange={(e) =>
                            handleContactChange(index, "phone", e.target.value)
                          }
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <FiSave className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Name
              </h4>
              <p className="text-neutral-900 dark:text-white">
                {profile?.name || "Not specified"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Age
                </h4>
                <p className="text-neutral-900 dark:text-white">
                  {profile?.age || "Not specified"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Blood Type
                </h4>
                <p className="text-danger-600 dark:text-danger-400 font-semibold">
                  {profile?.bloodType || "Not specified"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Allergies
              </h4>
              {profile?.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-700 dark:text-neutral-300">
                  No allergies specified
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Medications
              </h4>
              {profile?.medications?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.medications.map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {medication}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-700 dark:text-neutral-300">
                  No medications specified
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Medical Conditions
              </h4>
              {profile?.conditions?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-700 dark:text-neutral-300">
                  No medical conditions specified
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Emergency Contacts
              </h4>
              {profile?.emergencyContacts?.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {profile.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded"
                    >
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {contact?.name || "Unnamed contact"}
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {contact?.relationship || "No relationship specified"}
                        </span>
                        <span className="text-sm text-primary-600 dark:text-primary-400">
                          {contact?.phone || "No phone specified"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-700 dark:text-neutral-300">
                  No emergency contacts specified
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientProfile;
