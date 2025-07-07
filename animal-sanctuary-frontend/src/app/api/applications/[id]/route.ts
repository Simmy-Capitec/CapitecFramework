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

// GET /api/applications/[id] - Get application by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    console.log(`🐾 API: GET /api/applications/${applicationId}`);
    
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

    // Get application with all related data
    const [rows] = await pool.execute(
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
        ad.address as adopter_address,
        ad.city as adopter_city,
        ad.state as adopter_state,
        ad.zip_code as adopter_zip,
        ad.housing_type,
        ad.yard_fenced,
        ad.other_pets,
        ad.experience_level,
        ad.employment_status,
        a.name as animal_name,
        a.species as animal_species,
        a.breed as animal_breed,
        a.age as animal_age,
        a.gender as animal_gender,
        a.adoption_fee,
        a.adoption_status as animal_adoption_status,
        a.special_needs as animal_special_needs
      FROM adoption_applications aa
      LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
      LEFT JOIN animals a ON aa.animal_id = a.animal_id
      WHERE aa.application_id = ?`,
      [applicationId]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
          details: `No application found with ID ${applicationId}`
        },
        { status: 404 }
      );
    }

    const application = (rows as any[])[0];

    // Parse questionnaire responses if they exist
    if (application.questionnaire_responses) {
      try {
        application.questionnaire_responses = JSON.parse(application.questionnaire_responses);
      } catch (error) {
        console.warn('Failed to parse questionnaire responses:', error);
        application.questionnaire_responses = {};
      }
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: `Retrieved application for ${application.animal_name} by ${application.adopter_name}`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[id] - Update application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    console.log(`🐾 API: PUT /api/applications/${applicationId}`);
    
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

    // Check if application exists
    const [existingRows] = await pool.execute(
      `SELECT aa.application_id, aa.animal_id, aa.status, a.name as animal_name 
       FROM adoption_applications aa
       LEFT JOIN animals a ON aa.animal_id = a.animal_id
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

    // Update application
    await pool.execute(
      `UPDATE adoption_applications SET 
        status = COALESCE(?, status),
        questionnaire_responses = COALESCE(?, questionnaire_responses),
        review_notes = COALESCE(?, review_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE application_id = ?`,
      [
        body.status,
        body.questionnaire_responses ? JSON.stringify(body.questionnaire_responses) : null,
        body.review_notes,
        applicationId
      ]
    );

    // Handle animal status changes based on application status
    if (body.status) {
      if (body.status === 'Approved') {
        // Set animal to Pending for approved applications
        await pool.execute(
          'UPDATE animals SET adoption_status = ? WHERE animal_id = ?',
          ['Pending', existingApplication.animal_id]
        );
      } else if (body.status === 'Completed') {
        // Set animal to Adopted when application is completed
        await pool.execute(
          'UPDATE animals SET adoption_status = ? WHERE animal_id = ?',
          ['Adopted', existingApplication.animal_id]
        );
      } else if (body.status === 'Rejected') {
        // Check if there are other pending applications
        const [otherApplications] = await pool.execute(
          `SELECT COUNT(*) as count FROM adoption_applications 
           WHERE animal_id = ? AND application_id != ? 
           AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
          [existingApplication.animal_id, applicationId]
        );

        // If no other pending applications, set animal back to Available
        if ((otherApplications as any[])[0].count === 0) {
          await pool.execute(
            'UPDATE animals SET adoption_status = ? WHERE animal_id = ?',
            ['Available', existingApplication.animal_id]
          );
        }
      }
    }

    // Fetch updated application
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
        a.breed as animal_breed
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

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application for ${existingApplication.animal_name} updated successfully`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    console.log(`🐾 API: DELETE /api/applications/${applicationId}`);
    
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

    // Check if application exists and get info before deletion
    const [applicationRows] = await pool.execute(
      `SELECT aa.application_id, aa.animal_id, aa.status,
              CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
              a.name as animal_name
       FROM adoption_applications aa
       LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
       LEFT JOIN animals a ON aa.animal_id = a.animal_id
       WHERE aa.application_id = ?`,
      [applicationId]
    );

    if ((applicationRows as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
          details: `No application found with ID ${applicationId}`
        },
        { status: 404 }
      );
    }

    const application = (applicationRows as any[])[0];

    // Check if application can be deleted
    if (application.status === 'Completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete completed application',
          details: 'Completed adoption applications cannot be deleted for record keeping'
        },
        { status: 400 }
      );
    }

    // Delete application
    await pool.execute(
      'DELETE FROM adoption_applications WHERE application_id = ?',
      [applicationId]
    );

    // Check if there are other pending applications for the animal
    const [otherApplications] = await pool.execute(
      `SELECT COUNT(*) as count FROM adoption_applications 
       WHERE animal_id = ? AND status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
      [application.animal_id]
    );

    // If no other pending applications, set animal back to Available
    if ((otherApplications as any[])[0].count === 0) {
      await pool.execute(
        'UPDATE animals SET adoption_status = ? WHERE animal_id = ?',
        ['Available', application.animal_id]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        application_id: applicationId,
        adopter_name: application.adopter_name,
        animal_name: application.animal_name,
        deleted_at: new Date().toISOString()
      },
      message: `Application by ${application.adopter_name} for ${application.animal_name} deleted successfully`
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}