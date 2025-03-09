"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function MatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patientId = searchParams.get('id');

  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [isMatched, setIsMatched] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [patientLastName, setLastName] = useState<string | null>(null);
  const [patientZipCode, setPatientZipCode] = useState<string | null>(null);
  const [careTypeId, setCareTypeId] = useState<number | null>(null);
  const [facilityZipCode, setFacilityZipCode] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchFacility = async () => {
      try {
        const response = await fetch(`/api/matches?id=${patientId}`);
        const data = await response.json();

        setLastName(data.patient.lastName);
        setPatientZipCode(data.patient.zipCode);
        setCareTypeId(data.patient.careTypeId);
        
        if (data.facilityName) {
          setIsMatched(true);
          setFacilityName(data.facilityName);
          setFacilityZipCode(data.patient.facility.zipCode);
        } else {
          setIsMatched(false);
        }
      } catch (error) {
        console.error('Error fetching facility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [patientId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-sky-500 via-violet-600 to-fuchsia-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md h-[550px] flex flex-col">
        <Image src="/CareMatesLogo.png" alt="CareMates Logo" className="mx-auto mb-6" width={240} height={100} priority />
        
        {loading ? (
          <div className="mt-4 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-lg text-gray-500">Checking for matches...</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              {isMatched ? "Care Facility Found!" : "No Care Facility Found"}
            </h1>
            <p className="text-gray-600 mb-6">
              {isMatched && (
                `We have good news for you Mr/Ms. ${patientLastName}. You have been matched with care facility ${facilityName} at location ${facilityZipCode}.`
              )}

              {!isMatched && careTypeId !== 4 && (
                `Unfortunately, we couldn't find a matching care facility for you Mr/Ms. ${patientLastName}. The available care facilities either do not cover your area or are far from your location: ${patientZipCode}.`
              )}

              {!isMatched && careTypeId === 4 && (
                `Unfortunately, the current facilities do not provide Day Care and we couldn't find a matching care facility for you ${patientLastName}.`
              )}
            </p>
          </div>
        )}
        {!loading && (
        <div className="mt-auto justify-between">
          <button
            onClick={() => router.push("/patients")}
            className="bg-gray-400 text-white mb-2 px-4 py-2 w-full rounded hover:bg-gray-500 transition duration-300"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-purple-600 text-white mt-2 mb-2 px-4 py-2 w-full rounded hover:bg-purple-700 transition duration-300"
          >
            Home
          </button>
        </div>
        )}
        
      </div>
    </div>
  );
}

export default function Matches() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
