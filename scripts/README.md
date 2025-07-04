# Database Management Scripts

## 🎯 Overview

This directory contains scripts for managing the SQL training database, including synchronization checks, backups, and restores. These tools ensure data integrity and provide the ability to reset to known good states.

## 📁 Scripts Overview

### 🔄 `sync-api-database.js`
**Purpose:** Validate API-Database synchronization and generate reports
- Compares database schema with API endpoints
- Checks data consistency and referential integrity
- Generates comprehensive sync reports
- Identifies orphaned records and validation issues

### 📦 `backup-database.js`
**Purpose:** Create complete database backups
- Full schema and data backup using mysqldump
- Timestamped backup files
- Maintains a baseline backup for easy restore
- Includes table statistics and metadata

### 🔄 `restore-database.js`
**Purpose:** Restore database from backup files
- Interactive backup selection
- Baseline restore (current snapshot)
- Latest backup restore
- Validation and confirmation prompts

## 🚀 Quick Start

### Create Baseline Backup
```bash
# Create backup of current state (including test data)
node backup-database.js
```

### Run Tests and Restore
```bash
# Run your tests
npx playwright test tests/api/

# Restore to clean baseline state
node restore-database.js --baseline --yes
```

### Check Synchronization
```bash
# Full sync check with report
node sync-api-database.js

# Quick consistency check only
node sync-api-database.js --check-only
```

## 📖 Detailed Usage

### 📦 Backup Operations

#### Create New Backup
```bash
node backup-database.js
```
- Creates timestamped backup file
- Updates baseline backup
- Shows table statistics
- Displays backup summary

#### Backup Information
```bash
node backup-database.js --info
```
- Lists all available backups
- Shows file sizes and dates
- Identifies baseline backup

### 🔄 Restore Operations

#### Interactive Restore
```bash
node restore-database.js
```
- Shows list of available backups
- Prompts for selection
- Confirms before restore
- Validates backup file

#### Baseline Restore (Recommended)
```bash
node restore-database.js --baseline
```
- Restores to the snapshot taken when backup-database.js was first run
- This includes test data and current state
- Fastest way to reset to known good state

#### Latest Backup Restore
```bash
node restore-database.js --latest
```
- Restores from most recent timestamped backup
- Excludes baseline backup

#### Specific File Restore
```bash
node restore-database.js --file path/to/backup.sql
```
- Restore from specific backup file
- Validates file before restore

#### Silent Restore
```bash
node restore-database.js --baseline --yes
```
- Skips confirmation prompt
- Useful for automated scripts

#### List Available Backups
```bash
node restore-database.js --list
```
- Shows all backup files
- No restore operation

### 🔍 Synchronization Checks

#### Full Sync Analysis
```bash
node sync-api-database.js
```
- Complete database schema analysis
- API endpoint validation
- Data consistency checks
- Generates JSON report

#### Quick Check
```bash
node sync-api-database.js --check-only
```
- Basic consistency validation
- No report generation
- Faster execution

#### Help and Options
```bash
node sync-api-database.js --restore
```
- Shows restore command examples
- Quick reference guide

## 📁 File Structure

```
scripts/
├── backup-database.js          # Database backup tool
├── restore-database.js         # Database restore tool
├── sync-api-database.js        # API-DB sync validator
├── backups/                    # Backup storage directory
│   ├── baseline_backup.sql     # Current state snapshot
│   └── sql_training_backup_*.sql  # Timestamped backups
└── sync-report-*.json          # Sync analysis reports
```

## 🎯 Workflow Examples

### Test Development Workflow
```bash
# 1. Create baseline before starting
node backup-database.js

# 2. Develop and run tests
npx playwright test tests/api/

# 3. Restore to clean state
node restore-database.js --baseline --yes

# 4. Verify sync
node sync-api-database.js --check-only
```

### Debugging Data Issues
```bash
# 1. Create backup before investigation
node backup-database.js

# 2. Investigate issues
node sync-api-database.js

# 3. Check specific problems
mysql -u sqltraining -ptraining123 sql_training

# 4. Restore if needed
node restore-database.js --baseline
```

### Presentation Setup
```bash
# 1. Ensure clean state
node restore-database.js --baseline

# 2. Verify everything is working
node sync-api-database.js --check-only

# 3. Start API server
node src/api-server.js

# 4. Run demonstration tests
npx playwright test tests/api/01-basic-get-requests.spec.js --headed
```

## 🔧 Configuration

### Database Connection
All scripts use the same configuration:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training'
};
```

### Backup Location
- **Directory:** `scripts/backups/`
- **Baseline:** `baseline_backup.sql`
- **Timestamped:** `sql_training_backup_YYYY-MM-DDTHH-mm-ss-sssZ.sql`

## ⚠️ Important Notes

### Baseline Backup
- The **baseline backup** contains the current state including test data
- This is NOT the original clean database state
- It represents a "known good" state after initial setup and testing
- Use this for day-to-day resets, not pristine cleanup

### Data Safety
- **Always confirm** before restore operations
- **Backup before** major changes or investigations
- **Test restores** in development before using in presentations

### Performance
- Backup operations are fast (~1-2 seconds)
- Restore operations depend on data size
- Sync checks are comprehensive but may take 10-30 seconds

### Troubleshooting
```bash
# If backup fails
ls -la scripts/backups/  # Check permissions
mysql -u sqltraining -ptraining123 -e "SHOW DATABASES;"  # Test connection

# If restore fails
node restore-database.js --list  # Verify backup files exist
file scripts/backups/baseline_backup.sql  # Check file integrity

# If sync fails
curl http://localhost:3000/users  # Test API server
mysql -u sqltraining -ptraining123 sql_training -e "SHOW TABLES;"  # Test DB
```

## 🎓 Educational Value

These scripts demonstrate:
- **Database Administration:** Backup/restore best practices
- **Data Integrity:** Validation and consistency checking
- **DevOps Workflows:** Automated database management
- **Error Handling:** Robust script design
- **CLI Tools:** Professional command-line interfaces

Students can learn from these scripts and adapt them for their own projects.

---

*These scripts provide a complete database management solution for the SQL training environment.*