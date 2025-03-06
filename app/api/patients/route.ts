import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ✅ GET: Fetch all patients
export async function GET() {
    try {
        const patients = await db.facility.findMany({
            orderBy: { id: 'desc' },
        });

        return NextResponse.json({ patients });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}