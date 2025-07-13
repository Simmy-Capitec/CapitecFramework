import { NextRequest, NextResponse } from 'next/server';
import { db, animals, habitats, medicalRecords, adoptionApplications, logActivity } from '@/lib/db';
import { and, eq, sql, count, desc, asc } from 'drizzle-orm';
import cors from 'cors';

// ===================================================================
// CORS CONFIGURATION
// ===================================================================

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// ===================================================================
// ANIMALS API ENDPOINTS
// ===================================================================

/**
 * GET /api/animals
 * Retrieve all animals with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const species = searchParams.get('species');
    const habitat = searchParams.get('habitat');
    const availableOnly = searchParams.get('available_only') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';

    // Build WHERE conditions dynamically
    const whereConditions = [eq(animals.isActive, true)];

    if (status) {
      whereConditions.push(eq(animals.adoptionStatus, status as any));
    }

    if (species) {
      whereConditions.push(eq(animals.species, species));
    }

    if (habitat) {
      whereConditions.push(eq(animals.habitatId, parseInt(habitat)));
    }

    if (availableOnly) {
      whereConditions.push(eq(animals.adoptionStatus, 'Available'));
    }

    // Pagination
    const offset = (page - 1) * limit;
    const validSortFields = ['name', 'species', 'age', 'arrivalDate', 'adoptionStatus'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order.toLowerCase() === 'desc' ? desc : asc;

    // Main query with joins and subqueries
    const animalsQuery = db
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
        photos: animals.photos,
        habitatName: habitats.habitatName,
        habitatType: habitats.habitatType,
        // Calculate days in sanctuary using PostgreSQL date functions
        daysInSanctuary: sql<number>`CURRENT_DATE - ${animals.arrivalDate}`,
        medicalRecordsCount: sql<number>`(SELECT COUNT(*) FROM ${medicalRecords} WHERE ${medicalRecords.animalId} = ${animals.animalId})`,
        applicationCount: sql<number>`(SELECT COUNT(*) FROM ${adoptionApplications} WHERE ${adoptionApplications.animalId} = ${animals.animalId} AND ${adoptionApplications.status} != 'Rejected')`
      })
      .from(animals)
      .leftJoin(habitats, eq(animals.habitatId, habitats.habitatId))
      .where(and(...whereConditions))
      .orderBy(sortOrder(animals[sortField as keyof typeof animals]))
      .limit(limit)
      .offset(offset);

    const animalsResult = await animalsQuery;

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: count() })
      .from(animals)
      .where(and(...whereConditions));
    
    const [{ count: total }] = await totalCountQuery;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: animalsResult,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: total,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage
      },
      filters_applied: {
        status,
        species,
        habitat,
        available_only: availableOnly
      }
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch animals',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/animals
 * Create a new animal record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      species,
      breed,
      age,
      weight_kg,
      gender,
      color,
      source,
      habitat_id,
      dietary_requirements,
      behavioral_notes,
      special_needs,
      microchip_number,
      adoption_fee = 0
    } = body;

    // Validate required fields
    if (!name || !species || !breed || !age || !gender) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name, species, breed, age, and gender are required'
        },
        { status: 400 }
      );
    }

    // Check if habitat exists and has capacity
    if (habitat_id) {
      const habitatResult = await db
        .select({ capacity: habitats.capacity, currentOccupancy: habitats.currentOccupancy })
        .from(habitats)
        .where(eq(habitats.habitatId, habitat_id));

      if (habitatResult.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid habitat',
            message: 'The specified habitat does not exist'
          },
          { status: 400 }
        );
      }

      const habitat = habitatResult[0];
      if (habitat.currentOccupancy && habitat.currentOccupancy >= habitat.capacity) {
        return NextResponse.json(
          {
            success: false,
            error: 'Habitat at capacity',
            message: 'The specified habitat is at full capacity'
          },
          { status: 400 }
        );
      }
    }

    // Insert new animal
    const newAnimalData = {
      name,
      species,
      breed,
      age,
      weightKg: weight_kg,
      gender: gender as any,
      color,
      arrivalDate: new Date().toISOString().split('T')[0], // Current date
      source,
      habitatId: habitat_id,
      dietaryRequirements: dietary_requirements,
      behavioralNotes: behavioral_notes,
      specialNeeds: special_needs,
      microchipNumber: microchip_number,
      adoptionFee: adoption_fee.toString()
    };

    const [createdAnimal] = await db
      .insert(animals)
      .values(newAnimalData)
      .returning();

    // Update habitat occupancy if habitat assigned
    if (habitat_id) {
      await db
        .update(habitats)
        .set({ currentOccupancy: sql`${habitats.currentOccupancy} + 1` })
        .where(eq(habitats.habitatId, habitat_id));
    }

    // Log activity
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    await logActivity('animals', createdAnimal.animalId, 'INSERT', 'Staff', null, null, body, clientIp);

    return NextResponse.json(
      {
        success: true,
        message: 'Animal created successfully',
        data: createdAnimal
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating animal:', error);
    
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate microchip number',
          message: 'An animal with this microchip number already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create animal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}