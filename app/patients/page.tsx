async function getPatients() {
    const res = await fetch('http://localhost:3000/api/patients', { cache: 'no-store' });
    const data = await res.json();
    return data.patients;
}

export default async function PatientsPage() {
    const patients = await getPatients();

    return (
        <div>
            <h1>Patients</h1>
            <ul>
                {patients.map((patient: any) => (
                    <li key={patient.id}>
                        {patient.name} - {patient.zipCode}
                    </li>
                ))}
            </ul>
        </div>
    );
}
