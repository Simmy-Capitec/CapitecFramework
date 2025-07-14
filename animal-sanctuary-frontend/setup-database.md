# 🗄️ Animal Sanctuary Database Setup Guide

## Quick Setup Instructions

### **Step 1: Install PostgreSQL (if not installed)**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (with Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
- Download PostgreSQL from https://www.postgresql.org/download/windows/
- Run the installer and follow the setup wizard

### **Step 2: Create the Database**

1. **Login to PostgreSQL:**
```bash
sudo -u postgres psql
```

2. **Create the database and schema:**
```sql
CREATE DATABASE animal_sanctuary_capstone;
\c animal_sanctuary_capstone;
CREATE SCHEMA animal_sanctuary_capstone;
```

3. **Run Drizzle migrations:**
```bash
npx drizzle-kit push
```

### **Step 3: Configure Environment Variables**

Update your `.env.local` file with your PostgreSQL credentials:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=animal_sanctuary_capstone
```

### **Step 4: Test the Connection**

1. **Start the Next.js development server:**
```bash
npm run dev
```

2. **Test the health endpoint:**
```bash
curl http://localhost:3000/api/health
```

You should see a response like:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "stats": {
      "totalAnimals": 10,
      "availableAnimals": 8,
      "totalAdopters": 5,
      "pendingApplications": 3,
      "totalDonations": 2500
    }
  }
}
```

## Database Schema Overview

The database includes these main tables:

- **animals** - Core animal information and adoption status
- **habitats** - Living environments for animals  
- **adopters** - People interested in adopting
- **adoption_applications** - Adoption requests and processing
- **adoption_records** - Completed adoptions
- **volunteers** - Volunteer information and assignments
- **staff** - Staff members and roles
- **donations** - Donation tracking
- **medical_records** - Animal health records
- **activity_log** - Audit trail for all changes

## Sample Data

The schema file includes sample data with:
- 10 animals (dogs, cats, rabbits, birds)
- 5 habitats (indoor, outdoor, mixed environments)
- 5 adopters with contact information
- 8 adoption applications in various stages
- 3 completed adoptions
- 10 volunteers with different skills
- 5 staff members with different roles
- 10 donation records
- 15 medical records for animal health tracking

## Testing the Frontend

Once the database is connected:

1. **Visit the homepage:** http://localhost:3000
2. **Browse animals:** http://localhost:3000/animals
3. **Check API health:** http://localhost:3000/api/health
4. **Test animals API:** http://localhost:3000/api/animals

## Troubleshooting

### Common Issues:

1. **Connection refused:** Check if PostgreSQL is running
```bash
sudo systemctl status postgresql
# or
brew services list | grep postgresql
```

2. **Access denied:** Verify username/password in `.env.local`

3. **Database doesn't exist:** Make sure you created the database and ran migrations

4. **Permission issues:** Grant proper privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE animal_sanctuary_capstone TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA animal_sanctuary_capstone TO postgres;
```

### Test Database Connection Directly:
```bash
psql -U postgres -d animal_sanctuary_capstone -c "SELECT COUNT(*) FROM animal_sanctuary_capstone.animals;"
```

## Next Steps

After database setup is complete, you can:

1. **View the animals browsing page** with real data
2. **Test the search and filtering** functionality
3. **Add new animals** through the API
4. **Build the animal detail pages** (next development phase)
5. **Create the staff dashboard** for animal management

The frontend is now fully integrated with Next.js API routes that connect directly to your PostgreSQL database using Drizzle ORM!