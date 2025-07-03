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

// GET /api/applications - Get all adoption applications
export async function GET(request: NextRequest) {
  try {
    console.log('🐾 API: GET /api/applications');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const animalId = searchParams.get('animal_id');
    const adopterId = searchParams.get('adopter_id');

    let query = `
      SELECT 
        aa.application_id,
        aa.animal_id,
        aa.adopter_id,
        aa.application_date,
        aa.status,
        aa.questionnaire_responses,
        aa.review_notes,
        aa.created_at,
        aa.updated_at,
        CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
        ad.email as adopter_email,
        ad.phone as adopter_phone,
        a.name as animal_name,
        a.species as animal_species,
        a.breed as animal_breed,
        a.adoption_status as animal_adoption_status
      FROM adoption_applications aa
      LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
      LEFT JOIN animals a ON aa.animal_id = a.animal_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND aa.status = ?';
      params.push(status);
    }

    if (animalId) {
      query += ' AND aa.animal_id = ?';
      params.push(parseInt(animalId));
    }

    if (adopterId) {
      query += ' AND aa.adopter_id = ?';
      params.push(parseInt(adopterId));
    }

    query += ' ORDER BY aa.application_date DESC';

    const [rows] = await pool.execute(query, params);

    return NextResponse.json({
      success: true,
      data: rows,
      message: `Retrieved ${(rows as any[]).length} adoption applications`,
      filters_applied: {
        status,
        animal_id: animalId,
        adopter_id: adopterId
      }
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch adoption applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new adoption application
export async function POST(request: NextRequest) {
  try {
    console.log('🐾 API: POST /api/applications');
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['animal_id', 'adopter_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missing_fields: missingFields
        },
        { status: 400 }
      );
    }

    // Check if animal exists and is available
    const [animalRows] = await pool.execute(
      'SELECT animal_id, name, adoption_status FROM animals WHERE animal_id = ?',
      [body.animal_id]
    );

    if ((animalRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Animal not found',
          details: `No animal found with ID ${body.animal_id}`
        },
        { status: 404 }
      );
    }

    const animal = (animalRows as any[])[0];
    if (animal.adoption_status !== 'Available') {
      return NextResponse.json(
        {
          success: false,
          error: 'Animal not available for adoption',
          details: `Animal ${animal.name} has status: ${animal.adoption_status}`
        },
        { status: 400 }
      );
    }

    // Check if adopter exists
    const [adopterRows] = await pool.execute(
      'SELECT adopter_id, first_name, last_name FROM adopters WHERE adopter_id = ?',
      [body.adopter_id]
    );

    if ((adopterRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Adopter not found',
          details: `No adopter found with ID ${body.adopter_id}`
        },
        { status: 404 }
      );
    }

    // Check for existing pending application
    const [existingApplications] = await pool.execute(
      `SELECT application_id FROM adoption_applications 
       WHERE animal_id = ? AND adopter_id = ? 
       AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
      [body.animal_id, body.adopter_id]
    );

    if ((existingApplications as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application already exists',
          details: 'You already have an active application for this animal'
        },
        { status: 409 }
      );
    }

    // Insert new application
    const [result] = await pool.execute(
      `INSERT INTO adoption_applications (
        animal_id,
        adopter_id,
        application_date,
        status,
        questionnaire_responses
      ) VALUES (?, ?, CURDATE(), 'Submitted', ?)`,
      [
        body.animal_id,
        body.adopter_id,
        JSON.stringify(body.questionnaire_responses || {})
      ]
    );

    const applicationId = (result as any).insertId;

    // Update animal status to Pending if this is the first application
    const [pendingCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM adoption_applications 
       WHERE animal_id = ? AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
      [body.animal_id]
    );

    if ((pendingCount as any[])[0].count === 1) {
      await pool.execute(
        'UPDATE animals SET adoption_status = ? WHERE animal_id = ?',
        ['Pending', body.animal_id]
      );
    }

    // Fetch the created application with related data
    const [applicationRows] = await pool.execute(
      `SELECT 
        aa.application_id,
        aa.animal_id,
        aa.adopter_id,
        aa.application_date,
        aa.status,
        aa.questionnaire_responses,
        aa.review_notes,
        aa.created_at,
        aa.updated_at,
        CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
        ad.email as adopter_email,
        ad.phone as adopter_phone,
        a.name as animal_name,
        a.species as animal_species,
        a.breed as animal_breed
      FROM adoption_applications aa
      LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
      LEFT JOIN animals a ON aa.animal_id = a.animal_id
      WHERE aa.application_id = ?`,
      [applicationId]
    );

    const newApplication = (applicationRows as any[])[0];

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: `Adoption application created successfully for ${animal.name}`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create adoption application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}