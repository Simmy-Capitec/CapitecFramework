import { NextRequest, NextResponse } from 'next/server';
import { db, adoptionApplications, logActivity } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    const body = await request.json();
    const { status, reason } = body;

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Withdrawn'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: status as any,
      updatedAt: new Date()
    };

    // Set specific fields based on status
    if (status === 'Approved') {
      updateData.approvalDate = new Date().toISOString().split('T')[0];
    } else if (status === 'Rejected') {
      updateData.rejectionReason = reason;
    }

    const result = await db
      .update(adoptionApplications)
      .set(updateData)
      .where(eq(adoptionApplications.applicationId, applicationId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logActivity('adoption_applications', applicationId, 'UPDATE', 'Staff', null, null, { status, reason }, clientIp);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: `Application status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}