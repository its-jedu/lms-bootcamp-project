
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManageEmployees() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================
  // 4. EVENT HANDLERS (after state declarations)
  // ============================================
  const handleAddEmployee = () => {
    if (!email.trim() || !name.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSuccessMessage(`Employee ${name} has been successfully added`);
    setSuccessOpen(true);

    // Reset form
    setEmail("");
    setName("");
  };

  const handleCancel = () => navigate(-1);

  // ============================================
  // 5. RETURN JSX (at the bottom)
  // ============================================
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
          <div className="relative z-10 w-[420px] max-w-[92vw] rounded-xl bg-[#0f3d3a] px-8 py-7 shadow-xl">
            {/* close */}
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="absolute right-4 top-4 text-white/80 hover:text-white text-sm"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            {/* big check */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-transparent flex items-center justify-center">
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
              <div className="text-white text-[22px] font-semibold">Success!</div>
              <p className="mt-2 text-white/85 text-[11px] leading-4">
                {successMessage}
              </p>
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
                className="h-9 px-6 rounded bg-[#0f3d3a] text-white text-[12px] font-medium hover:bg-[#0c312f]"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}