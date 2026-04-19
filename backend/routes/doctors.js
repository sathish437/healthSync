const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all doctors with their available slots
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT d.*, 
                   (SELECT COUNT(*) FROM slots WHERE doctor_id = d.id AND is_available = true) as available_slots
            FROM doctors d
            ORDER BY d.name
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search/filter doctors
router.get('/search', async (req, res) => {
    const { specialization, hospital, minFee, maxFee } = req.query;
    try {
        let query = 'SELECT d.* FROM doctors d WHERE 1=1';
        const params = [];

        if (specialization) {
            query += ' AND d.specialization LIKE ?';
            params.push(`%${specialization}%`);
        }
        if (hospital) {
            query += ' AND d.hospital_name LIKE ?';
            params.push(`%${hospital}%`);
        }
        if (minFee) {
            query += ' AND d.consultation_fee >= ?';
            params.push(minFee);
        }
        if (maxFee) {
            query += ' AND d.consultation_fee <= ?';
            params.push(maxFee);
        }

        query += ' ORDER BY d.consultation_fee ASC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get doctor by ID with slots
router.get('/:id', async (req, res) => {
    try {
        const [doctorRows] = await db.execute(
            'SELECT * FROM doctors WHERE id = ?',
            [req.params.id]
        );
        if (doctorRows.length === 0) return res.status(404).json({ error: 'Doctor not found' });

        const doctor = doctorRows[0];

        // Get available slots
        const [slotRows] = await db.execute(
            'SELECT * FROM slots WHERE doctor_id = ? AND is_available = true AND date >= CURRENT_DATE ORDER BY date, time',
            [req.params.id]
        );

        doctor.slots = slotRows;
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get doctor profile by user ID
router.get('/profile/:userId', async (req, res) => {
    try {
        const query = `
            SELECT d.*, u.email, u.phone, u.age, u.gender, u.address
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ?
        `;
        const [rows] = await db.execute(query, [req.params.userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Doctor profile not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update doctor profile
router.put('/profile/:userId', async (req, res) => {
    const {
        name, specialization, experience, hospitalName,
        consultationFee, description, phone, age, gender, address
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Update doctors table
        await connection.execute(
            `UPDATE doctors SET name=?, specialization=?, experience=?, hospital_name=?, consultation_fee=?, description=? WHERE user_id=?`,
            [name, specialization, experience, hospitalName, consultationFee, description, req.params.userId]
        );

        // Update users table
        await connection.execute(
            `UPDATE users SET name=?, phone=?, age=?, gender=?, address=? WHERE id=?`,
            [name, phone, age, gender, address, req.params.userId]
        );

        await connection.commit();
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Get doctor's slots
router.get('/:id/slots', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM slots WHERE doctor_id = ? ORDER BY date, time',
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add slots for doctor
router.post('/:id/slots', async (req, res) => {
    const { date, times } = req.body;
    const doctorId = req.params.id;

    if (!date || !times || !Array.isArray(times) || times.length === 0) {
        return res.status(400).json({ error: 'Date and times array are required' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const addedSlots = [];
        const skippedSlots = [];

        for (const time of times) {
            // Check for duplicate
            const [existing] = await connection.execute(
                'SELECT id FROM slots WHERE doctor_id = ? AND date = ? AND time = ?',
                [doctorId, date, time]
            );

            if (existing.length > 0) {
                skippedSlots.push(time);
                continue;
            }

            const [result] = await connection.execute(
                'INSERT INTO slots (doctor_id, date, time, is_available) VALUES (?, ?, ?, true) RETURNING id',
                [doctorId, date, time]
            );
            addedSlots.push({ id: result[0]?.id, date, time });
        }

        await connection.commit();
        res.status(201).json({
            message: 'Slots processed',
            added: addedSlots,
            skipped: skippedSlots
        });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Delete slot
router.delete('/slots/:slotId', async (req, res) => {
    try {
        await db.execute('DELETE FROM slots WHERE id = ?', [req.params.slotId]);
        res.json({ message: 'Slot deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
