import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Stethoscope, Building, DollarSign, Clock, Calendar,
    CheckCircle, XCircle, ChevronRight, MapPin, FileText,
    User, Star, Filter, ArrowLeft
} from 'lucide-react';

const socket = io();

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('doctors');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [minFee, setMinFee] = useState('');
    const [maxFee, setMaxFee] = useState('');

    // Booking states
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [reason, setReason] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user?.id) {
            fetchData();
            socket.emit('join_patient_updates', user.id);
            socket.on('appointment_updated', fetchData);
        }
        return () => socket.off('appointment_updated');
    }, [user?.id]);

    const fetchData = async () => {
        try {
            const [doctorsRes, appointmentsRes] = await Promise.all([
                axios.get('/api/doctors'),
                axios.get(`/api/appointments/patient/${user.id}`)
            ]);
            setDoctors(doctorsRes.data);
            setAppointments(appointmentsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter doctors
    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpec = !specializationFilter || doc.specialization === specializationFilter;
        const matchesMinFee = !minFee || (doc.consultation_fee || 0) >= parseFloat(minFee);
        const matchesMaxFee = !maxFee || (doc.consultation_fee || 0) <= parseFloat(maxFee);
        return matchesSearch && matchesSpec && matchesMinFee && matchesMaxFee;
    });

    // Get unique specializations for filter
    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

    const handleBookAppointment = async () => {
        if (!selectedSlot) {
            setBookingError('Please select a time slot');
            return;
        }

        setBookingLoading(true);
        setBookingError('');

        try {
            await axios.post('/api/appointments/book', {
                patientId: user.id,
                doctorId: selectedDoctor.id,
                slotId: selectedSlot.id,
                reason
            });

            // Reset and refresh
            setSelectedDoctor(null);
            setSelectedSlot(null);
            setReason('');
            setBookingStep(1);
            setActiveTab('appointments');
            fetchData();
        } catch (err) {
            setBookingError(err.response?.data?.error || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleSelectDoctor = async (doctor) => {
        try {
            const res = await axios.get(`/api/doctors/${doctor.id}`);
            setSelectedDoctor(res.data);
            setBookingStep(1);
        } catch (err) {
            console.error('Error fetching doctor details:', err);
        }
    };

    // Stats
    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        accepted: appointments.filter(a => a.status === 'accepted').length,
        completed: appointments.filter(a => a.status === 'completed').length
    };

    if (loading) {
        return (
            <div className="ds-flex ds-justify-center ds-items-center ds-py-16">
                <div className="ds-spinner ds-mr-3" />
                <span className="ds-body ds-text-secondary">Loading...</span>
            </div>
        );
    }

    // Booking Flow View
    if (selectedDoctor) {
        return (
            <div>
                {/* Header */}
                <div className="ds-page-header ds-flex ds-items-center ds-gap-4">
                    <button
                        onClick={() => setSelectedDoctor(null)}
                        className="ds-btn ds-btn-ghost ds-btn-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="ds-page-title">Book Appointment</h1>
                        <p className="ds-page-subtitle">with {selectedDoctor.name}</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="ds-flex ds-items-center">
                            <div className={`ds-w-8 ds-h-8 ds-rounded-full ds-flex ds-items-center ds-justify-center ds-text-sm ds-font-semibold ${
                                s === bookingStep ? 'ds-bg-primary ds-text-white' :
                                s < bookingStep ? 'ds-bg-accent ds-text-white' : 'ds-bg-surface-2 ds-text-secondary'
                            }`}>
                                {s < bookingStep ? <CheckCircle size={16} /> : s}
                            </div>
                            {s < 3 && <div className={`ds-w-12 ds-h-0.5 ds-mx-2 ${s < bookingStep ? 'ds-bg-accent' : 'ds-bg-surface-2'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Doctor Info */}
                {bookingStep === 1 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="ds-card">
                        <div className="ds-flex ds-gap-6 ds-mb-6">
                            <div className="ds-w-20 ds-h-20 ds-rounded-2xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center ds-text-3xl ds-font-bold">
                                {selectedDoctor.name?.charAt(0)}
                            </div>
                            <div className="ds-flex-1">
                                <h3 className="ds-h2 ds-mb-1">{selectedDoctor.name}</h3>
                                <span className="ds-badge ds-badge-primary">{selectedDoctor.specialization}</span>
                                <div className="ds-flex ds-gap-4 ds-mt-3">
                                    <div className="ds-flex ds-items-center ds-gap-1 ds-body-sm ds-text-secondary">
                                        <Building size={14} />
                                        {selectedDoctor.hospital_name || 'Not specified'}
                                    </div>
                                    <div className="ds-flex ds-items-center ds-gap-1 ds-body-sm ds-text-secondary">
                                        <DollarSign size={14} />
                                        ${selectedDoctor.consultation_fee || 0}
                                    </div>
                                    <div className="ds-flex ds-items-center ds-gap-1 ds-body-sm ds-text-secondary">
                                        <Clock size={14} />
                                        {selectedDoctor.experience || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="ds-body ds-text-secondary ds-mb-6">
                            {selectedDoctor.description || 'No description available'}
                        </p>
                        <button
                            onClick={() => setBookingStep(2)}
                            className="ds-btn ds-btn-primary ds-w-full"
                        >
                            Continue to Select Time <ChevronRight size={18} />
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Select Slot */}
                {bookingStep === 2 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="ds-card">
                        <h3 className="ds-h2 ds-mb-4">Select Time Slot</h3>

                        {selectedDoctor.slots?.length === 0 ? (
                            <div className="ds-text-center ds-py-8 ds-text-secondary">
                                No available slots for this doctor.
                            </div>
                        ) : (
                            <div className="ds-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {selectedDoctor.slots
                                    .filter(slot => slot.is_available)
                                    .map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`ds-btn ds-btn-sm ${
                                            selectedSlot?.id === slot.id ? 'ds-btn-primary' : 'ds-btn-secondary'
                                        }`}
                                    >
                                        <Calendar size={14} className="ds-mr-1" />
                                        {slot.date} {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="ds-flex ds-justify-between ds-mt-6">
                            <button onClick={() => setBookingStep(1)} className="ds-btn ds-btn-ghost">
                                Back
                            </button>
                            <button
                                onClick={() => selectedSlot && setBookingStep(3)}
                                disabled={!selectedSlot}
                                className="ds-btn ds-btn-primary"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Confirm */}
                {bookingStep === 3 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="ds-card">
                        <h3 className="ds-h2 ds-mb-4">Confirm Booking</h3>

                        {bookingError && (
                            <div className="ds-badge ds-badge-error ds-mb-4 ds-block">{bookingError}</div>
                        )}

                        <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)] ds-mb-4">
                            <div className="ds-flex ds-justify-between ds-items-center ds-mb-2">
                                <span className="ds-body-sm ds-text-secondary">Doctor</span>
                                <span className="ds-body ds-font-semibold">{selectedDoctor.name}</span>
                            </div>
                            <div className="ds-flex ds-justify-between ds-items-center ds-mb-2">
                                <span className="ds-body-sm ds-text-secondary">Date & Time</span>
                                <span className="ds-body ds-font-semibold">{selectedSlot?.date} {selectedSlot?.time}</span>
                            </div>
                            <div className="ds-flex ds-justify-between ds-items-center">
                                <span className="ds-body-sm ds-text-secondary">Fee</span>
                                <span className="ds-body ds-font-semibold ds-text-accent">${selectedDoctor.consultation_fee || 0}</span>
                            </div>
                        </div>

                        <div className="ds-input-group ds-mb-4">
                            <label className="ds-label">Reason for Visit</label>
                            <textarea
                                className="ds-input ds-resize-none"
                                rows="3"
                                placeholder="Briefly describe your symptoms or reason for visit..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>

                        <div className="ds-flex ds-justify-between">
                            <button onClick={() => setBookingStep(2)} className="ds-btn ds-btn-ghost">
                                Back
                            </button>
                            <button
                                onClick={handleBookAppointment}
                                disabled={bookingLoading}
                                className="ds-btn ds-btn-primary ds-btn-lg"
                            >
                                {bookingLoading ? (
                                    <span className="ds-flex ds-items-center ds-gap-2">
                                        <span className="ds-spinner" />
                                        Booking...
                                    </span>
                                ) : (
                                    <>
                                        <CheckCircle size={18} className="ds-mr-2" />
                                        Confirm Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="ds-page-header ds-flex ds-justify-between ds-items-start">
                <div>
                    <h1 className="ds-page-title">Patient Dashboard</h1>
                    <p className="ds-page-subtitle">Find doctors and manage your appointments</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="ds-dashboard-grid ds-flex-col-mobile ds-mb-6">
                {[
                    { label: 'Total', value: stats.total, icon: User, color: 'primary' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'warning' },
                    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'accent' },
                    { label: 'Completed', value: stats.completed, icon: Star, color: 'secondary' }
                ].map((s, i) => (
                    <div key={i} className="ds-col-3 ds-col-6 ds-col-12-mobile">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="ds-card ds-flex ds-items-center ds-gap-4"
                        >
                            <div className={`ds-p-3 ds-rounded-xl ds-bg-${s.color}/10 ds-text-${s.color}`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <p className="ds-caption ds-text-secondary ds-mb-1">{s.label}</p>
                                <p className="ds-h2">{s.value}</p>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="ds-flex ds-gap-2 ds-mb-6 ds-flex-wrap-mobile ds-gap-2-mobile">
                {['doctors', 'appointments'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`ds-btn ${activeTab === tab ? 'ds-btn-primary' : 'ds-btn-secondary'} ds-capitalize ds-flex-1-mobile`}
                    >
                        {tab === 'doctors' ? 'Find Doctors' : 'My Appointments'}
                    </button>
                ))}
            </div>

            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
                <div>
                    {/* Search & Filters */}
                    <div className="ds-card ds-mb-6">
                        <div className="ds-flex ds-gap-4 ds-mb-4">
                            <div className="ds-input-wrapper ds-flex-1">
                                <Search className="ds-input-icon" size={18} />
                                <input
                                    type="text"
                                    className="ds-input ds-input-with-icon"
                                    placeholder="Search doctors by name, specialization, or hospital..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="ds-flex ds-gap-4">
                            <select
                                className="ds-input ds-w-48"
                                value={specializationFilter}
                                onChange={(e) => setSpecializationFilter(e.target.value)}
                            >
                                <option value="">All Specializations</option>
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <div className="ds-flex ds-gap-2 ds-items-center">
                                <span className="ds-body-sm ds-text-secondary">Fee:</span>
                                <input
                                    type="number"
                                    className="ds-input ds-w-24"
                                    placeholder="Min"
                                    value={minFee}
                                    onChange={(e) => setMinFee(e.target.value)}
                                />
                                <span className="ds-text-secondary">-</span>
                                <input
                                    type="number"
                                    className="ds-input ds-w-24"
                                    placeholder="Max"
                                    value={maxFee}
                                    onChange={(e) => setMaxFee(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Doctors Grid */}
                    <div className="ds-dashboard-grid ds-flex-col-mobile">
                        {filteredDoctors.length === 0 ? (
                            <div className="ds-col-12 ds-text-center ds-py-12 ds-text-secondary">
                                No doctors found matching your criteria.
                            </div>
                        ) : (
                            filteredDoctors.map((doctor, i) => (
                                <motion.div
                                    key={doctor.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="ds-col-4 ds-col-6 ds-col-12-mobile"
                                >
                                    <div className="ds-card ds-card-hover ds-h-full ds-flex ds-flex-col">
                                        <div className="ds-flex ds-gap-4 ds-mb-4">
                                            <div className="ds-w-14 ds-h-14 ds-rounded-xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center ds-font-bold ds-text-xl">
                                                {doctor.name?.charAt(0)}
                                            </div>
                                            <div className="ds-flex-1">
                                                <h3 className="ds-h3 ds-truncate">{doctor.name}</h3>
                                                <span className="ds-badge ds-badge-primary">{doctor.specialization}</span>
                                            </div>
                                        </div>

                                        <div className="ds-flex ds-flex-col ds-gap-2 ds-mb-4 ds-flex-1">
                                            <div className="ds-flex ds-items-center ds-gap-2 ds-body-sm ds-text-secondary">
                                                <Building size={14} />
                                                {doctor.hospital_name || 'Not specified'}
                                            </div>
                                            <div className="ds-flex ds-items-center ds-gap-2 ds-body-sm ds-text-secondary">
                                                <Clock size={14} />
                                                {doctor.experience || 'Experience N/A'}
                                            </div>
                                            <div className="ds-flex ds-items-center ds-gap-2 ds-body-sm ds-text-secondary">
                                                <DollarSign size={14} />
                                                ${doctor.consultation_fee || 0} per visit
                                            </div>
                                            <p className="ds-body-sm ds-text-secondary ds-line-clamp-2 ds-mt-2">
                                                {doctor.description || 'No description available'}
                                            </p>
                                        </div>

                                        <div className="ds-flex ds-items-center ds-justify-between ds-pt-4 ds-border-t ds-border-[var(--color-border)]">
                                            <span className={`ds-badge ds-badge-sm ${doctor.available_slots > 0 ? 'ds-badge-success' : 'ds-badge-secondary'}`}>
                                                {doctor.available_slots > 0 ? `${doctor.available_slots} slots available` : 'No slots'}
                                            </span>
                                            <button
                                                onClick={() => handleSelectDoctor(doctor)}
                                                disabled={doctor.available_slots === 0}
                                                className="ds-btn ds-btn-primary ds-btn-sm"
                                            >
                                                Book Now <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
                <div className="ds-card">
                    <h3 className="ds-h2 ds-mb-6">My Appointments</h3>

                    <div className="ds-flex ds-flex-col ds-gap-3">
                        <AnimatePresence>
                            {appointments.length === 0 ? (
                                <div className="ds-text-center ds-py-12 ds-text-secondary">
                                    <p className="ds-body ds-mb-4">You haven't booked any appointments yet.</p>
                                    <button
                                        onClick={() => setActiveTab('doctors')}
                                        className="ds-btn ds-btn-primary"
                                    >
                                        Find a Doctor
                                    </button>
                                </div>
                            ) : (
                                appointments.map((app, i) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`ds-p-4 ds-rounded-xl ds-border-l-4 ${
                                            app.status === 'pending' ? 'ds-border-l-warning' :
                                            app.status === 'accepted' ? 'ds-border-l-accent' :
                                            app.status === 'completed' ? 'ds-border-l-secondary' :
                                            'ds-border-l-error'
                                        } ds-bg-[var(--color-surface)]`}
                                    >
                                        <div className="ds-flex ds-justify-between ds-items-start ds-flex-wrap-mobile ds-gap-2-mobile">
                                            <div className="ds-flex ds-gap-4 ds-flex-1 ds-min-w-0">
                                                <div className="ds-text-center ds-min-w-[70px]">
                                                    <p className="ds-body-sm ds-font-semibold ds-truncate-mobile">{app.date}</p>
                                                    <p className="ds-caption ds-text-secondary">{app.time}</p>
                                                </div>
                                                <div className="ds-min-w-0">
                                                    <p className="ds-body ds-font-semibold ds-truncate-mobile">{app.doctor_name}</p>
                                                    <p className="ds-body-sm ds-text-secondary">{app.specialization}</p>
                                                    <p className="ds-body-sm ds-text-secondary ds-mt-1 ds-truncate-mobile">
                                                        {app.hospital_name}
                                                    </p>
                                                    {app.reason && (
                                                        <p className="ds-body-sm ds-text-secondary ds-mt-1 ds-truncate-mobile">
                                                            Reason: {app.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <span className={`ds-badge ${
                                                app.status === 'pending' ? 'ds-badge-warning' :
                                                app.status === 'accepted' ? 'ds-badge-accent' :
                                                app.status === 'completed' ? 'ds-badge-success' :
                                                'ds-badge-error'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
