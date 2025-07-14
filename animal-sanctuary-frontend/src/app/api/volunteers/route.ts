import { NextRequest, NextResponse } from 'next/server';
import { db, volunteers, logActivity } from '@/lib/db';
import { and, eq, sql, count, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isActive = searchParams.get('active') !== 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereConditions = [eq(volunteers.isActive, isActive)];

    if (search) {
      whereConditions.push(
        sql`(${volunteers.firstName} ILIKE ${`%${search}%`} OR ${volunteers.lastName} ILIKE ${`%${search}%`} OR ${volunteers.email} ILIKE ${`%${search}%`})`
      );
    }

    const offset = (page - 1) * limit;

    const volunteersResult = await db
      .select()
      .from(volunteers)
      .where(and(...whereConditions))
      .orderBy(asc(volunteers.firstName))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(volunteers)
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      data: volunteersResult,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch volunteers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [createdVolunteer] = await db
      .insert(volunteers)
      .values({
        firstName: first_name,
        lastName: last_name,
        email,
        phone: phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zip_code,
        dateOfBirth: body.date_of_birth,
        emergencyContact: body.emergency_contact,
        emergencyPhone: body.emergency_phone,
        availability: body.availability,
        skills: body.skills,
        interests: body.interests,
        backgroundCheck: body.background_check || false,
        orientation: body.orientation || false
      })
      .returning();

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('volunteers', createdVolunteer.volunteerId, 'INSERT', 'Public', null, null, body, clientIp);

    return NextResponse.json({
      success: true,
      data: createdVolunteer,
      message: 'Volunteer application submitted successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating volunteer:', error);
    
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Email address already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create volunteer' },
      { status: 500 }
    );
  }
}