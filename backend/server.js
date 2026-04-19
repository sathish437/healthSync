const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));

app.get('/', (req, res) => {
    res.send('Healthcare API is running');
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('🆕 User connected to HealthSync Real-time:', socket.id);

    socket.on('join_doctor_queue', (doctorId) => {
        socket.join(`doctor_${doctorId}`);
        console.log(`👨‍⚕️ Socket ${socket.id} joined queue for Doctor ${doctorId}`);
    });

    socket.on('join_patient_updates', (patientId) => {
        socket.join(`patient_${patientId}`);
        console.log(`👤 Socket ${socket.id} joined updates for Patient ${patientId}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected');
    });
});

// Attach io to app for use in routes
app.set('socketio', io);

// Auto-Initialization Function
async function ensureTablesExist() {
    try {
        console.log('🔍 Verifying HealthSync Database Tables...');
        
        // Check if users table exists using PostgreSQL query
        const [usersTable] = await db.query(
            "SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = 'users'"
        );

        if (usersTable.length === 0) {
            console.log('⚠️ Tables missing. Initializing database from database.sql...');
            const sqlPath = path.join(__dirname, 'database.sql');
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await db.query(sql);
            console.log('✨ Database Auto-Initialization Complete!');
            return;
        }

        // --- MIGRATIONS for HealthSync on PostgreSQL ---
        
        // 1. Check if role column has correct constraints
        const [roleCol] = await db.query(
            "SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'"
        );
        if (roleCol.length > 0 && roleCol[0].data_type === 'character varying') {
            console.log('✅ Role column is using VARCHAR with CHECK constraint');
        }

        // 2. Check if age column exists
        const [ageCol] = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age'"
        );
        if (ageCol.length === 0) {
            console.log('⚠️ Migration: Adding age column to users...');
            await db.query("ALTER TABLE users ADD COLUMN age INTEGER");
        }

        // 3. Check if gender column exists
        const [genderCol] = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender'"
        );
        if (genderCol.length === 0) {
            console.log('⚠️ Migration: Adding gender column to users...');
            await db.query("ALTER TABLE users ADD COLUMN gender VARCHAR(20)");
        }

        // 4. Check if address column exists
        const [addressCol] = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address'"
        );
        if (addressCol.length === 0) {
            console.log('⚠️ Migration: Adding address column to users...');
            await db.query("ALTER TABLE users ADD COLUMN address TEXT");
        }

        // 5. Check if hospital_name column exists in doctors
        const [hospitalCol] = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'hospital_name'"
        );
        if (hospitalCol.length === 0) {
            console.log('⚠️ Migration: Adding hospital_name column to doctors...');
            await db.query("ALTER TABLE doctors ADD COLUMN hospital_name VARCHAR(255)");
        }

        // 6. Check if consultation_fee column exists in doctors
        const [feeCol] = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'consultation_fee'"
        );
        if (feeCol.length === 0) {
            console.log('⚠️ Migration: Adding consultation_fee column to doctors...');
            await db.query("ALTER TABLE doctors ADD COLUMN consultation_fee NUMERIC(10,2) DEFAULT 0");
        }

        console.log('✅ HealthSync database verified and migrated.');
    } catch (err) {
        console.error('❌ Database Error:', err.message);
        // Don't throw error here to allow server to start even if migration fails
    }
}

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await ensureTablesExist();
});
