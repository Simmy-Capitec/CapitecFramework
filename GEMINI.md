# Gemini Workspace

This document provides instructions for interacting with the CapitecFramework-S project.

## About the Project

This project is a comprehensive Playwright test automation framework. It uses a Page Object Model architecture and includes tests for web UI, APIs, and databases.

## Getting Started

To get started, you need to install the project dependencies:

```bash
npm install
```

## Running Tests

The following commands can be used to run the Playwright tests:

*   **Run all tests:** `npm test`
*   **Run tests in Chrome:** `npm run test:chrome`
*   **Run tests in Firefox:** `npm run test:firefox`
*   **Run tests in Safari:** `npm run test:safari`
*   **Run tests in mobile Chrome:** `npm run test:mobile`
*   **Run tests in debug mode:** `npm run test:debug`
*   **Run tests with the UI:** `npm run test:ui`
*   **Run tests in headed mode:** `npm run test:headed`

## API Server

The project includes an Express.js API server. To start the server, run:

```bash
node src/api-server.js
```

## Database

The project uses a MySQL database. The following scripts are available for managing the database:

*   **Backup the database:** `node scripts/backup-database.js`
*   **Restore the database:** `node scripts/restore-database.js`
*   **Sync the API and database:** `node scripts/sync-api-database.js`
