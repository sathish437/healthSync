const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.on('connect', () => {
    console.log('PostgreSQL Connection Pool connected to Neon database');
});

pool.on('error', (err) => {
    console.error('PostgreSQL Pool Error:', err.message);
});

// Wrapper for query method to maintain compatibility with existing code
const db = {
    query: async (sql, params) => {
        // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
        let pgSql = sql;
        let paramIndex = 1;
        while (pgSql.includes('?') && params && params.length > 0) {
            pgSql = pgSql.replace('?', `$${paramIndex}`);
            paramIndex++;
        }
        
        // Convert MySQL-specific syntax to PostgreSQL
        pgSql = pgSql
            .replace(/`([^`]+)`/g, '"$1"') // Backticks to double quotes
            .replace(/LIMIT \?(\s*,\s*\?)?/g, 'LIMIT $' + (paramIndex - (params?.length || 0)))
            .replace(/SHOW COLUMNS FROM ([^\s]+) LIKE \?/g, 'SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2')
            .replace(/SHOW COLUMNS FROM ([^\s]+)/g, 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1');

        try {
            const result = await pool.query(pgSql, params);
            // Return in MySQL-compatible format [rows, fields]
            return [result.rows, result.fields];
        } catch (err) {
            console.error('Query Error:', err.message);
            throw err;
        }
    },
    
    execute: async (sql, params) => {
        return db.query(sql, params);
    },
    
    getConnection: async () => {
        const client = await pool.connect();
        return {
            query: async (sql, params) => {
                let pgSql = sql;
                let paramIndex = 1;
                while (pgSql.includes('?') && params && params.length > 0) {
                    pgSql = pgSql.replace('?', `$${paramIndex}`);
                    paramIndex++;
                }
                const result = await client.query(pgSql, params);
                return [result.rows, result.fields];
            },
            execute: async (sql, params) => {
                let pgSql = sql;
                let paramIndex = 1;
                while (pgSql.includes('?') && params && params.length > 0) {
                    pgSql = pgSql.replace('?', `$${paramIndex}`);
                    paramIndex++;
                }
                const result = await client.query(pgSql, params);
                return [result.rows, result.fields];
            },
            beginTransaction: async () => {
                await client.query('BEGIN');
            },
            commit: async () => {
                await client.query('COMMIT');
            },
            rollback: async () => {
                await client.query('ROLLBACK');
            },
            release: () => {
                client.release();
            }
        };
    }
};

module.exports = db;
