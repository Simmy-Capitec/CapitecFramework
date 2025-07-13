import { NextRequest, NextResponse } from 'next/server';
import { db, adoptionApplications, adopters, animals, logActivity } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const applicationQuery = db
      .select({
        applicationId: adoptionApplications.applicationId,
        adopterId: adoptionApplications.adopterId,
        animalId: adoptionApplications.animalId,
        applicationDate: adoptionApplications.applicationDate,
        status: adoptionApplications.status,
        reasonForAdoption: adoptionApplications.reasonForAdoption,
        livingArrangement: adoptionApplications.livingArrangement,
        workSchedule: adoptionApplications.workSchedule,
        previousPetExperience: adoptionApplications.previousPetExperience,
        veterinarianInfo: adoptionApplications.veterinarianInfo,
        references: adoptionApplications.references,
        staffNotes: adoptionApplications.staffNotes,
        createdAt: adoptionApplications.createdAt,
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
      .where(eq(adoptionApplications.applicationId, applicationId));

    const result = await applicationQuery;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
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
    const applicationId = parseInt(id);
    const body = await request.json();

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const result = await db
      .update(adoptionApplications)
      .set({
        status: body.status,
        staffNotes: body.staff_notes,
        homeVisitScheduled: body.home_visit_scheduled,
        homeVisitCompleted: body.home_visit_completed,
        interviewDate: body.interview_date,
        approvalDate: body.approval_date,
        rejectionReason: body.rejection_reason,
        updatedAt: new Date()
      })
      .where(eq(adoptionApplications.applicationId, applicationId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('adoption_applications', applicationId, 'UPDATE', 'Staff', null, null, body, clientIp);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
}