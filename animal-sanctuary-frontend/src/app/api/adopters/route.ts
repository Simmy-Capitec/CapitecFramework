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

// GET /api/adopters - Get all adopters
export async function GET(request: NextRequest) {
  try {
    console.log('🐾 API: GET /api/adopters');
    
    const [rows] = await pool.execute(`
      SELECT 
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
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
      message: `Retrieved ${(rows as any[]).length} adopters`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch adopters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/adopters - Create new adopter
export async function POST(request: NextRequest) {
  try {
    console.log('🐾 API: POST /api/adopters');
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone'];
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

    // Insert new adopter
    const [result] = await pool.execute(
      `INSERT INTO adopters (
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
        annual_income
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.first_name,
        body.last_name,
        body.email,
        body.phone,
        body.address || null,
        body.city || null,
        body.state || null,
        body.zip_code || null,
        body.housing_type || null,
        body.yard_fenced || false,
        body.other_pets || null,
        body.experience_level || null,
        body.references || null,
        body.emergency_contact || null,
        body.employment_status || null,
        body.annual_income || null
      ]
    );

    const adopterId = (result as any).insertId;

    // Fetch the created adopter
    const [rows] = await pool.execute(
      'SELECT * FROM adopters WHERE adopter_id = ?',
      [adopterId]
    );

    const newAdopter = (rows as any[])[0];

    return NextResponse.json({
      success: true,
      data: newAdopter,
      message: `Adopter created successfully with ID ${adopterId}`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    
    // Handle duplicate email error
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address already exists',
          details: 'An adopter with this email address is already registered'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create adopter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}