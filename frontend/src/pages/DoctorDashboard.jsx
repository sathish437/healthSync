import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Clock, CheckCircle, XCircle, Calendar, Edit2, Save, Plus, Trash2,
    Stethoscope, Building, DollarSign, FileText, User, Mail, Phone, MapPin,
    ChevronDown, ChevronUp, Activity, Search
} from 'lucide-react';

const socket = io('http://localhost:5000');

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [newSlotDate, setNewSlotDate] = useState('');
    const [newSlotTimes, setNewSlotTimes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user?.doctorId) {
            fetchData();
            socket.emit('join_doctor_queue', user.doctorId);
            socket.on('queue_updated', fetchData);
            socket.on('new_appointment', fetchData);
        }
        return () => {
            socket.off('queue_updated');
            socket.off('new_appointment');
        };
    }, [user?.doctorId]);

    const fetchData = async () => {
        try {
            const [profileRes, appointmentsRes, slotsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/doctors/profile/${user.id}`),
                axios.get(`http://localhost:5000/api/appointments/doctor/${user.doctorId}`),
                axios.get(`http://localhost:5000/api/doctors/${user.doctorId}/slots`)
            ]);
            setProfile(profileRes.data);
            setAppointments(appointmentsRes.data);
            setSlots(slotsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`http://localhost:5000/api/appointments/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/doctors/profile/${user.id}`, profile);
            setEditingProfile(false);
            fetchData();
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    const handleAddSlots = async () => {
        if (!newSlotDate || !newSlotTimes) return;
        const times = newSlotTimes.split(',').map(t => t.trim()).filter(t => t);
        try {
            await axios.post(`http://localhost:5000/api/doctors/${user.doctorId}/slots`, {
                date: newSlotDate,
                times
            });
            setNewSlotDate('');
            setNewSlotTimes('');
            fetchData();
        } catch (err) {
            console.error('Error adding slots:', err);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!confirm('Delete this slot?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/doctors/slots/${slotId}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting slot:', err);
        }
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             app.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

    if (!profile) {
        return (
            <div className="ds-card ds-text-center ds-py-16">
                <p className="ds-body ds-text-secondary">Profile not found. Please complete your registration.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="ds-page-header ds-flex ds-justify-between ds-items-start">
                <div>
                    <h1 className="ds-page-title">Doctor Dashboard</h1>
                    <p className="ds-page-subtitle">Manage your practice and appointments</p>
                </div>
                <div className="ds-flex ds-items-center ds-gap-2 ds-badge ds-badge-success">
                    <div className="ds-w-2 ds-h-2 ds-rounded-full ds-bg-accent ds-animate-pulse" />
                    <span className="ds-body-sm">Online</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="ds-dashboard-grid ds-flex-col-mobile ds-mb-6">
                {[
                    { label: 'Total', value: stats.total, icon: Users, color: 'primary' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'warning' },
                    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'accent' },
                    { label: 'Completed', value: stats.completed, icon: Activity, color: 'secondary' }
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
                {['appointments', 'profile', 'availability'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`ds-btn ${activeTab === tab ? 'ds-btn-primary' : 'ds-btn-secondary'} ds-capitalize ds-flex-1-mobile`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
                <div className="ds-card">
                    {/* Filters */}
                    <div className="ds-flex ds-gap-4 ds-mb-6">
                        <div className="ds-input-wrapper ds-flex-1">
                            <Search className="ds-input-icon" size={18} />
                            <input
                                type="text"
                                className="ds-input ds-input-with-icon"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="ds-input ds-w-40"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Appointments List */}
                    <div className="ds-flex ds-flex-col ds-gap-3">
                        <AnimatePresence>
                            {filteredAppointments.length === 0 ? (
                                <div className="ds-text-center ds-py-12 ds-text-secondary">
                                    No appointments found
                                </div>
                            ) : (
                                filteredAppointments.map((app, i) => (
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
                                                    <p className="ds-body ds-font-semibold ds-truncate-mobile">{app.patient_name}</p>
                                                    <p className="ds-body-sm ds-text-secondary">
                                                        {app.patient_age} yrs • {app.patient_gender}
                                                    </p>
                                                    <p className="ds-body-sm ds-text-secondary ds-mt-1 ds-truncate-mobile">
                                                        Reason: {app.reason || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ds-flex ds-items-center ds-gap-3 ds-flex-wrap-mobile ds-gap-2-mobile ds-ml-auto">
                                                <span className={`ds-badge ${
                                                    app.status === 'pending' ? 'ds-badge-warning' :
                                                    app.status === 'accepted' ? 'ds-badge-accent' :
                                                    app.status === 'completed' ? 'ds-badge-success' :
                                                    'ds-badge-error'
                                                }`}>
                                                    {app.status}
                                                </span>

                                                {app.status === 'pending' && (
                                                    <div className="ds-flex ds-gap-2 ds-flex-wrap-mobile">
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                                            className="ds-btn ds-btn-accent ds-btn-sm ds-touch-target"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                            className="ds-btn ds-btn-error ds-btn-sm ds-touch-target"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                {app.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(app.id, 'completed')}
                                                        className="ds-btn ds-btn-primary ds-btn-sm ds-touch-target"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="ds-card">
                    <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
                        <h3 className="ds-h2">Professional Profile</h3>
                        <button
                            onClick={() => setEditingProfile(!editingProfile)}
                            className="ds-btn ds-btn-secondary"
                        >
                            {editingProfile ? (
                                <><XCircle size={18} className="ds-mr-2" /> Cancel</>
                            ) : (
                                <><Edit2 size={18} className="ds-mr-2" /> Edit</>
                            )}
                        </button>
                    </div>

                    {editingProfile ? (
                        <form onSubmit={handleProfileUpdate} className="ds-form">
                            <div className="ds-form-row">
                                <div className="ds-input-group">
                                    <label className="ds-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="ds-input"
                                        value={profile.name || ''}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    />
                                </div>
                                <div className="ds-input-group">
                                    <label className="ds-label">Specialization</label>
                                    <div className="ds-input-wrapper">
                                        <Stethoscope className="ds-input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="ds-input ds-input-with-icon"
                                            value={profile.specialization || ''}
                                            onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="ds-form-row">
                                <div className="ds-input-group">
                                    <label className="ds-label">Experience</label>
                                    <input
                                        type="text"
                                        className="ds-input"
                                        value={profile.experience || ''}
                                        onChange={(e) => setProfile({...profile, experience: e.target.value})}
                                    />
                                </div>
                                <div className="ds-input-group">
                                    <label className="ds-label">Consultation Fee ($)</label>
                                    <div className="ds-input-wrapper">
                                        <DollarSign className="ds-input-icon" size={18} />
                                        <input
                                            type="number"
                                            className="ds-input ds-input-with-icon"
                                            value={profile.consultation_fee || ''}
                                            onChange={(e) => setProfile({...profile, consultation_fee: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="ds-input-group">
                                <label className="ds-label">Hospital/Clinic</label>
                                <div className="ds-input-wrapper">
                                    <Building className="ds-input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="ds-input ds-input-with-icon"
                                        value={profile.hospital_name || ''}
                                        onChange={(e) => setProfile({...profile, hospital_name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="ds-input-group">
                                <label className="ds-label">Description</label>
                                <div className="ds-input-wrapper">
                                    <FileText className="ds-input-icon" size={18} />
                                    <textarea
                                        className="ds-input ds-input-with-icon ds-resize-none"
                                        rows="3"
                                        value={profile.description || ''}
                                        onChange={(e) => setProfile({...profile, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="ds-form-row">
                                <div className="ds-input-group">
                                    <label className="ds-label">Phone</label>
                                    <div className="ds-input-wrapper">
                                        <Phone className="ds-input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="ds-input ds-input-with-icon"
                                            value={profile.phone || ''}
                                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="ds-input-group">
                                    <label className="ds-label">Email</label>
                                    <div className="ds-input-wrapper">
                                        <Mail className="ds-input-icon" size={18} />
                                        <input
                                            type="email"
                                            className="ds-input ds-input-with-icon"
                                            value={profile.email || ''}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="ds-btn ds-btn-primary ds-w-full">
                                <Save size={18} className="ds-mr-2" /> Save Changes
                            </button>
                        </form>
                    ) : (
                        <div className="ds-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <User size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Full Name</span>
                                </div>
                                <p className="ds-body ds-font-semibold">{profile.name}</p>
                            </div>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <Stethoscope size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Specialization</span>
                                </div>
                                <p className="ds-body ds-font-semibold">{profile.specialization}</p>
                            </div>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <Building size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Hospital/Clinic</span>
                                </div>
                                <p className="ds-body ds-font-semibold">{profile.hospital_name || 'Not specified'}</p>
                            </div>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <DollarSign size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Consultation Fee</span>
                                </div>
                                <p className="ds-body ds-font-semibold">${profile.consultation_fee || 0}</p>
                            </div>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <Clock size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Experience</span>
                                </div>
                                <p className="ds-body ds-font-semibold">{profile.experience || 'Not specified'}</p>
                            </div>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <Phone size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Phone</span>
                                </div>
                                <p className="ds-body ds-font-semibold">{profile.phone || 'Not specified'}</p>
                            </div>
                            <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)] ds-col-span-2">
                                <div className="ds-flex ds-items-center ds-gap-2 ds-mb-2">
                                    <FileText size={16} className="ds-text-secondary" />
                                    <span className="ds-caption ds-text-secondary">Description</span>
                                </div>
                                <p className="ds-body">{profile.description || 'No description provided'}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
                <div className="ds-card">
                    <h3 className="ds-h2 ds-mb-6">Manage Availability</h3>

                    {/* Add New Slots */}
                    <div className="ds-p-5 ds-rounded-xl ds-bg-[var(--color-surface)] ds-mb-6">
                        <h4 className="ds-h3 ds-mb-4">Add Time Slots</h4>
                        <div className="ds-form-row ds-mb-4">
                            <div className="ds-input-group">
                                <label className="ds-label">Date</label>
                                <div className="ds-input-wrapper">
                                    <Calendar className="ds-input-icon" size={18} />
                                    <input
                                        type="date"
                                        className="ds-input ds-input-with-icon"
                                        value={newSlotDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setNewSlotDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ds-input-group ds-flex-1">
                                <label className="ds-label">Times (comma-separated, e.g. 09:00, 10:00, 11:00)</label>
                                <div className="ds-input-wrapper">
                                    <Clock className="ds-input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="ds-input ds-input-with-icon"
                                        placeholder="09:00, 10:00, 11:00"
                                        value={newSlotTimes}
                                        onChange={(e) => setNewSlotTimes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddSlots}
                            disabled={!newSlotDate || !newSlotTimes}
                            className="ds-btn ds-btn-primary"
                        >
                            <Plus size={18} className="ds-mr-2" /> Add Slots
                        </button>
                    </div>

                    {/* Existing Slots */}
                    <h4 className="ds-h3 ds-mb-4">Your Schedule</h4>
                    <div className="ds-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {slots.length === 0 ? (
                            <p className="ds-text-secondary ds-col-span-3 ds-text-center ds-py-8">
                                No slots added yet. Add your first availability above.
                            </p>
                        ) : (
                            slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className={`ds-p-4 ds-rounded-xl ds-flex ds-justify-between ds-items-center ${
                                        slot.is_available ? 'ds-bg-accent/10' : 'ds-bg-surface-2 ds-opacity-50'
                                    }`}
                                >
                                    <div>
                                        <p className="ds-body-sm ds-font-semibold">{slot.date}</p>
                                        <p className="ds-caption ds-text-secondary">{slot.time}</p>
                                        <span className={`ds-badge ds-badge-sm ${slot.is_available ? 'ds-badge-success' : 'ds-badge-secondary'}`}>
                                            {slot.is_available ? 'Available' : 'Booked'}
                                        </span>
                                    </div>
                                    {slot.is_available && (
                                        <button
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="ds-btn ds-btn-error ds-btn-sm"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
