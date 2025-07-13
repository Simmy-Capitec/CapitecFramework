import { NextRequest, NextResponse } from 'next/server';
import { db, animals, habitats, medicalRecords, adoptionApplications, logActivity } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid animal ID' },
        { status: 400 }
      );
    }

    const animalQuery = db
      .select({
        animalId: animals.animalId,
        name: animals.name,
        species: animals.species,
        breed: animals.breed,
        age: animals.age,
        weightKg: animals.weightKg,
        gender: animals.gender,
        color: animals.color,
        arrivalDate: animals.arrivalDate,
        adoptionStatus: animals.adoptionStatus,
        adoptionFee: animals.adoptionFee,
        dietaryRequirements: animals.dietaryRequirements,
        behavioralNotes: animals.behavioralNotes,
        specialNeeds: animals.specialNeeds,
        microchipNumber: animals.microchipNumber,
        photos: animals.photos,
        habitatName: habitats.habitatName,
        habitatType: habitats.habitatType,
        daysInSanctuary: sql<number>`CURRENT_DATE - ${animals.arrivalDate}`,
        createdAt: animals.createdAt,
        updatedAt: animals.updatedAt
      })
      .from(animals)
      .leftJoin(habitats, eq(animals.habitatId, habitats.habitatId))
      .where(and(eq(animals.animalId, animalId), eq(animals.isActive, true)));

    const result = await animalQuery;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Get medical records count
    const [{ count: medicalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(medicalRecords)
      .where(eq(medicalRecords.animalId, animalId));

    // Get applications count
    const [{ count: applicationCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adoptionApplications)
      .where(eq(adoptionApplications.animalId, animalId));

    const animal = {
      ...result[0],
      medicalRecordsCount: medicalCount,
      applicationCount: applicationCount
    };

    return NextResponse.json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch animal' },
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
    const animalId = parseInt(id);
    const body = await request.json();

    if (isNaN(animalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid animal ID' },
        { status: 400 }
      );
    }

    const result = await db
      .update(animals)
      .set({
        name: body.name,
        species: body.species,
        breed: body.breed,
        age: body.age,
        weightKg: body.weight_kg?.toString(),
        gender: body.gender,
        color: body.color,
        adoptionStatus: body.adoption_status,
        adoptionFee: body.adoption_fee?.toString(),
        habitatId: body.habitat_id,
        dietaryRequirements: body.dietary_requirements,
        behavioralNotes: body.behavioral_notes,
        specialNeeds: body.special_needs,
        microchipNumber: body.microchip_number,
        photos: body.photos,
        updatedAt: new Date()
      })
      .where(and(eq(animals.animalId, animalId), eq(animals.isActive, true)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('animals', animalId, 'UPDATE', 'Staff', null, null, body, clientIp);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Animal updated successfully'
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update animal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid animal ID' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const result = await db
      .update(animals)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(animals.animalId, animalId), eq(animals.isActive, true)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('animals', animalId, 'DELETE', 'Staff', null, null, {}, clientIp);

    return NextResponse.json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete animal' },
      { status: 500 }
    );
  }
}