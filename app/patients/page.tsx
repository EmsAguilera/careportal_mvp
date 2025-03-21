"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CareType {
  id: string;
  name: string;
}

type ValidationErrors = {
  name?: string;
  lastName?: string;
  zipCode?: string;
  careTypeId?: string;
};

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipCode, setZipCode] = useState<number | "">("");
  const [careTypeId, setCareTypeId] = useState<number | "">("");
  const [careTypes, setCareTypes] = useState<CareType[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; lastName?: string; zipCode?: string; careTypeId?: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchCareTypes = async () => {
      try {
        const response = await fetch("/api/caretypes");
        if (!response.ok) {
          throw new Error("Failed to fetch care types");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCareTypes(data);
        } else {
          console.error("Invalid data format:", data);
          setCareTypes([]);
        }
      } catch (error) {
        console.error("Failed to load care types", error);
        setCareTypes([]);
      }
    };
    fetchCareTypes();
  }, []);

  const stepTitles = ["Personal Info", "Type of Care", "Address"];

  const validateStep1 = () => {
    const errors: ValidationErrors = {};
    if (!name.trim()) errors.name = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: ValidationErrors = {};
    if (!careTypeId) errors.careTypeId = "Please select a type of care";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    if (careTypeId === 4) return true;
    const errors: ValidationErrors = {};
    if (!zipCode) errors.zipCode = "Zip Code is required";
    else if (zipCode.toString().length !== 5 || isNaN(Number(zipCode))) errors.zipCode = "Zipcode must be exactly 5 digits";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) {
      if (careTypeId === 4){
        handleSubmit();
      } else {
        setStep(3);
      }
    }
    if (step === 3 && validateStep3()) handleSubmit();
  };

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
      router.push(`/matches?id=${encodeURIComponent(data.patient.id)}`);
      
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-sky-500 via-violet-600 to-fuchsia-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md h-[550px] flex flex-col">
        <Image src="/CareMatesLogo.png" alt="CareMates Logo" className="mx-auto mb-6" width={240} height={100} priority />

        {/* Steps */}
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

        <h2 className="text-xl font-semibold mb-4 text-gray-900 appearance-none">Registration</h2>

        {/* Form Content */}
        {step === 1 && (
          <div>
            <label className="block mb-2 text-gray-700">First Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 appearance-none"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <label className="block mt-4 mb-2 text-gray-700">Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 appearance-none"
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
              className="w-full p-3 bg-gray-100 border rounded-2xl text-gray-900 appearance-none"
            >
              <option value="">Select</option>
              {Array.isArray(careTypes) && careTypes.map((type) => (
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
              className="w-full p-2 border rounded text-gray-900 appearance-none"
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

          {step === 2 && careTypeId === 4 ? (
             <button
              onClick={handleNext}
              className="bg-indigo-500 text-white px-4 py-2 rounded shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          ) : (
            step < 3 && (
              <button onClick={handleNext} className="bg-purple-600 text-white px-4 py-2 rounded shadow-lg hover:bg-purple-800 transition duration-300">
                Next
              </button>
            )
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
