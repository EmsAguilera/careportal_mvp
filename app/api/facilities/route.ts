import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const facilities = await db.facility.findMany({
            orderBy: { id: 'desc' },
        });

        return NextResponse.json({ facilities });
    } catch (error) {
        console.error("Error fetching facilities:", error);
        return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
    }
}