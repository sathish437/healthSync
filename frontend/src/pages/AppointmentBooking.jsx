import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, ChevronRight, Star, ShieldCheck, Heart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentBooking = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchDoctor();
        fetchHospitals();
    }, [doctorId]);

    useEffect(() => {
        fetchSlots();
        setSelectedSlot(null);
    }, [date, doctorId]);

    const fetchDoctor = async () => {
        try {
            const res = await axios.get(`/api/doctors/${doctorId}`);
            setDoctor(res.data);
        } catch (err) { navigate('/'); }
    };

    const fetchHospitals = async () => {
        try {
            const res = await axios.get('/api/appointments/hospitals');
            setHospitals(res.data);
            if (res.data.length > 0) setSelectedHospital(res.data[0].id);
        } catch (err) { console.error(err); }
    };

    const fetchSlots = async () => {
        try {
            const res = await axios.get(`/api/appointments/slots/${doctorId}/${date}`);
            setSlots(res.data);
        } catch (err) { setSlots([]); }
    };

    const handleBooking = async () => {
        if (!user) { navigate('/login'); return; }
        if (!selectedSlot || !selectedHospital) return;

        setLoading(true);
        try {
            await axios.post('/api/appointments/book', {
                patientId: user.id,
                doctorId: parseInt(doctorId),
                slotId: selectedSlot.id,
                hospitalId: selectedHospital,
                reason: reason
            });
            setMessage('success');
            setTimeout(() => navigate('/history'), 2000);
        } catch (err) {
            setMessage('error');
        } finally {
            setLoading(false);
        }
    };

    if (!doctor) return (
        <div className="ds-flex ds-justify-center ds-items-center ds-py-16">
            <div className="ds-spinner ds-mr-3" />
            <span className="ds-body ds-text-secondary">Loading doctor information...</span>
        </div>
    );

    return (
        <div className="ds-dashboard-grid">
            {/* Left Side: Doctor Profile */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ds-col-4"
            >
                <div className="ds-card ds-text-center">
                    {/* Doctor Avatar */}
                    <div className="ds-flex ds-justify-center ds-mb-5">
                        <div className="ds-w-24 ds-h-24 ds-rounded-2xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center ds-font-bold ds-text-3xl">
                            {doctor.name.charAt(0)}
                        </div>
                    </div>

                    <h2 className="ds-h2 ds-mb-2">{doctor.name}</h2>
                    <span className="ds-badge ds-badge-primary ds-mb-5">{doctor.specialization}</span>

                    {/* Stats */}
                    <div className="ds-flex ds-gap-3 ds-mb-5 ds-justify-center">
                        <div className="ds-card ds-p-3 ds-flex-1">
                            <p className="ds-caption ds-mb-1">Rating</p>
                            <p className="ds-h3 ds-text-accent ds-flex ds-items-center ds-gap-1 ds-justify-center">
                                <Star size={16} fill="currentColor" /> 4.9
                            </p>
                        </div>
                        <div className="ds-card ds-p-3 ds-flex-1">
                            <p className="ds-caption ds-mb-1">Experience</p>
                            <p className="ds-h3">{doctor.experience || '10+'}y</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="ds-card ds-bg-primary/5 ds-text-left">
                        <Heart size={18} className="ds-text-error ds-mb-2" />
                        <p className="ds-body-sm ds-text-secondary">
                            {doctor.description || "Leading specialist utilizing cutting-edge healthcare technology to deliver unparalleled patient care."}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side: Booking Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ds-col-8"
            >
                <div className="ds-card ds-card-elevated">
                    {/* Header */}
                    <div className="ds-flex ds-items-center ds-gap-4 ds-mb-6">
                        <div className="ds-w-12 ds-h-12 ds-rounded-xl ds-bg-primary ds-text-white ds-flex ds-items-center ds-justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="ds-h2">Book Appointment</h3>
                            <p className="ds-body-sm ds-text-secondary">Select your preferred date and time slot</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="ds-form">
                        <div className="ds-form-row">
                            <div className="ds-input-group">
                                <label className="ds-label">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="ds-input"
                                />
                            </div>
                            <div className="ds-input-group">
                                <label className="ds-label">Hospital</label>
                                <select
                                    value={selectedHospital}
                                    onChange={(e) => setSelectedHospital(e.target.value)}
                                    className="ds-input"
                                >
                                    {hospitals.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="ds-input-group">
                            <label className="ds-label">Reason for Visit</label>
                            <textarea
                                rows="3"
                                placeholder="Briefly describe your health concern or symptoms..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="ds-input ds-resize-none"
                            />
                        </div>

                        {/* Time Slots */}
                        <div>
                            <label className="ds-label ds-mb-3">Available Time Slots</label>
                            {slots.length === 0 ? (
                                <div className="ds-card ds-py-8 ds-text-center ds-border-dashed">
                                    <p className="ds-body ds-text-secondary">No slots available for this date. Please select another.</p>
                                </div>
                            ) : (
                                <div className="ds-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {slots.map(slot => (
                                        <motion.button
                                            key={slot.id}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`ds-btn ds-btn-sm ${selectedSlot?.id === slot.id ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                                        >
                                            {slot.time}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`ds-mt-5 ds-p-4 ds-rounded-xl ${message === 'success' ? 'ds-bg-accent/10 ds-text-accent' : 'ds-bg-error/10 ds-text-error'}`}
                            >
                                <p className="ds-body-sm ds-font-medium">
                                    {message === 'success' ? 'Booking confirmed! Redirecting...' : 'This slot has been reserved. Please select another.'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleBooking}
                        disabled={!selectedSlot || loading}
                        className="ds-btn ds-btn-primary ds-w-full ds-mt-6"
                    >
                        {loading ? (
                            <span className="ds-flex ds-items-center ds-gap-2">
                                <span className="ds-spinner" />
                                Processing...
                            </span>
                        ) : (
                            <span className="ds-flex ds-items-center ds-gap-2">
                                Confirm Booking <ChevronRight size={18} />
                            </span>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default AppointmentBooking;
