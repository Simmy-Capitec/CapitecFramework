#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * Creates a complete backup of the current database state including:
 * - Schema structure
 * - All data
 * - Auto-increment values
 * - Indexes and constraints
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'scripts', 'backups');
    const backupFile = path.join(backupDir, `sql_training_backup_${timestamp}.sql`);
    const baselineFile = path.join(backupDir, 'baseline_backup.sql');
    
    try {
        // Ensure backup directory exists
        await fs.mkdir(backupDir, { recursive: true });
        
        log('🗄️  Creating database backup...', 'blue');
        
        // Create mysqldump command
        const dumpCommand = `mysqldump ` +
            `--host=${dbConfig.host} ` +
            `--user=${dbConfig.user} ` +
            `--password=${dbConfig.password} ` +
            `--single-transaction ` +
            `--routines ` +
            `--triggers ` +
            `--complete-insert ` +
            `--extended-insert ` +
            `--add-drop-table ` +
            `--disable-keys ` +
            `--lock-tables=false ` +
            `${dbConfig.database}`;
        
        // Execute backup
        log(`📦 Backing up database to: ${backupFile}`, 'yellow');
        const backupData = execSync(dumpCommand, { encoding: 'utf8' });
        
        // Add metadata header
        const metadata = `-- SQL Training Database Backup
-- Created: ${new Date().toISOString()}
-- Database: ${dbConfig.database}
-- Host: ${dbConfig.host}
-- 
-- This backup contains the complete database structure and data
-- Use restore-database.js to restore this backup
--
-- Statistics at time of backup:

`;
        
        // Get table statistics
        const statsCommand = `mysql ` +
            `--host=${dbConfig.host} ` +
            `--user=${dbConfig.user} ` +
            `--password=${dbConfig.password} ` +
            `--database=${dbConfig.database} ` +
            `--execute="SELECT 
                TABLE_NAME as 'Table', 
                TABLE_ROWS as 'Rows',
                ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size (MB)'
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = '${dbConfig.database}' 
                ORDER BY TABLE_NAME;"`;
        
        const stats = execSync(statsCommand, { encoding: 'utf8' });
        
        // Combine metadata and backup
        const completeBackup = metadata + '-- ' + stats.split('\n').join('\n-- ') + '\n\n' + backupData;
        
        // Write timestamped backup
        await fs.writeFile(backupFile, completeBackup);
        log(`✅ Backup created: ${backupFile}`, 'green');
        
        // Create/update baseline backup
        await fs.writeFile(baselineFile, completeBackup);
        log(`📋 Baseline backup updated: ${baselineFile}`, 'green');
        
        // Get backup info
        const backupStats = await fs.stat(backupFile);
        const sizeMB = (backupStats.size / 1024 / 1024).toFixed(2);
        
        // Display summary
        log('=' .repeat(50), 'cyan');
        log('📊 BACKUP SUMMARY', 'bright');
        log(`  File: ${path.basename(backupFile)}`, 'reset');
        log(`  Size: ${sizeMB} MB`, 'reset');
        log(`  Location: ${backupDir}`, 'reset');
        log(`  Database: ${dbConfig.database}`, 'reset');
        log(`  Timestamp: ${new Date().toISOString()}`, 'reset');
        
        // Show table statistics
        log('\n📈 TABLE STATISTICS:', 'cyan');
        console.log(stats);
        
        log('✅ Backup completed successfully!', 'green');
        log('💡 Use restore-database.js to restore this backup', 'yellow');
        
        return {
            backupFile,
            baselineFile,
            size: sizeMB,
            timestamp
        };
        
    } catch (error) {
        log(`❌ Backup failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// CLI interface
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
    console.log(`
📦 Database Backup Script

Usage:
  node backup-database.js [options]

Options:
  --help, -h     Show this help message
  --quiet, -q    Quiet mode (minimal output)
  --info         Show backup information only

Examples:
  node backup-database.js                 # Create full backup
  node backup-database.js --quiet         # Create backup with minimal output
  node backup-database.js --info          # Show backup directory info
    `);
    process.exit(0);
}

if (process.argv[2] === '--info') {
    const backupDir = path.join(process.cwd(), 'scripts', 'backups');
    try {
        const files = await fs.readdir(backupDir);
        const backupFiles = files.filter(f => f.endsWith('.sql'));
        
        log('📁 BACKUP DIRECTORY INFO', 'bright');
        log(`  Location: ${backupDir}`, 'reset');
        log(`  Total backups: ${backupFiles.length}`, 'reset');
        
        if (backupFiles.length > 0) {
            log('\n📋 Available backups:', 'cyan');
            for (const file of backupFiles) {
                const filePath = path.join(backupDir, file);
                const stats = await fs.stat(filePath);
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                const isBaseline = file === 'baseline_backup.sql';
                const marker = isBaseline ? ' (BASELINE)' : '';
                log(`    ${file} - ${sizeMB} MB${marker}`, 'reset');
            }
        }
    } catch (error) {
        log('❌ No backup directory found', 'red');
    }
    process.exit(0);
}

// Run the backup
createBackup().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});