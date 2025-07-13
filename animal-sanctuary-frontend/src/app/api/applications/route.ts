import { NextRequest, NextResponse } from 'next/server';
import { db, adoptionApplications, adopters, animals, logActivity } from '@/lib/db';
import { and, eq, sql, count, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adopterId = searchParams.get('adopter_id');
    const animalId = searchParams.get('animal_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereConditions: any[] = [];

    if (status) {
      whereConditions.push(eq(adoptionApplications.status, status as any));
    }
    if (adopterId) {
      whereConditions.push(eq(adoptionApplications.adopterId, parseInt(adopterId)));
    }
    if (animalId) {
      whereConditions.push(eq(adoptionApplications.animalId, parseInt(animalId)));
    }

    const offset = (page - 1) * limit;

    const applicationsQuery = db
      .select({
        applicationId: adoptionApplications.applicationId,
        adopterId: adoptionApplications.adopterId,
        animalId: adoptionApplications.animalId,
        applicationDate: adoptionApplications.applicationDate,
        status: adoptionApplications.status,
        reasonForAdoption: adoptionApplications.reasonForAdoption,
        adopterFirstName: adopters.firstName,
        adopterLastName: adopters.lastName,
        adopterEmail: adopters.email,
        animalName: animals.name,
        animalSpecies: animals.species,
        animalBreed: animals.breed
      })
      .from(adoptionApplications)
      .leftJoin(adopters, eq(adoptionApplications.adopterId, adopters.adopterId))
      .leftJoin(animals, eq(adoptionApplications.animalId, animals.animalId))
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(desc(adoptionApplications.applicationDate))
      .limit(limit)
      .offset(offset);

    const applicationsResult = await applicationsQuery;

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(adoptionApplications)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    return NextResponse.json({
      success: true,
      data: applicationsResult,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adopter_id, animal_id, reason_for_adoption } = body;

    if (!adopter_id || !animal_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: adopter_id and animal_id' },
        { status: 400 }
      );
    }

    const [createdApplication] = await db
      .insert(adoptionApplications)
      .values({
        adopterId: adopter_id,
        animalId: animal_id,
        applicationDate: new Date().toISOString().split('T')[0],
        reasonForAdoption: reason_for_adoption,
        livingArrangement: body.living_arrangement,
        workSchedule: body.work_schedule,
        previousPetExperience: body.previous_pet_experience,
        veterinarianInfo: body.veterinarian_info,
        references: body.references
      })
      .returning();

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('adoption_applications', createdApplication.applicationId, 'INSERT', 'Public', null, null, body, clientIp);

    return NextResponse.json({
      success: true,
      data: createdApplication,
      message: 'Application submitted successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    );
  }
}