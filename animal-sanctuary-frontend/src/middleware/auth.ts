import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, hasPermission, type AuthTokenPayload } from '@/utils/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthTokenPayload;
}

/**
 * Authentication middleware for API routes
 */
export function withAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest, ...args: any[]) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            details: 'No authorization token provided'
          },
          { status: 401 }
        );
      }
      
      // Verify token
      const user = verifyToken(token);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid token',
            details: 'Token is invalid or expired'
          },
          { status: 401 }
        );
      }
      
      // Add user to request object
      req.user = user;
      
      // Call the original handler
      return await handler(req, ...args);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          details: 'Internal authentication error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Authorization middleware for role-based access control
 */
export function withRole(requiredRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest, ...args: any[]) => {
      const user = req.user!; // Will be set by withAuth
      
      if (!requiredRoles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            details: `Role '${user.role}' does not have permission to access this resource`
          },
          { status: 403 }
        );
      }
      
      return await handler(req, ...args);
    });
  };
}

/**
 * Resource-based authorization middleware
 */
export function withPermission(resource: string) {
  return function(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest, ...args: any[]) => {
      const user = req.user!; // Will be set by withAuth
      
      if (!hasPermission(user.role, resource)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            details: `Role '${user.role}' does not have permission to access '${resource}'`
          },
          { status: 403 }
        );
      }
      
      return await handler(req, ...args);
    });
  };
}

/**
 * Public route - no authentication required
 */
export function publicRoute(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return handler;
}

/**
 * Get current user from authenticated request
 */
export function getCurrentUser(req: AuthenticatedRequest): AuthTokenPayload | null {
  return req.user || null;
}