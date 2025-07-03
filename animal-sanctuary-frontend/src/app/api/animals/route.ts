import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, logActivity } from '@/lib/database';
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

    // Build WHERE clause dynamically
    let whereConditions = ['a.is_active = TRUE'];
    let queryParams: any[] = [];

    if (status) {
      whereConditions.push('a.adoption_status = ?');
      queryParams.push(status);
    }

    if (species) {
      whereConditions.push('a.species = ?');
      queryParams.push(species);
    }

    if (habitat) {
      whereConditions.push('a.habitat_id = ?');
      queryParams.push(parseInt(habitat));
    }

    if (availableOnly) {
      whereConditions.push('a.adoption_status = "Available"');
    }

    // Pagination
    const offset = (page - 1) * limit;
    const validSortFields = ['name', 'species', 'age', 'arrival_date', 'adoption_status'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Main query
    const query = `
      SELECT 
        a.animal_id,
        a.name,
        a.species,
        a.breed,
        a.age,
        a.weight_kg,
        a.gender,
        a.color,
        a.arrival_date,
        a.adoption_status,
        a.adoption_fee,
        a.dietary_requirements,
        a.behavioral_notes,
        a.special_needs,
        a.photos,
        h.habitat_name,
        h.habitat_type,
        DATEDIFF(CURDATE(), a.arrival_date) as days_in_sanctuary,
        (SELECT COUNT(*) FROM medical_records mr WHERE mr.animal_id = a.animal_id) as medical_records_count,
        (SELECT COUNT(*) FROM adoption_applications aa WHERE aa.animal_id = a.animal_id AND aa.status != 'Rejected') as application_count
      FROM animals a
      LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY a.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const animals = await executeQuery(query, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM animals a
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const [countResult] = await executeQuery<{ total: number }>(countQuery, countParams);
    const total = countResult.total;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: animals,
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
      const habitatQuery = `
        SELECT capacity, current_occupancy 
        FROM habitats 
        WHERE habitat_id = ?
      `;
      const habitats = await executeQuery<{ capacity: number; current_occupancy: number }>(
        habitatQuery, 
        [habitat_id]
      );

      if (habitats.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid habitat',
            message: 'The specified habitat does not exist'
          },
          { status: 400 }
        );
      }

      const habitat = habitats[0];
      if (habitat.current_occupancy >= habitat.capacity) {
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
    const insertQuery = `
      INSERT INTO animals (
        name, species, breed, age, weight_kg, gender, color,
        arrival_date, source, habitat_id, dietary_requirements,
        behavioral_notes, special_needs, microchip_number, adoption_fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      name, species, breed, age, weight_kg, gender, color,
      source, habitat_id, dietary_requirements, behavioral_notes,
      special_needs, microchip_number, adoption_fee
    ];

    const result = await executeQuery<any>(insertQuery, insertParams);
    const newAnimalId = (result as any).insertId;

    // Update habitat occupancy if habitat assigned
    if (habitat_id) {
      await executeQuery(
        'UPDATE habitats SET current_occupancy = current_occupancy + 1 WHERE habitat_id = ?',
        [habitat_id]
      );
    }

    // Log activity
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    await logActivity('animals', newAnimalId, 'INSERT', 'Staff', null, null, body, clientIp);

    // Return the created animal
    const createdAnimal = await executeQuery(
      'SELECT * FROM animals WHERE animal_id = ?',
      [newAnimalId]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Animal created successfully',
        data: createdAnimal[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating animal:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
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