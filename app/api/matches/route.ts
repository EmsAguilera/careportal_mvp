import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const patientId = searchParams.get('id');
  
      if (!patientId) {
        return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
      }
  
      // Get the patient with facility details
      const patient = await db.patient.findUnique({
        where: { id: String(patientId) },
        include: { facility: true }, // Fetch the related facility
      });
  
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
  
      // Check if the patient was matched with a facility
      if (!patient.facilityId || !patient.facility) {
        return NextResponse.json({ facilityName: null, message: 'No facility matched your criteria' });
      }
  
      return NextResponse.json({ facilityName: patient.facility.name });
    } catch (error) {
      console.error('Error fetching facility:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }