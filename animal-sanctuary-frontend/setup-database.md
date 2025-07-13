# 🗄️ Animal Sanctuary Database Setup Guide

## Quick Setup Instructions

### **Step 1: Install MySQL (if not installed)**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS (with Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Windows:**
- Download MySQL from https://dev.mysql.com/downloads/mysql/
- Run the installer and follow the setup wizard

### **Step 2: Create the Database**

1. **Login to MySQL:**
```bash
mysql -u root -p
```

2. **Run the schema file:**
```sql
SOURCE /home/chris/Documents/CapitecFramework-S/sql-module/capstone/animal-sanctuary-capstone-schema.sql;
```

Or directly from command line:
```bash
mysql -u root -p < /home/chris/Documents/CapitecFramework-S/sql-module/capstone/animal-sanctuary-capstone-schema.sql
```

### **Step 3: Configure Environment Variables**

Update your `.env.local` file with your MySQL credentials:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DATABASE_NAME=animal_sanctuary_capstone`
DATABASE_SSL=false
DATABASE_CONNECTION_LIMIT=10
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

1. **Connection refused:** Check if MySQL is running
```bash
sudo systemctl status mysql
# or
brew services list | grep mysql
```

2. **Access denied:** Verify username/password in `.env.local`

3. **Database doesn't exist:** Make sure you ran the schema file

4. **Permission issues:** Grant proper privileges:
```sql
GRANT ALL PRIVILEGES ON animal_sanctuary_capstone.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Test Database Connection Directly:
```bash
mysql -u root -p -e "USE animal_sanctuary_capstone; SELECT COUNT(*) FROM animals;"
```

## Next Steps

After database setup is complete, you can:

1. **View the animals browsing page** with real data
2. **Test the search and filtering** functionality
3. **Add new animals** through the API
4. **Build the animal detail pages** (next development phase)
5. **Create the staff dashboard** for animal management

The frontend is now fully integrated with Next.js API routes that connect directly to your MySQL database!