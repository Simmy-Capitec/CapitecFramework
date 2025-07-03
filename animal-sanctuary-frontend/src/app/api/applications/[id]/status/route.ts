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

// PUT /api/applications/[id]/status - Update application status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id);
    console.log(`🐾 API: PUT /api/applications/${applicationId}/status`);
    
    if (isNaN(applicationId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid application ID',
          details: 'Application ID must be a valid number'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: status',
          details: 'Status is required to update application'
        },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          details: `Status must be one of: ${validStatuses.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check if application exists
    const [existingRows] = await pool.execute(
      `SELECT aa.application_id, aa.animal_id, aa.status, aa.adopter_id,
              a.name as animal_name, a.adoption_status as animal_adoption_status,
              CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name
       FROM adoption_applications aa
       LEFT JOIN animals a ON aa.animal_id = a.animal_id
       LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
       WHERE aa.application_id = ?`,
      [applicationId]
    );

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
          details: `No application found with ID ${applicationId}`
        },
        { status: 404 }
      );
    }

    const existingApplication = (existingRows as any[])[0];

    // Validate status transitions
    const currentStatus = existingApplication.status;
    
    // Cannot change status if already completed
    if (currentStatus === 'Completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot modify completed application',
          details: 'Completed applications cannot be modified'
        },
        { status: 400 }
      );
    }

    // Cannot go backwards in certain cases
    if (currentStatus === 'Approved' && body.status === 'Under Review') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status transition',
          details: 'Cannot move from Approved back to Under Review'
        },
        { status: 400 }
      );
    }

    // Update application status
    await pool.execute(
      `UPDATE adoption_applications SET 
        status = ?,
        review_notes = COALESCE(?, review_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE application_id = ?`,
      [body.status, body.review_notes, applicationId]
    );

    // Handle animal status changes based on application status
    let animalStatusUpdate = null;
    
    switch (body.status) {
      case 'Approved':
        // Set animal to Pending for approved applications (final approval pending)
        animalStatusUpdate = 'Pending';
        break;
        
      case 'Completed':
        // Set animal to Adopted when application is completed
        animalStatusUpdate = 'Adopted';
        
        // Also reject all other pending applications for this animal
        await pool.execute(
          `UPDATE adoption_applications SET 
            status = 'Rejected',
            review_notes = CONCAT(COALESCE(review_notes, ''), ' - Automatically rejected: Animal adopted by another applicant'),
            updated_at = CURRENT_TIMESTAMP
           WHERE animal_id = ? AND application_id != ? 
           AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
          [existingApplication.animal_id, applicationId]
        );
        break;
        
      case 'Rejected':
        // Check if there are other active applications
        const [otherActiveApplications] = await pool.execute(
          `SELECT COUNT(*) as count FROM adoption_applications 
           WHERE animal_id = ? AND application_id != ? 
           AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
          [existingApplication.animal_id, applicationId]
        );

        // If no other active applications, set animal back to Available
        if ((otherActiveApplications as any[])[0].count === 0) {
          animalStatusUpdate = 'Available';
        }
        break;
        
      case 'Submitted':
      case 'Under Review':
      case 'Interview Scheduled':
        // Ensure animal is in Pending status if it's not already
        if (existingApplication.animal_adoption_status === 'Available') {
          animalStatusUpdate = 'Pending';
        }
        break;
    }

    // Update animal status if needed
    if (animalStatusUpdate) {
      await pool.execute(
        'UPDATE animals SET adoption_status = ? WHERE animal_id = ?',
        [animalStatusUpdate, existingApplication.animal_id]
      );
    }

    // Fetch updated application with all related data
    const [updatedRows] = await pool.execute(
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
        a.breed as animal_breed,
        a.adoption_status as animal_adoption_status
      FROM adoption_applications aa
      LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
      LEFT JOIN animals a ON aa.animal_id = a.animal_id
      WHERE aa.application_id = ?`,
      [applicationId]
    );

    const updatedApplication = (updatedRows as any[])[0];

    // Parse questionnaire responses if they exist
    if (updatedApplication.questionnaire_responses) {
      try {
        updatedApplication.questionnaire_responses = JSON.parse(updatedApplication.questionnaire_responses);
      } catch (error) {
        console.warn('Failed to parse questionnaire responses:', error);
        updatedApplication.questionnaire_responses = {};
      }
    }

    const statusMessages = {
      'Submitted': 'Application has been submitted for review',
      'Under Review': 'Application is currently under review',
      'Interview Scheduled': 'Interview has been scheduled with the adopter',
      'Approved': 'Application has been approved - awaiting final steps',
      'Rejected': 'Application has been rejected',
      'Completed': 'Adoption has been completed successfully'
    };

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application status updated to "${body.status}". ${statusMessages[body.status as keyof typeof statusMessages]}`,
      status_change: {
        from: currentStatus,
        to: body.status,
        animal_status_updated: animalStatusUpdate
      }
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update application status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}