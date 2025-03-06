import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
    try {
        const { name, lastName, zipCode, careTypeId } = await req.json();

        if (!name || !lastName || !zipCode || !careTypeId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        let status= false;
        let success = false;
        let message = "";

        if(careTypeId !== 4){
            const facilities = await db.facility.findMany({
                where: { 
                    OR: [
                        {careTypeId},
                        {careTypeId: 3},
                    ],
                    AND:[
                        {capacity: true},
                    ],
                },
            });
            
            for( const facility of facilities ){
                if(zipCode <= facility.servesCodeMax && zipCode >= facility.servesCodeMin){
                    if(Math.abs(zipCode - facility.zipCode) <= 3000){
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
                name: name, 
                lastName: lastName, 
                zipCode: zipCode, 
                careTypeId: careTypeId, 
                matchStatus: status 
            },
        });
        return NextResponse.json({
            success: success,
            message: message,
            patient: newPatient,
        });
        
    } catch (error) {
        console.error('Error processing patient:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}