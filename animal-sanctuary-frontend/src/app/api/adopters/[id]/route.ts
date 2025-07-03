import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'animal_sanctuary_capstone',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// GET /api/adopters/[id] - Get adopter by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adopterId = parseInt(params.id);
    console.log(`🐾 API: GET /api/adopters/${adopterId}`);
    
    if (isNaN(adopterId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid adopter ID',
          details: 'Adopter ID must be a valid number'
        },
        { status: 400 }
      );
    }

    // Get adopter with their applications
    const [adopterRows] = await pool.execute(
      `SELECT 
        adopter_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        housing_type,
        yard_fenced,
        other_pets,
        experience_level,
        references,
        emergency_contact,
        employment_status,
        annual_income,
        created_at,
        updated_at
      FROM adopters 
      WHERE adopter_id = ?`,
      [adopterId]
    );

    if ((adopterRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Adopter not found',
          details: `No adopter found with ID ${adopterId}`
        },
        { status: 404 }
      );
    }

    const adopter = (adopterRows as any[])[0];

    // Get adopter's applications
    const [applicationRows] = await pool.execute(
      `SELECT 
        aa.application_id,
        aa.animal_id,
        aa.application_date,
        aa.status,
        aa.questionnaire_responses,
        aa.review_notes,
        a.name as animal_name,
        a.species,
        a.breed
      FROM adoption_applications aa
      LEFT JOIN animals a ON aa.animal_id = a.animal_id
      WHERE aa.adopter_id = ?
      ORDER BY aa.application_date DESC`,
      [adopterId]
    );

    const adopterWithApplications = {
      ...adopter,
      applications: applicationRows
    };

    return NextResponse.json({
      success: true,
      data: adopterWithApplications,
      message: `Retrieved adopter ${adopter.first_name} ${adopter.last_name}`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch adopter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/adopters/[id] - Update adopter
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adopterId = parseInt(params.id);
    console.log(`🐾 API: PUT /api/adopters/${adopterId}`);
    
    if (isNaN(adopterId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid adopter ID',
          details: 'Adopter ID must be a valid number'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if adopter exists
    const [existingRows] = await pool.execute(
      'SELECT adopter_id FROM adopters WHERE adopter_id = ?',
      [adopterId]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Adopter not found',
          details: `No adopter found with ID ${adopterId}`
        },
        { status: 404 }
      );
    }

    // Update adopter
    await pool.execute(
      `UPDATE adopters SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        zip_code = COALESCE(?, zip_code),
        housing_type = COALESCE(?, housing_type),
        yard_fenced = COALESCE(?, yard_fenced),
        other_pets = COALESCE(?, other_pets),
        experience_level = COALESCE(?, experience_level),
        references = COALESCE(?, references),
        emergency_contact = COALESCE(?, emergency_contact),
        employment_status = COALESCE(?, employment_status),
        annual_income = COALESCE(?, annual_income),
        updated_at = CURRENT_TIMESTAMP
      WHERE adopter_id = ?`,
      [
        body.first_name,
        body.last_name,
        body.email,
        body.phone,
        body.address,
        body.city,
        body.state,
        body.zip_code,
        body.housing_type,
        body.yard_fenced,
        body.other_pets,
        body.experience_level,
        body.references,
        body.emergency_contact,
        body.employment_status,
        body.annual_income,
        adopterId
      ]
    );

    // Fetch updated adopter
    const [updatedRows] = await pool.execute(
      'SELECT * FROM adopters WHERE adopter_id = ?',
      [adopterId]
    );

    const updatedAdopter = (updatedRows as any[])[0];

    return NextResponse.json({
      success: true,
      data: updatedAdopter,
      message: `Adopter ${updatedAdopter.first_name} ${updatedAdopter.last_name} updated successfully`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update adopter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/adopters/[id] - Delete adopter
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adopterId = parseInt(params.id);
    console.log(`🐾 API: DELETE /api/adopters/${adopterId}`);
    
    if (isNaN(adopterId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid adopter ID',
          details: 'Adopter ID must be a valid number'
        },
        { status: 400 }
      );
    }

    // Check if adopter exists and get their info before deletion
    const [adopterRows] = await pool.execute(
      'SELECT first_name, last_name FROM adopters WHERE adopter_id = ?',
      [adopterId]
    );

    if ((adopterRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Adopter not found',
          details: `No adopter found with ID ${adopterId}`
        },
        { status: 404 }
      );
    }

    const adopter = (adopterRows as any[])[0];

    // Check for active applications
    const [applicationRows] = await pool.execute(
      `SELECT COUNT(*) as active_applications 
       FROM adoption_applications 
       WHERE adopter_id = ? AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
      [adopterId]
    );

    const activeApplications = (applicationRows as any[])[0].active_applications;

    if (activeApplications > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete adopter with active applications',
          details: `Adopter has ${activeApplications} active adoption application(s)`
        },
        { status: 400 }
      );
    }

    // Delete adopter (this will cascade delete applications due to foreign key)
    await pool.execute(
      'DELETE FROM adopters WHERE adopter_id = ?',
      [adopterId]
    );

    return NextResponse.json({
      success: true,
      data: {
        adopter_id: adopterId,
        name: `${adopter.first_name} ${adopter.last_name}`,
        deleted_at: new Date().toISOString()
      },
      message: `Adopter ${adopter.first_name} ${adopter.last_name} deleted successfully`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete adopter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}