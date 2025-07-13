import { NextRequest, NextResponse } from 'next/server';
import { db, adopters, logActivity } from '@/lib/db';
import { and, eq, sql, count, desc, asc, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereConditions = [eq(adopters.isActive, true)];

    if (search) {
      whereConditions.push(
        sql`(${adopters.firstName} ILIKE ${`%${search}%`} OR ${adopters.lastName} ILIKE ${`%${search}%`} OR ${adopters.email} ILIKE ${`%${search}%`})`
      );
    }

    const offset = (page - 1) * limit;

    const adoptersResult = await db
      .select()
      .from(adopters)
      .where(and(...whereConditions))
      .orderBy(asc(adopters.firstName))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(adopters)
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      data: adoptersResult,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching adopters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch adopters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone } = body;

    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [createdAdopter] = await db
      .insert(adopters)
      .values({
        firstName: first_name,
        lastName: last_name,
        email,
        phoneNumber: phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zip_code,
        housingType: body.housing_type,
        hasYard: body.yard_fenced,
        currentPets: body.other_pets,
        experienceDetails: body.experience_level,
        references: body.references
      })
      .returning();

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('adopters', createdAdopter.adopterId, 'INSERT', 'Staff', null, null, body, clientIp);

    return NextResponse.json({
      success: true,
      data: createdAdopter,
      message: 'Adopter created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating adopter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create adopter' },
      { status: 500 }
    );
  }
}