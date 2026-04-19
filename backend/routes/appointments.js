const express = require('express');
const router = express.Router();
const db = require('../db');

// Get available slots for a doctor on a specific date
router.get('/slots/:doctorId/:date', async (req, res) => {
    const { doctorId, date } = req.params;
    try {
        const [rows] = await db.execute(
            "SELECT * FROM slots WHERE doctor_id = ? AND date = ? AND is_available = true",
            [doctorId, date]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Book appointment
router.post('/book', async (req, res) => {
    const { patientId, doctorId, slotId, reason } = req.body;
    const connection = await db.getConnection();
    const io = req.app.get('socketio');

    if (!patientId || !doctorId || !slotId) {
        return res.status(400).json({ error: 'Patient, doctor, and slot are required' });
    }

    try {
        await connection.beginTransaction();

        // Check if slot is still available
        const [slots] = await connection.execute(
            "SELECT is_available FROM slots WHERE id = ? FOR UPDATE",
            [slotId]
        );

        if (slots.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Slot not found' });
        }

        if (slots[0].is_available === false) {
            await connection.rollback();
            return res.status(400).json({ error: 'Slot is no longer available' });
        }

        // Create appointment with pending status
        const [result] = await connection.execute(
            `INSERT INTO appointments (patient_id, doctor_id, slot_id, reason, status) 
             VALUES (?, ?, ?, ?, 'pending') RETURNING id`,
            [patientId, doctorId, slotId, reason || null]
        );

        // Mark slot as unavailable
        await connection.execute(
            `UPDATE slots SET is_available = false WHERE id = ?`,
            [slotId]
        );

        await connection.commit();

        const appointmentId = result[0]?.id;

        // Notify doctor in real-time
        io.to(`doctor_${doctorId}`).emit('new_appointment', {
            appointmentId,
            patientId,
            slotId
        });

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointmentId,
            status: 'pending'
        });
    } catch (err) {
        await connection.rollback();
        console.error('Booking error:', err);
        res.status(500).json({ error: 'Booking failed: ' + err.message });
    } finally {
        connection.release();
    }
});

// Update appointment status (Accept/Reject/Complete)
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const io = req.app.get('socketio');

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get appointment details
        const [appointments] = await connection.execute(
            "SELECT patient_id, doctor_id, slot_id, status as current_status FROM appointments WHERE id = ?",
            [req.params.id]
        );

        if (appointments.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = appointments[0];

        // If rejecting, make the slot available again
        if (status === 'rejected') {
            await connection.execute(
                "UPDATE slots SET is_available = true WHERE id = ?",
                [appointment.slot_id]
            );
        }

        // Update appointment status
        await connection.execute(
            "UPDATE appointments SET status = ? WHERE id = ?",
            [status, req.params.id]
        );

        await connection.commit();

        // Notify patient of status change
        io.to(`patient_${appointment.patient_id}`).emit('appointment_updated', {
            appointmentId: req.params.id,
            status
        });

        // Notify doctor's queue
        io.to(`doctor_${appointment.doctor_id}`).emit('queue_updated', {
            appointmentId: req.params.id,
            status
        });

        res.json({ message: `Appointment ${status}`, appointmentId: req.params.id });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Get appointments for a patient
router.get('/patient/:patientId', async (req, res) => {
    const query = `
        SELECT a.*, d.name as doctor_name, d.specialization, d.hospital_name,
               s.date, s.time
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN slots s ON a.slot_id = s.id
        WHERE a.patient_id = ?
        ORDER BY s.date DESC, s.time DESC
    `;
    try {
        const [rows] = await db.execute(query, [req.params.patientId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
    const query = `
        SELECT a.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone,
               u.age as patient_age, u.gender as patient_gender, u.address as patient_address,
               s.date, s.time
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN slots s ON a.slot_id = s.id
        WHERE a.doctor_id = ?
        ORDER BY CASE a.status 
            WHEN 'pending' THEN 1 
            WHEN 'accepted' THEN 2 
            WHEN 'completed' THEN 3 
            WHEN 'rejected' THEN 4 
            ELSE 5 
        END, s.date ASC, s.time ASC
    `;
    try {
        const [rows] = await db.execute(query, [req.params.doctorId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single appointment details
router.get('/:id', async (req, res) => {
    const query = `
        SELECT a.*, d.name as doctor_name, d.specialization, d.hospital_name,
               u.name as patient_name, s.date, s.time
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON a.patient_id = u.id
        JOIN slots s ON a.slot_id = s.id
        WHERE a.id = ?
    `;
    try {
        const [rows] = await db.execute(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
