const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
    console.log('------------------------------------------------');
    console.log('🩺 HEALTHSYNC DATABASE INITIALIZER');
    console.log('------------------------------------------------');

    // 1. Connect without database first to ensure DB exists
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true // Allow execution of the whole file at once
    };

    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connected to MySQL server.');

        const dbName = process.env.DB_NAME || 'healthcare_db';

        // 2. Create Database
        console.log(`🔨 Creating database: ${dbName}...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        await connection.query(`USE ${dbName}`);
        console.log(`✅ Database ${dbName} is ready.`);

        // 3. Read and execute SQL file
        const sqlPath = path.join(__dirname, 'database.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('📝 Reading database.sql...');

        // Execute the entire SQL file at once using multipleStatements: true
        await connection.query(sql);
        console.log('🚀 All tables created and seed data inserted!');

        console.log('------------------------------------------------');
        console.log('✨ DATABASE REPAIR COMPLETE!');
        console.log('------------------------------------------------');

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ CRITICAL INITIALIZATION ERROR:');
        console.error(err.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

initializeDatabase();
