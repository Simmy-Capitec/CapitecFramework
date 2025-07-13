import { NextRequest, NextResponse } from 'next/server';
import { db, adopters, adoptionApplications, logActivity } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adopterId = parseInt(id);

    if (isNaN(adopterId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid adopter ID' },
        { status: 400 }
      );
    }

    const adopterResult = await db
      .select()
      .from(adopters)
      .where(and(eq(adopters.adopterId, adopterId), eq(adopters.isActive, true)));

    if (adopterResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Adopter not found' },
        { status: 404 }
      );
    }

    const applications = await db
      .select()
      .from(adoptionApplications)
      .where(eq(adoptionApplications.adopterId, adopterId));

    return NextResponse.json({
      success: true,
      data: { ...adopterResult[0], applications }
    });
  } catch (error) {
    console.error('Error fetching adopter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch adopter' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adopterId = parseInt(id);
    const body = await request.json();

    if (isNaN(adopterId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid adopter ID' },
        { status: 400 }
      );
    }

    const result = await db
      .update(adopters)
      .set({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        phoneNumber: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zip_code,
        housingType: body.housing_type,
        hasYard: body.yard_fenced,
        currentPets: body.other_pets,
        experienceDetails: body.experience_level,
        references: body.references,
        updatedAt: new Date()
      })
      .where(and(eq(adopters.adopterId, adopterId), eq(adopters.isActive, true)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Adopter not found' },
        { status: 404 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('adopters', adopterId, 'UPDATE', 'Staff', null, null, body, clientIp);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Adopter updated successfully'
    });
  } catch (error) {
    console.error('Error updating adopter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update adopter' },
      { status: 500 }
    );
  }
}