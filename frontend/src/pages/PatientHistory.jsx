import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    History, 
    Calendar, 
    Clock, 
    User, 
    ChevronRight, 
    Activity, 
    CheckCircle2,
    Loader2
} from 'lucide-react';

const socket = io();

const PatientHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.id) {
            fetchHistory();
            socket.emit('join_patient_updates', user.id);

            socket.on('status_changed', ({ id, status }) => {
                setAppointments(prev => prev.map(app => 
                    app.id === parseInt(id) ? { ...app, status } : app
                ));
            });
        }
        return () => socket.off('status_changed');
    }, [user.id]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`/api/appointments/patient/${user.id}`);
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch(status) {
            case 'booked': return 1;
            case 'waiting': return 2;
            case 'in_consultation': return 3;
            case 'completed': return 4;
            default: return 1;
        }
    };

    if (loading) return (
        <div className="ds-flex ds-justify-center ds-items-center ds-py-16">
            <div className="ds-spinner ds-mr-3" />
            <span className="ds-body ds-text-secondary">Loading appointment history...</span>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="ds-page-header">
                <h1 className="ds-page-title">My Appointments</h1>
                <p className="ds-page-subtitle">Track your consultation history and upcoming appointments</p>
            </div>

            {/* Appointments List */}
            <div className="ds-flex ds-flex-col ds-gap-5">
                {appointments.length === 0 ? (
                    <div className="ds-card ds-text-center ds-py-16">
                        <Activity className="ds-mx-auto ds-mb-4 ds-text-muted" size={64} />
                        <h3 className="ds-h2 ds-mb-2">No appointments yet</h3>
                        <p className="ds-body ds-text-secondary ds-mb-6">Book your first appointment to get started</p>
                        <button className="ds-btn ds-btn-primary" onClick={() => window.location.href='/'}>Book Appointment</button>
                    </div>
                ) : (
                    appointments.map((app, i) => (
                        <motion.div 
                            key={app.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="ds-card"
                        >
                            <div className="ds-dashboard-grid ds-items-center">
                                {/* Doctor Info */}
                                <div className="ds-col-4">
                                    <div className="ds-flex ds-items-center ds-gap-4 ds-mb-4">
                                        <div className="ds-w-12 ds-h-12 ds-rounded-xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h4 className="ds-h3">{app.doctor_name}</h4>
                                            <p className="ds-caption ds-text-secondary">{app.specialization}</p>
                                        </div>
                                    </div>
                                    <div className="ds-flex ds-gap-3">
                                        <div className="ds-badge ds-badge-secondary">
                                            <Calendar size={14} className="ds-mr-1" /> {app.date}
                                        </div>
                                        <div className="ds-badge ds-badge-secondary">
                                            <Clock size={14} className="ds-mr-1" /> {app.time}
                                        </div>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="ds-col-4">
                                    <p className="ds-caption ds-text-secondary ds-mb-2">Reason</p>
                                    <p className="ds-body-sm">{app.reason || "General consultation"}</p>
                                </div>

                                {/* Status */}
                                <div className="ds-col-4">
                                    <div className="ds-flex ds-items-center ds-justify-between">
                                        <div className="ds-flex ds-items-center ds-gap-2">
                                            {app.status === 'completed' ? (
                                                <CheckCircle2 className="ds-text-accent" size={20} />
                                            ) : (
                                                <Loader2 className="ds-text-primary ds-animate-spin" size={20} />
                                            )}
                                            <span className={`ds-badge ${app.status === 'completed' ? 'ds-badge-success' : 'ds-badge-primary'}`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <button className="ds-btn ds-btn-secondary ds-btn-sm">
                                            Details <ChevronRight size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientHistory;
