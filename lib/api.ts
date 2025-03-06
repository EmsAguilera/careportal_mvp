// lib/api.ts
import { headers } from 'next/headers';

const getBaseUrl = async () => {
    if (typeof window !== 'undefined') {
        return ''; // In client-side code, use relative URLs
    }

    const headersList = await headers(); // ✅ Await this
    const host = headersList.get('host'); // Now you can use .get()
    
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${host}`;
};

// Fetch all patients
export async function getPatients() {
    const res = await fetch(`${getBaseUrl()}/api/patients`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
}

// Fetch a single patient by ID
// export async function getPatientById(id: string) {
//     const res = await fetch(`${getBaseUrl()}/api/patients/${id}`, { cache: 'no-store' });
//     if (!res.ok) throw new Error('Failed to fetch patient');
//     return res.json();
// }

// Create a new patient
export async function createPatient(data: { name: string; zipCode: string }) {
    const res = await fetch(`${getBaseUrl()}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
}
