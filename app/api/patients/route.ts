import { db } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

const patientSchema = z.object({
    name: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    zipCode: z.number().int().refine((val) => val.toString().length === 5, {
      message: "Zipcode must be exactly 5 digits",
    }),
    careTypeId: z.number().int().positive("Invalid care type"),
  });

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.name || !body.lastName || !body.zipCode || !body.careTypeId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // ✅ Validate request data using Zod
        const validatedData = patientSchema.parse(body);

        let status= false;
        let success = false;
        let message = "";

        if(validatedData.careTypeId !== 4){
            const facilities = await db.facility.findMany({
                where: { 
                    OR: [
                        {careTypeId: validatedData.careTypeId},
                        {careTypeId: 3},
                    ],
                    AND:[
                        {capacity: true},
                    ],
                },
            });
            
            for( const facility of facilities ){
                if(validatedData.zipCode <= facility.servesCodeMax && validatedData.zipCode >= facility.servesCodeMin){
                    if(Math.abs(validatedData.zipCode - facility.zipCode) <= 3000){
                        status= true;
                        success = true;
                        message = 'Matching facility found! with Facility: ' + facility.name;
                        break;
                    }
                }
                status= false;
                success = false;
                message = "No matching facility found.";
            }
            console.log(facilities);
        }else{
            status= false;
            success = false;
            message = "No matching facility found.";
        }

        const newPatient = await db.patient.create({
            data: { 
                name: validatedData.name, 
                lastName: validatedData.lastName, 
                zipCode: validatedData.zipCode, 
                careTypeId: validatedData.careTypeId, 
                matchStatus: status 
            },
        });
        return NextResponse.json({
            success: success,
            message: message,
            patient: newPatient,
        });
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            // ❌ Return validation errors
            return NextResponse.json({ errors: error.errors }, { status: 400 });
          }
        console.error('Error processing patient:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}