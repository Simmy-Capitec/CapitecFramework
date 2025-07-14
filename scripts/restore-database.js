#!/usr/bin/env node

/**
 * Database Restore Script
 * 
 * Restores database from backup files created by backup-database.js
 * Can restore from:
 * - Latest timestamped backup
 * - Baseline backup (current state snapshot)
 * - Specific backup file
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

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

function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function getBackupFiles() {
    const backupDir = path.join(process.cwd(), 'scripts', 'backups');
    
    try {
        const files = await fs.readdir(backupDir);
        const backupFiles = files.filter(f => f.endsWith('.sql')).sort().reverse(); // Most recent first
        
        return {
            backupDir,
            files: backupFiles
        };
    } catch (error) {
        throw new Error(`Backup directory not found: ${backupDir}`);
    }
}

async function validateBackupFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Basic validation
        if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
            throw new Error('Invalid backup file: Missing expected SQL content');
        }
        
        if (!content.includes(dbConfig.database)) {
            log(`⚠️  Warning: Backup may not be for database '${dbConfig.database}'`, 'yellow');
        }
        
        return true;
    } catch (error) {
        throw new Error(`Invalid backup file: ${error.message}`);
    }
}

async function restoreDatabase(backupFilePath, options = {}) {
    const { skipConfirmation = false, preserveUsers = false } = options;
    
    try {
        // Validate backup file
        await validateBackupFile(backupFilePath);
        
        // Get file info
        const stats = await fs.stat(backupFilePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        const fileName = path.basename(backupFilePath);
        
        // Show restore info
        log('🔄 DATABASE RESTORE', 'bright');
        log(`  File: ${fileName}`, 'reset');
        log(`  Size: ${sizeMB} MB`, 'reset');
        log(`  Database: ${dbConfig.database}`, 'reset');
        log(`  Host: ${dbConfig.host}`, 'reset');
        
        // Confirmation
        if (!skipConfirmation) {
            log('\n⚠️  WARNING: This will completely replace the current database!', 'red');
            log('All current data will be lost.', 'red');
            
            const answer = await askQuestion('\nDo you want to continue? (yes/no): ');
            if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
                log('❌ Restore cancelled by user', 'yellow');
                return;
            }
        }
        
        log('\n🗄️  Starting database restore...', 'blue');
        
        // Create restore command
        const restoreCommand = `mysql ` +
            `--host=${dbConfig.host} ` +
            `--user=${dbConfig.user} ` +
            `--password=${dbConfig.password} ` +
            `${dbConfig.database} < "${backupFilePath}"`;
        
        // Execute restore
        log('📥 Restoring database...', 'yellow');
        execSync(restoreCommand, { encoding: 'utf8' });
        
        // Verify restore
        log('✅ Verifying restore...', 'yellow');
        const verifyCommand = `mysql ` +
            `--host=${dbConfig.host} ` +
            `--user=${dbConfig.user} ` +
            `--password=${dbConfig.password} ` +
            `--database=${dbConfig.database} ` +
            `--execute="SELECT 
                TABLE_NAME as 'Table', 
                TABLE_ROWS as 'Rows'
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = '${dbConfig.database}' 
                ORDER BY TABLE_NAME;"`;
        
        const verification = execSync(verifyCommand, { encoding: 'utf8' });
        
        // Display results
        log('=' .repeat(50), 'cyan');
        log('📊 RESTORE SUMMARY', 'bright');
        log(`  Status: Completed successfully`, 'green');
        log(`  Restored from: ${fileName}`, 'reset');
        log(`  Database: ${dbConfig.database}`, 'reset');
        log(`  Restored at: ${new Date().toISOString()}`, 'reset');
        
        log('\n📈 RESTORED TABLES:', 'cyan');
        console.log(verification);
        
        log('✅ Database restore completed successfully!', 'green');
        log('💡 Use backup-database.js to create new backups', 'yellow');
        
    } catch (error) {
        log(`❌ Restore failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

async function selectBackupFile() {
    const { backupDir, files } = await getBackupFiles();
    
    if (files.length === 0) {
        throw new Error('No backup files found. Run backup-database.js first.');
    }
    
    log('📋 Available backups:', 'cyan');
    files.forEach((file, index) => {
        const isBaseline = file === 'baseline_backup.sql';
        const marker = isBaseline ? ' (BASELINE)' : '';
        log(`  ${index + 1}. ${file}${marker}`, 'reset');
    });
    
    const answer = await askQuestion(`\nSelect backup to restore (1-${files.length}): `);
    const selection = parseInt(answer) - 1;
    
    if (isNaN(selection) || selection < 0 || selection >= files.length) {
        throw new Error('Invalid selection');
    }
    
    return path.join(backupDir, files[selection]);
}

// CLI interface
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
    console.log(`
🔄 Database Restore Script

Usage:
  node restore-database.js [options] [file]

Options:
  --help, -h          Show this help message
  --baseline          Restore from baseline backup
  --latest            Restore from latest backup
  --list              List available backups
  --yes               Skip confirmation prompt
  --file <path>       Restore from specific file

Examples:
  node restore-database.js                    # Interactive mode
  node restore-database.js --baseline         # Restore baseline
  node restore-database.js --latest           # Restore latest
  node restore-database.js --file backup.sql  # Restore specific file
  node restore-database.js --baseline --yes   # No confirmation
    `);
    process.exit(0);
}

// Handle different options
async function main() {
    try {
        const args = process.argv.slice(2);
        const skipConfirmation = args.includes('--yes');
        
        if (args.includes('--list')) {
            const { files } = await getBackupFiles();
            log('📋 Available backups:', 'cyan');
            files.forEach((file, index) => {
                const isBaseline = file === 'baseline_backup.sql';
                const marker = isBaseline ? ' (BASELINE)' : '';
                log(`  ${index + 1}. ${file}${marker}`, 'reset');
            });
            return;
        }
        
        let backupFile;
        
        if (args.includes('--baseline')) {
            const { backupDir } = await getBackupFiles();
            backupFile = path.join(backupDir, 'baseline_backup.sql');
            
            try {
                await fs.access(backupFile);
            } catch {
                throw new Error('Baseline backup not found. Run backup-database.js first.');
            }
            
        } else if (args.includes('--latest')) {
            const { backupDir, files } = await getBackupFiles();
            const latestFile = files.find(f => f !== 'baseline_backup.sql');
            
            if (!latestFile) {
                throw new Error('No timestamped backups found.');
            }
            
            backupFile = path.join(backupDir, latestFile);
            
        } else if (args.includes('--file')) {
            const fileIndex = args.indexOf('--file') + 1;
            if (fileIndex >= args.length) {
                throw new Error('--file option requires a file path');
            }
            backupFile = args[fileIndex];
            
        } else {
            // Interactive mode
            backupFile = await selectBackupFile();
        }
        
        await restoreDatabase(backupFile, { skipConfirmation });
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        process.exit(1);
    }
}

main();