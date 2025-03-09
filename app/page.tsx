"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-sky-500 via-violet-600 to-fuchsia-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md h-[550px] flex flex-col">
        <Image src="/CareMatesLogo.png" alt="CareMates Logo" className="mx-auto mb-6" width={240} height={100} priority />
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to CarePortal MVP</h1>
        <p className="text-gray-600 mb-6">
          This portal allows patients to register and find the best care facility based on their location
          and needs. Click the button below to get started.
        </p>

        {/* Buttons */}
        <div className="mt-auto flex justify-between">
          <button
              onClick={() => router.push("/patients")}
              className="bg-indigo-500 text-white px-4 py-2 rounded shadow-lg w-full shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300"
            >
              Start
            </button>
        </div>
      </div>
    </div>
  );
}
