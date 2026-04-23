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

// =======================
// 🔥 SOCKET.IO SETUP
// =======================
const io = new Server(server, {
cors: {
origin: "*",
methods: ["GET", "POST", "PATCH"]
}
});

const PORT = process.env.PORT || 5000;

// =======================
// 🔥 MIDDLEWARE
// =======================
app.use(cors({ origin: '*' }));
app.use(express.json());

// =======================
// ✅ API ROUTES
// =======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));

// =======================
// 🔥 SOCKET EVENTS
// =======================
io.on('connection', (socket) => {
console.log('🆕 User connected:', socket.id);


socket.on('join_doctor_queue', (doctorId) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`Doctor queue joined: ${doctorId}`);
});

socket.on('join_patient_updates', (patientId) => {
    socket.join(`patient_${patientId}`);
    console.log(`Patient updates joined: ${patientId}`);
});

socket.on('disconnect', () => {
    console.log('❌ User disconnected');
});


});

// Attach io to app
app.set('socketio', io);

// =======================
// 🔥 DATABASE INIT
// =======================
async function ensureTablesExist() {
try {
console.log('🔍 Checking database...');


    const [usersTable] = await db.query(
        "SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = 'users'"
    );

    if (usersTable.length === 0) {
        console.log('⚠️ Initializing DB...');
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        await db.query(sql);
        console.log('✅ DB Initialized');
        return;
    }

    console.log('✅ DB Ready');
} catch (err) {
    console.error('❌ DB Error:', err.message);
}


}

// =======================
// 🔥 SERVE FRONTEND
// =======================

// 👉 Adjust this ONLY if your structure is different
const frontendPath = path.join(__dirname, '../frontend/dist');

// Serve static files
app.use(express.static(frontendPath));

// React Router fallback (IMPORTANT)
app.get('*', (req, res, next) => {
if (req.path.startsWith('/api')) return next();
res.sendFile(path.join(frontendPath, 'index.html'));
});

// =======================
// 🚀 START SERVER
// =======================
server.listen(PORT, async () => {
console.log(`Server running on port ${PORT}`);
await ensureTablesExist();
});
