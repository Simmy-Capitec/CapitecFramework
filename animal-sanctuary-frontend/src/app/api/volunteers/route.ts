import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { withPermission, publicRoute, getCurrentUser, type AuthenticatedRequest } from '@/middleware/auth';

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

// GET /api/volunteers - Get all volunteers (Protected route)
export const GET = withPermission('volunteers')(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        volunteer_id,
        first_name,
        last_name,
        email,
        phone,
        city,
        state,
        status,
        start_date,
        total_hours_logged,
        background_check_completed,
        orientation_completed,
        created_at
      FROM volunteers
    `;
    
    const queryParams: any[] = [];
    
    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(query, queryParams);
    
    return NextResponse.json({
      success: true,
      data: rows,
      count: (rows as any[]).length
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch volunteers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

// POST /api/volunteers - Create new volunteer application (Public route)
export const POST = publicRoute(async (request: NextRequest) => {
  try {
    const body = await request.json();
    console.log('🐾 API: POST /api/volunteers', body);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
            details: 'All required fields must be provided'
          },
          { status: 400 }
        );
      }
    }
    
    // Check if email already exists
    const [existingRows] = await pool.execute(
      'SELECT volunteer_id FROM volunteers WHERE email = ?',
      [body.email]
    );
    
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
          details: 'A volunteer with this email already exists'
        },
        { status: 409 }
      );
    }
    
    // Prepare data for insertion
    const volunteerData = {
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.dateOfBirth || null,
      emergency_contact: JSON.stringify({
        contact_info: body.emergencyContact || '',
        relationship: 'Emergency Contact'
      }),
      availability: JSON.stringify(body.availability || []),
      skills: JSON.stringify({
        interests: body.interests || [],
        experience: body.experience || 'none',
        occupation: body.occupation || null,
        whyVolunteer: body.whyVolunteer || ''
      }),
      start_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      background_check_completed: false,
      orientation_completed: false,
      total_hours_logged: 0
    };
    
    // Insert new volunteer
    const [result] = await pool.execute(
      `INSERT INTO volunteers (
        first_name, last_name, email, phone, date_of_birth,
        emergency_contact, availability, skills, start_date, status,
        background_check_completed, orientation_completed, total_hours_logged
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        volunteerData.first_name,
        volunteerData.last_name,
        volunteerData.email,
        volunteerData.phone,
        volunteerData.date_of_birth,
        volunteerData.emergency_contact,
        volunteerData.availability,
        volunteerData.skills,
        volunteerData.start_date,
        volunteerData.status,
        volunteerData.background_check_completed,
        volunteerData.orientation_completed,
        volunteerData.total_hours_logged
      ]
    );
    
    const insertId = (result as any).insertId;
    
    // Fetch the created volunteer
    const [newVolunteerRows] = await pool.execute(
      'SELECT * FROM volunteers WHERE volunteer_id = ?',
      [insertId]
    );
    
    const newVolunteer = (newVolunteerRows as any[])[0];
    
    return NextResponse.json({
      success: true,
      data: {
        volunteer_id: newVolunteer.volunteer_id,
        name: `${newVolunteer.first_name} ${newVolunteer.last_name}`,
        email: newVolunteer.email,
        status: newVolunteer.status
      },
      message: `Volunteer application for ${newVolunteer.first_name} ${newVolunteer.last_name} submitted successfully!`
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create volunteer application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});