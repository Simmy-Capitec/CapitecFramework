-- Animal Sanctuary Capstone Project - PostgreSQL Database Schema
-- This schema is designed to work with Drizzle ORM

-- Drop database if exists (for fresh setup)
DROP DATABASE IF EXISTS animal_sanctuary_capstone;
CREATE DATABASE animal_sanctuary_capstone;

-- Connect to the database
\c animal_sanctuary_capstone;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE adoption_status AS ENUM ('Available', 'Pending', 'Adopted', 'Unavailable');
CREATE TYPE animal_type AS ENUM ('Dog', 'Cat', 'Bird', 'Rabbit', 'Other');
CREATE TYPE application_status AS ENUM ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected');
CREATE TYPE volunteer_status AS ENUM ('Active', 'Inactive', 'Pending');

-- Animals table
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    species animal_type NOT NULL,
    breed VARCHAR(100),
    age INTEGER CHECK (age >= 0),
    weight DECIMAL(5,2) CHECK (weight > 0),
    color VARCHAR(50),
    description TEXT,
    adoption_status adoption_status DEFAULT 'Available',
    medical_notes TEXT,
    intake_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adopters table
CREATE TABLE adopters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    has_experience BOOLEAN DEFAULT FALSE,
    has_other_pets BOOLEAN DEFAULT FALSE,
    housing_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adoption applications table
CREATE TABLE adoption_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    adopter_id UUID NOT NULL REFERENCES adopters(id) ON DELETE CASCADE,
    status application_status DEFAULT 'Submitted',
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    interview_date DATE,
    decision_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(animal_id, adopter_id)
);

-- Volunteers table
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    skills TEXT[],
    availability JSONB,
    status volunteer_status DEFAULT 'Pending',
    start_date DATE,
    background_check_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer schedules table
CREATE TABLE volunteer_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    activity VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

-- Donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(100),
    donor_email VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT FALSE,
    purpose VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical records table
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    veterinarian VARCHAR(100),
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    follow_up_date DATE,
    cost DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_adoption_status ON animals(adoption_status);
CREATE INDEX idx_animals_intake_date ON animals(intake_date);
CREATE INDEX idx_adopters_email ON adopters(email);
CREATE INDEX idx_applications_animal_id ON adoption_applications(animal_id);
CREATE INDEX idx_applications_adopter_id ON adoption_applications(adopter_id);
CREATE INDEX idx_applications_status ON adoption_applications(status);
CREATE INDEX idx_volunteers_email ON volunteers(email);
CREATE INDEX idx_volunteers_status ON volunteers(status);
CREATE INDEX idx_schedules_volunteer_id ON volunteer_schedules(volunteer_id);
CREATE INDEX idx_schedules_date ON volunteer_schedules(scheduled_date);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_medical_records_animal_id ON medical_records(animal_id);
CREATE INDEX idx_medical_records_date ON medical_records(visit_date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adopters_updated_at BEFORE UPDATE ON adopters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON adoption_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for animal statistics
CREATE VIEW animal_statistics AS
SELECT 
    species,
    adoption_status,
    COUNT(*) as count,
    AVG(age) as average_age,
    AVG(weight) as average_weight
FROM animals 
WHERE is_active = TRUE
GROUP BY species, adoption_status;

-- Create a view for adoption metrics
CREATE VIEW adoption_metrics AS
SELECT 
    DATE_TRUNC('month', application_date) as month,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_applications,
    ROUND(
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as approval_rate
FROM adoption_applications
GROUP BY DATE_TRUNC('month', application_date)
ORDER BY month;

-- Grant permissions to capstone_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO capstone_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO capstone_user;
GRANT USAGE ON SCHEMA public TO capstone_user;

-- Success message
SELECT 'Animal Sanctuary Capstone Database (PostgreSQL) Setup Complete!' as status,
       'Database: animal_sanctuary_capstone' as database_name,
       'ORM: Drizzle' as orm,
       'Tables Created: 8' as tables_count,
       'Views Created: 2' as views_count;