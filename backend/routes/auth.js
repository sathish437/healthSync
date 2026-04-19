const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_healthcare_123';

// Register with role-specific fields
router.post('/register', async (req, res) => {
    const {
        email, password, role,
        // Common fields
        name, phone,
        // Patient specific
        age, gender, address,
        // Doctor specific
        specialization, experience, hospitalName, consultationFee, description
    } = req.body;

    // Debug logging
    console.log('Register request body:', req.body);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || !role || !name) {
        console.log('Validation failed:', { email: !!email, password: !!password, role: !!role, name: !!name });
        return res.status(400).json({ error: 'Email, password, role, and name are required' });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!['patient', 'doctor'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Create user account
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            `INSERT INTO users (name, email, password, role, phone, age, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [name, email, hashedPassword, role, phone || null, age || null, gender || null, address || null]
        );

        const userId = userResult[0]?.id;

        // If doctor, create doctor profile
        if (role === 'doctor') {
            if (!specialization) {
                await connection.rollback();
                return res.status(400).json({ error: 'Specialization is required for doctors' });
            }

            await connection.execute(
                `INSERT INTO doctors (user_id, name, specialization, experience, hospital_name, consultation_fee, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    name,
                    specialization,
                    experience || null,
                    hospitalName || null,
                    consultationFee || 0,
                    description || null
                ]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Registration successful', userId });
    } catch (error) {
        await connection.rollback();
        console.error('Registration Error:', error);

        if (error.code === '23505' || error.message?.includes('unique constraint') || error.message?.includes('duplicate')) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    } finally {
        connection.release();
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT u.*, d.id as doctor_id 
            FROM users u 
            LEFT JOIN doctors d ON u.id = d.user_id 
            WHERE u.email = ?
        `;
        const [rows] = await db.execute(query, [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, doctorId: user.doctor_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                doctorId: user.doctor_id,
                age: user.age,
                gender: user.gender,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
});

module.exports = router;
