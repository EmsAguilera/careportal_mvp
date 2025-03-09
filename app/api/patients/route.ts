import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const patientSchema = z.object({
    name: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    zipCode: z.number().int().refine((val) => val.toString().length === 5, {
      message: "Zip Code must be exactly 5 digits.",
    }),
    careTypeId: z.number().int().positive("Invalid type of care."),
  });

export async function GET() {
    try {
        const patients = await db.facility.findMany({
            orderBy: { id: 'desc' },
        });

        return NextResponse.json({ patients });
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // exception for Day Care
        if(body.careTypeId === 4) body.zipCode = 99999;
        

        if (!body.name || !body.lastName || (!body.zipCode && body.careTypeId === 4) || !body.careTypeId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const validatedData = patientSchema.parse(body);

        let status= false;
        let success = false;
        let message = "";
        let matchedFacility = null;

        if(validatedData.careTypeId !== 4){
            const facilities = await db.facility.findMany();

            const matchingFacilities = facilities.filter(facility =>
                (facility.careTypeId === validatedData.careTypeId || facility.careTypeId === 3) &&
                validatedData.zipCode >= facility.servesCodeMin &&
                validatedData.zipCode <= facility.servesCodeMax
              );

            if (matchingFacilities.length === 0) status = false;
            matchingFacilities.sort((a, b) => Math.abs(a.zipCode - validatedData.zipCode) - Math.abs(b.zipCode - validatedData.zipCode));
            
            for (const facility of matchingFacilities) {
                if (facility.capacity) {
                    if (Math.abs(validatedData.zipCode - facility.zipCode) <= 3000) {
                        status= true;
                        matchedFacility= facility.id;
                        success = true;
                        message = 'Matching facility found! with Facility: ' + facility.name;
                        break;
                    }
                }
            }
        } else {
            validatedData.zipCode = 0;
        }

        if (!status) {
            message = "No matching facility found.";
        }

        const newPatient = await db.patient.create({
            data: { 
                name: validatedData.name, 
                lastName: validatedData.lastName, 
                zipCode: validatedData.zipCode, 
                careTypeId: validatedData.careTypeId, 
                matchStatus: status,
                facilityId: matchedFacility,
            },
        });
        
        return NextResponse.json({
            success: success,
            message: message,
            patient: newPatient,
        });
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
          }
        console.error('Error processing patient:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}