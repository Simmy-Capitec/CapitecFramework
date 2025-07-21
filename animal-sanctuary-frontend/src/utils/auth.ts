import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Environment variables (in production, these would be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AuthTokenPayload {
  staffId: number;
  email: string;
  role: string;
  name: string;
}

export interface StaffUser {
  staff_id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a staff member
 */
export function generateToken(user: StaffUser): string {
  const payload: AuthTokenPayload = {
    staffId: user.staff_id,
    email: user.email,
    role: user.role,
    name: `${user.first_name} ${user.last_name}`
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Role hierarchy for authorization
 */
export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  MANAGER: 'Manager', 
  VETERINARIAN: 'Veterinarian',
  ADOPTION_COUNSELOR: 'Adoption Counselor',
  VOLUNTEER_COORDINATOR: 'Volunteer Coordinator',
  CARETAKER: 'Caretaker'
} as const;

/**
 * Define which roles can access which resources
 */
export const ROLE_PERMISSIONS = {
  // Full access to everything
  [ROLES.ADMINISTRATOR]: ['animals', 'adopters', 'applications', 'volunteers', 'staff', 'system'],
  
  // Management access to most resources
  [ROLES.MANAGER]: ['animals', 'adopters', 'applications', 'volunteers', 'reports'],
  
  // Medical and animal care access
  [ROLES.VETERINARIAN]: ['animals', 'medical_records', 'reports'],
  
  // Adoption-related access
  [ROLES.ADOPTION_COUNSELOR]: ['animals', 'adopters', 'applications'],
  
  // Volunteer management access
  [ROLES.VOLUNTEER_COORDINATOR]: ['volunteers', 'volunteer_assignments'],
  
  // Basic animal care access
  [ROLES.CARETAKER]: ['animals:read', 'animals:update']
};

/**
 * Check if a role has permission for a resource
 */
export function hasPermission(role: string, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  if (!permissions) return false;
  
  return permissions.includes(resource) || permissions.includes(`${resource}:read`) || permissions.includes(`${resource}:write`);
}