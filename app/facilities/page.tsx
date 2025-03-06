async function getFacilities() {
    const res = await fetch('/api/facilities', { cache: 'no-store' });
    const data = await res.json();
    return data.facilities;
}

export default async function FacilitiesPage() {
    const facilities = await getFacilities();

    return (
        <div>
            <h1>Patients</h1>
            <ul>
                {facilities.map((facility: any) => (
                    <li key={facility.id}>
                        {facility.name} - {facility.zipCode}
                    </li>
                ))}
            </ul>
        </div>
    );
}
