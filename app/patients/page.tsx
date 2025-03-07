"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { log } from "console";

interface CareType {
  id: string;
  name: string;
}

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipCode, setZipCode] = useState<number | "">("");
  const [careTypeId, setCareTypeId] = useState<number | "">("");
  const [careTypes, setCareTypes] = useState<CareType[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<{ name?: string; lastName?: string; zipCode?: string; careTypeId?: string }>({});
  const router = useRouter();

  // Fetch care types on component mount
  useEffect(() => {
    const fetchCareTypes = async () => {
      try {
        const response = await fetch("/api/caretypes");
        const data = await response.json();
        setCareTypes(data);
      } catch (error) {
        console.error("Failed to load care types", error);
      }
    };
    fetchCareTypes();
  }, []);

  const stepTitles = ["Personal Info", "Type of Care", "Address"];

  const validateStep1 = () => {
    let errors: any = {};
    if (!name.trim()) errors.name = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    let errors: any = {};
    if (!careTypeId) errors.careTypeId = "Please select a type of care";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    let errors: any = {};
    if (!zipCode) errors.zipCode = "Zipcode is required";
    else if (zipCode.toString().length !== 5 || isNaN(Number(zipCode))) errors.zipCode = "Zipcode must be exactly 5 digits";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) handleSubmit();
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastName, zipCode: Number(zipCode), careTypeId: Number(careTypeId) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      
      
      router.push(`/matches?id=${encodeURIComponent(data.patient.id)}`);
      
    } catch (error) {
      setMessage("Error submitting form");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-sky-500 via-violet-600 to-fuchsia-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md h-[550px] flex flex-col">
        {/* Image above the steps */}
        <img src="/CareMatesLogo.png" alt="CareMates Logo" className="w-60 mx-auto mb-6" />

        {/* Progress Steps */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((num, index) => (
            <div key={num} className="flex flex-col items-center">
              <div key={num} className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm ${
                step >= num ? "bg-purple-600" : "bg-gray-300"
              }`}>
                {num}
              </div>
              <p className={`text-sm mt-1 ${step >= num ? "text-purple-600" : "text-gray-400"}`}>
                {stepTitles[index]}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Registration</h2>

        {/* Form Content */}
        {step === 1 && (
          <div>
            <label className="block mb-2 text-gray-700">First Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <label className="block mt-4 mb-2 text-gray-700">Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block mb-2 text-gray-700">Select a type of care:</label>
            <select
              value={careTypeId}
              onChange={(e) => setCareTypeId(Number(e.target.value) || "")}
              className="w-full p-3 bg-gray-100 border rounded-2xl"
            >
              <option value="">Select</option>
              {careTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.careTypeId && <p className="text-red-500 text-sm">{errors.careTypeId}</p>}
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block mb-2 text-gray-700">Zip Code:</label>
            <input
              type="number"
              value={zipCode}
              onChange={(e) => setZipCode(Number(e.target.value) || "")}
              className="w-full p-2 border rounded"
            />
            {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
          </div>
        )}

        {/* Buttons */}
        <div className={`mt-auto flex ${step === 1 ? "justify-end" : "justify-between"}`}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="bg-gray-400 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-500 transition duration-300">
              Back
            </button>
          )}

          {step < 3 && (
            <button onClick={handleNext} className="bg-purple-600 text-white px-4 py-2 rounded shadow-lg hover:bg-purple-800 transition duration-300">
              Next
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleNext}
              className="bg-indigo-500 text-white px-4 py-2 rounded shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
