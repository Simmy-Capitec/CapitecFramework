import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, logActivity } from '@/lib/database';

// ===================================================================
// INDIVIDUAL ANIMAL API ENDPOINTS
// ===================================================================

/**
 * GET /api/animals/[id]
 * Retrieve specific animal with complete details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid animal ID',
          message: 'Animal ID must be a number'
        },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        a.*,
        h.habitat_name,
        h.habitat_type,
        h.capacity as habitat_capacity,
        h.current_occupancy as habitat_occupancy,
        DATEDIFF(CURDATE(), a.arrival_date) as days_in_sanctuary,
        CASE 
          WHEN a.adoption_status = 'Available' THEN 'This animal is ready for adoption'
          WHEN a.adoption_status = 'Pending' THEN 'This animal has a pending adoption application'
          WHEN a.adoption_status = 'Adopted' THEN 'This animal has been adopted'
          WHEN a.adoption_status = 'Medical Hold' THEN 'This animal is receiving medical care'
          ELSE 'This animal is not currently available for adoption'
        END as status_description
      FROM animals a
      LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
      WHERE a.animal_id = ? AND a.is_active = TRUE
    `;

    const animals = await executeQuery(query, [animalId]);

    if (animals.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Animal not found',
          message: `No animal found with ID ${animalId}`
        },
        { status: 404 }
      );
    }

    const animal = animals[0];

    // Get medical history
    const medicalQuery = `
      SELECT 
        mr.record_id,
        mr.visit_date,
        mr.visit_type,
        mr.diagnosis,
        mr.treatment,
        mr.medication,
        mr.next_visit_date,
        mr.cost,
        mr.notes,
        CONCAT(s.first_name, ' ', s.last_name) as veterinarian_name
      FROM medical_records mr
      LEFT JOIN staff s ON mr.staff_id = s.staff_id
      WHERE mr.animal_id = ?
      ORDER BY mr.visit_date DESC
    `;

    const medicalHistory = await executeQuery(medicalQuery, [animalId]);

    // Get adoption applications (if any)
    const applicationsQuery = `
      SELECT 
        aa.application_id,
        aa.application_date,
        aa.status,
        CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
        ad.email as adopter_email,
        ad.phone as adopter_phone
      FROM adoption_applications aa
      LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
      WHERE aa.animal_id = ? AND aa.status != 'Rejected'
      ORDER BY aa.application_date DESC
    `;

    const applications = await executeQuery(applicationsQuery, [animalId]);

    // Combine all data
    const completeAnimalData = {
      ...animal,
      medical_history: medicalHistory,
      adoption_applications: applications
    };

    return NextResponse.json({
      success: true,
      data: completeAnimalData
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch animal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/animals/[id]
 * Update an existing animal record
 */
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
        {
          success: false,
          error: 'Invalid animal ID',
          message: 'Animal ID must be a number'
        },
        { status: 400 }
      );
    }

    // Check if animal exists
    const existingAnimal = await executeQuery(
      'SELECT * FROM animals WHERE animal_id = ? AND is_active = TRUE',
      [animalId]
    );

    if (existingAnimal.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Animal not found',
          message: `No animal found with ID ${animalId}`
        },
        { status: 404 }
      );
    }

    const oldAnimal = existingAnimal[0];

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateParams: any[] = [];

    const allowedFields = [
      'name', 'species', 'breed', 'age', 'weight_kg', 'gender',
      'color', 'adoption_status', 'adoption_fee', 'habitat_id',
      'dietary_requirements', 'behavioral_notes', 'special_needs',
      'microchip_number'
    ];

    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        updateParams.push(body[field]);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid fields to update',
          message: 'Please provide at least one field to update'
        },
        { status: 400 }
      );
    }

    // Handle habitat change
    if (body.habitat_id && body.habitat_id !== oldAnimal.habitat_id) {
      // Check new habitat capacity
      const newHabitatQuery = `
        SELECT capacity, current_occupancy 
        FROM habitats 
        WHERE habitat_id = ?
      `;
      const newHabitats = await executeQuery<{ capacity: number; current_occupancy: number }>(
        newHabitatQuery, 
        [body.habitat_id]
      );

      if (newHabitats.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid habitat',
            message: 'The specified habitat does not exist'
          },
          { status: 400 }
        );
      }

      const newHabitat = newHabitats[0];
      if (newHabitat.current_occupancy >= newHabitat.capacity) {
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

    // Perform update
    updateParams.push(animalId);
    const updateQuery = `
      UPDATE animals 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE animal_id = ?
    `;

    await executeQuery(updateQuery, updateParams);

    // Update habitat occupancy if habitat changed
    if (body.habitat_id && body.habitat_id !== oldAnimal.habitat_id) {
      // Decrease old habitat occupancy
      if (oldAnimal.habitat_id) {
        await executeQuery(
          'UPDATE habitats SET current_occupancy = current_occupancy - 1 WHERE habitat_id = ?',
          [oldAnimal.habitat_id]
        );
      }
      
      // Increase new habitat occupancy
      await executeQuery(
        'UPDATE habitats SET current_occupancy = current_occupancy + 1 WHERE habitat_id = ?',
        [body.habitat_id]
      );
    }

    // Log activity
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    await logActivity('animals', animalId, 'UPDATE', 'Staff', null, oldAnimal, body, clientIp);

    // Return updated animal
    const updatedAnimal = await executeQuery(
      'SELECT * FROM animals WHERE animal_id = ?',
      [animalId]
    );

    return NextResponse.json({
      success: true,
      message: 'Animal updated successfully',
      data: updatedAnimal[0]
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    
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
        error: 'Failed to update animal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/animals/[id]
 * Soft delete an animal (set is_active to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid animal ID',
          message: 'Animal ID must be a number'
        },
        { status: 400 }
      );
    }

    // Check if animal exists and is active
    const existingAnimal = await executeQuery(
      'SELECT * FROM animals WHERE animal_id = ? AND is_active = TRUE',
      [animalId]
    );

    if (existingAnimal.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Animal not found',
          message: `No active animal found with ID ${animalId}`
        },
        { status: 404 }
      );
    }

    const animal = existingAnimal[0];

    // Check if animal has pending adoption applications
    const pendingApplications = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM adoption_applications WHERE animal_id = ? AND status IN ("Submitted", "Under Review", "Interview Scheduled", "Approved")',
      [animalId]
    );

    if (pendingApplications[0].count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete animal',
          message: 'Animal has pending adoption applications. Please resolve these first.'
        },
        { status: 400 }
      );
    }

    // Soft delete the animal
    await executeQuery(
      'UPDATE animals SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE animal_id = ?',
      [animalId]
    );

    // Update habitat occupancy
    if (animal.habitat_id) {
      await executeQuery(
        'UPDATE habitats SET current_occupancy = current_occupancy - 1 WHERE habitat_id = ?',
        [animal.habitat_id]
      );
    }

    // Log activity
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    await logActivity('animals', animalId, 'DELETE', 'Staff', null, animal, null, clientIp);

    return NextResponse.json({
      success: true,
      message: 'Animal deleted successfully',
      data: {
        animal_id: animalId,
        name: animal.name,
        deleted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete animal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}