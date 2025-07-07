import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyPassword, generateToken, type StaffUser } from '@/utils/auth';
import { z } from 'zod';

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

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/login - Staff authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔐 AUTH: Login attempt for:', body.email);
    
    // Validate request data
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.issues.map(i => i.message).join(', ')
        },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    // Find staff member by email
    const [staffRows] = await pool.execute(
      `SELECT 
        staff_id,
        employee_id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        is_active,
        hire_date,
        created_at
      FROM staff 
      WHERE email = ? AND is_active = 1`,
      [email]
    );
    
    const staffMembers = staffRows as StaffUser[];
    
    if (staffMembers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          details: 'No active staff member found with this email'
        },
        { status: 401 }
      );
    }
    
    const staff = staffMembers[0];
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, staff.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ AUTH: Invalid password for:', email);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          details: 'Incorrect password'
        },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken(staff);
    
    console.log('✅ AUTH: Login successful for:', email, '- Role:', staff.role);
    
    // Return success response with token
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: staff.staff_id,
          email: staff.email,
          name: `${staff.first_name} ${staff.last_name}`,
          role: staff.role,
          employee_id: staff.employee_id
        }
      },
      message: `Welcome back, ${staff.first_name}!`
    });
    
  } catch (error) {
    console.error('❌ AUTH ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}