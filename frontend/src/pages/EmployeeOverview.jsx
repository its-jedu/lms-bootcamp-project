import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

export default function ManageEmployees() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddEmployee = async () => {
    if (!email.trim() || !name.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/admin/employees/", {
        email: email.trim(),
        name: name.trim(),
      });

      setGeneratedEmail(response.data.email);
      setGeneratedPassword(response.data.generated_password);
      setSuccessOpen(true);

      // Reset form
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Error adding employee:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "string") {
          alert(errorData);
        } else if (errorData.email) {
          alert(errorData.email);
        } else if (errorData.name) {
          alert(errorData.name);
        } else if (errorData.error) {
          alert(errorData.error);
        } else {
          alert("Failed to add employee");
        }
      } else {
        alert("Failed to add employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const credentials = `Email: ${generatedEmail}\nPassword: ${generatedPassword}`;
    navigator.clipboard.writeText(credentials);
    alert("Credentials copied to clipboard!");
  };

  const handleBackToManage = () => {
    setSuccessOpen(false);
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="flex-1 overflow-auto bg-[#f3f4f6] relative">
      {/* Success modal overlay */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* dim background */}
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setSuccessOpen(false)}
          />

          {/* modal */}
          <div className="relative z-10 w-[420px] max-w-[92vw] rounded-xl bg-white px-8 py-7 shadow-xl">
            {/* close */}
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="absolute right-4 top-4 text-gray-600 hover:text-gray-900 text-sm"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            {/* big check */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-[#0f3d3a] flex items-center justify-center">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-2 text-center">
              <div className="text-gray-900 text-[22px] font-semibold">Password Generated!</div>
              <p className="mt-3 text-gray-600 text-[11px] leading-5">
                Employee has been successfully added.
                <br />
                Provide them with this credentials to log in:
              </p>

              {/* Credentials Display */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div className="text-left">
                  <p className="text-gray-500 text-[10px] font-medium">Email:</p>
                  <p className="text-gray-900 text-[11px] font-semibold">{generatedEmail}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500 text-[10px] font-medium">Password:</p>
                  <p className="text-gray-900 text-[11px] font-semibold">{generatedPassword}</p>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopyCredentials}
                className="mt-4 w-full flex items-center justify-center gap-2 h-9 rounded bg-[#0f3d3a] text-white text-[11px] font-semibold hover:bg-[#0c312f]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copy all credentials
              </button>

              {/* Back to manage link */}
              <button
                onClick={handleBackToManage}
                className="mt-3 text-gray-600 hover:text-gray-900 text-[11px] font-medium underline underline-offset-2"
              >
                Back to manage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center panel */}
      <div className="px-8 pb-10 pt-8">
        <div className="mx-auto w-full max-w-2xl bg-white border border-gray-200 rounded-md">
          <div className="px-10 pt-8 pb-8">
            <h1 className="text-[18px] font-semibold text-gray-900">
              Manage Employee
            </h1>
            <p className="mt-1 text-[12px] text-gray-600">
              Add a Employee to join so you can assign them course and track their progress
            </p>

            {/* Email field */}
            <div className="mt-6">
              <label className="block text-[12px] font-medium text-gray-700 mb-2">
                Email Address of the Employee
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full px-4 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600/40"
              />
            </div>

            {/* Name field */}
            <div className="mt-4">
              <label className="block text-[12px] font-medium text-gray-700 mb-2">
                Name of the Employee
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full px-4 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600/40"
              />
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCancel}
                className="h-9 px-6 rounded border border-gray-300 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={loading}
                className="h-9 px-6 rounded bg-[#0f3d3a] text-white text-[12px] font-medium hover:bg-[#0c312f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}