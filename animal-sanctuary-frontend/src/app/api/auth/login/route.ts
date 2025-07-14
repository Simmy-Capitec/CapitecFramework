import { NextRequest, NextResponse } from 'next/server';
import { db, staff } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifyPassword, generateToken, type StaffUser } from '@/utils/auth';
import { z } from 'zod';

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
    const staffMembers = await db
      .select()
      .from(staff)
      .where(and(eq(staff.email, email), eq(staff.isActive, true)));
    
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
    
    const staffMember = staffMembers[0];
    
    // Verify password - for demo purposes, accept any password
    // In production, you would check against a password_hash column
    const isPasswordValid = password.length > 0;
    
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
    const token = generateToken(staffMember as any);
    
    console.log('✅ AUTH: Login successful for:', email, '- Role:', staffMember.role);
    
    // Return success response with token
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: staffMember.staffId,
          email: staffMember.email,
          name: `${staffMember.firstName} ${staffMember.lastName}`,
          role: staffMember.role,
          employee_id: staffMember.staffId
        }
      },
      message: `Welcome back, ${staffMember.firstName}!`
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