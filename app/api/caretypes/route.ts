import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const careTypes = await db.careType.findMany({
        
    });
    return NextResponse.json(careTypes);
  } catch (error) {
    console.error("Error fetching care types:", error);
    return NextResponse.json({ error: "Failed to load care types" }, { status: 500 });
  }
}
