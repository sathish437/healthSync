import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Stethoscope, 
    Calendar, 
    CheckCircle, 
    ChevronRight, 
    ChevronLeft, 
    BrainCircuit, 
    AlertCircle,
    Clock,
    User
} from 'lucide-react';

const SmartBookingWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) navigate('/login');
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/appointments/hospitals');
            setHospitals(res.data);
            if (res.data.length > 0) setSelectedHospital(res.data[0].id);
        } catch (err) { console.error(err); }
    };

    const handleSymptomSubmit = async () => {
        if (!symptoms.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/appointments/analyze-symptoms', { symptoms });
            setAiAnalysis(res.data);
            
            // Auto-fetch recommended doctors
            const docRes = await axios.get('http://localhost:5000/api/doctors');
            const filtered = docRes.data.filter(d => 
                d.specialization.toLowerCase().includes(res.data.recommended_specialization.toLowerCase()) ||
                res.data.recommended_specialization.toLowerCase().includes(d.specialization.toLowerCase())
            );
            setDoctors(filtered.length > 0 ? filtered : docRes.data.slice(0, 3));
            setStep(2);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorSelect = async (doc) => {
        setSelectedDoctor(doc);
        setLoading(true);
        try {
            const date = new Date().toISOString().split('T')[0];
            const res = await axios.get(`http://localhost:5000/api/appointments/slots/${doc.id}/${date}`);
            setSlots(res.data);
            setStep(3);
        } catch (err) {
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalBooking = async () => {
        if (!selectedSlot) return;
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/appointments/book', {
                patientId: user.id,
                doctorId: selectedDoctor.id,
                slotId: selectedSlot.id,
                hospitalId: selectedHospital,
                reason: symptoms,
                aiAnalysis: aiAnalysis
            });
            setBookingStatus('success');
            setTimeout(() => navigate('/history'), 3000);
        } catch (err) {
            setBookingStatus('error');
        } finally {
            setLoading(false);
        }
    };

    // --- Steps Rendering ---

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ds-max-w-2xl ds-mx-auto">
            <div className="ds-text-center ds-mb-8">
                <div className="ds-flex ds-justify-center ds-mb-4">
                    <BrainCircuit size={48} className="ds-text-primary" />
                </div>
                <h2 className="ds-h1 ds-mb-3">Describe Your Symptoms</h2>
                <p className="ds-body ds-text-secondary">Our AI will analyze your symptoms and match you with the right specialist</p>
            </div>
            <div className="ds-input-group ds-mb-6">
                <textarea 
                    rows="5"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="E.g. I have a persistent sharp pain in my lower back..."
                    className="ds-input ds-resize-none"
                />
            </div>
            <button 
                onClick={handleSymptomSubmit} 
                disabled={!symptoms.trim() || loading}
                className="ds-btn ds-btn-primary ds-w-full ds-btn-lg"
            >
                {loading ? (
                    <span className="ds-flex ds-items-center ds-gap-2">
                        <span className="ds-spinner" />
                        Analyzing...
                    </span>
                ) : (
                    <span className="ds-flex ds-items-center ds-gap-2 ds-justify-center">
                        Continue <ChevronRight size={20} />
                    </span>
                )}
            </button>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* AI Analysis Result */}
            <div className="ds-card ds-border-l-4 ds-border-l-primary ds-mb-6">
                <div className="ds-flex ds-items-start ds-gap-4">
                    <div className="ds-p-3 ds-rounded-xl ds-bg-primary/10 ds-text-primary">
                        <Activity size={28} />
                    </div>
                    <div className="ds-flex-1">
                        <div className="ds-flex ds-items-center ds-gap-3 ds-mb-3">
                            <span className={`ds-badge ${aiAnalysis.urgency === 'emergency' ? 'ds-badge-error' : aiAnalysis.urgency === 'high' ? 'ds-badge-warning' : 'ds-badge-success'}`}>
                                {aiAnalysis.urgency}
                            </span>
                            <span className="ds-caption ds-text-secondary">Priority: {aiAnalysis.priority_score}%</span>
                        </div>
                        <h3 className="ds-h2 ds-mb-2">{aiAnalysis.short_summary}</h3>
                        <p className="ds-body-sm ds-text-secondary">Recommended: <span className="ds-text-primary-color ds-font-semibold">{aiAnalysis.recommended_specialization}</span></p>
                    </div>
                </div>
            </div>

            {/* Doctor Cards */}
            <h3 className="ds-h3 ds-mb-4">Recommended Specialists</h3>
            <div className="ds-dashboard-grid ds-mb-6">
                {doctors.map(doc => (
                    <div key={doc.id} className="ds-col-4">
                        <div className="ds-card ds-card-hover ds-cursor-pointer" onClick={() => handleDoctorSelect(doc)}>
                            <div className="ds-w-16 ds-h-16 ds-rounded-xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center ds-mb-4">
                                <Stethoscope size={28} />
                            </div>
                            <h4 className="ds-h3 ds-mb-1">{doc.name}</h4>
                            <p className="ds-body-sm ds-text-secondary ds-mb-4">{doc.specialization}</p>
                            <button className="ds-btn ds-btn-secondary ds-w-full ds-btn-sm">Select</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <button onClick={() => setStep(1)} className="ds-btn ds-btn-ghost"><ChevronLeft size={18} /> Back</button>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="ds-text-center ds-mb-8">
                <h2 className="ds-h1 ds-mb-2">Select Time Slot</h2>
                <p className="ds-body ds-text-secondary">Choose an available appointment time</p>
            </div>

            <div className="ds-dashboard-grid ds-mb-6">
                <div className="ds-col-8">
                    <div className="ds-card">
                        <label className="ds-label ds-mb-3">Available Slots</label>
                        {slots.length === 0 ? (
                            <div className="ds-text-center ds-py-8 ds-text-secondary">No slots available</div>
                        ) : (
                            <div className="ds-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {slots.map(slot => (
                                    <button 
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`ds-btn ds-btn-sm ${selectedSlot?.id === slot.id ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="ds-col-4">
                    <div className="ds-card ds-text-center">
                        <Clock size={32} className="ds-mx-auto ds-text-secondary ds-mb-3" />
                        <h5 className="ds-h3 ds-mb-2">Wait Time</h5>
                        <p className="ds-body-sm ds-text-secondary ds-mb-4">Expected wait: <span className="ds-text-accent ds-font-semibold">5-10 mins</span></p>
                        <div className="ds-w-full ds-bg-[var(--color-border)] ds-h-2 ds-rounded-full ds-overflow-hidden">
                            <div className="ds-bg-accent ds-h-full" style={{ width: '25%' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="ds-flex ds-justify-between">
                <button onClick={() => setStep(2)} className="ds-btn ds-btn-ghost"><ChevronLeft size={18} /> Back</button>
                <button onClick={() => setStep(4)} disabled={!selectedSlot} className="ds-btn ds-btn-primary">Continue <ChevronRight size={18} /></button>
            </div>
        </motion.div>
    );

    const renderStep4 = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ds-max-w-lg ds-mx-auto">
            <div className="ds-card ds-card-elevated">
                <div className="ds-flex ds-items-center ds-gap-3 ds-mb-6">
                    <CheckCircle className="ds-text-accent" size={28} />
                    <h2 className="ds-h1">Confirm Booking</h2>
                </div>

                {/* Summary */}
                <div className="ds-flex ds-flex-col ds-gap-3 ds-mb-6">
                    <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)] ds-flex ds-justify-between ds-items-center">
                        <span className="ds-body-sm ds-text-secondary">Patient</span>
                        <span className="ds-body-sm ds-font-semibold ds-flex ds-items-center ds-gap-2"><User size={14} /> {user.name}</span>
                    </div>
                    <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)] ds-flex ds-justify-between ds-items-center">
                        <span className="ds-body-sm ds-text-secondary">Doctor</span>
                        <span className="ds-body-sm ds-font-semibold ds-text-primary">{selectedDoctor?.name}</span>
                    </div>
                    <div className="ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)] ds-flex ds-justify-between ds-items-center">
                        <span className="ds-body-sm ds-text-secondary">Time</span>
                        <span className="ds-body-sm ds-font-semibold">{selectedSlot?.time}</span>
                    </div>
                    <div className="ds-p-4 ds-rounded-xl ds-bg-accent/5 ds-border ds-border-dashed ds-border-accent">
                        <p className="ds-caption ds-text-secondary ds-mb-1">AI Summary</p>
                        <p className="ds-body-sm ds-italic">"{aiAnalysis?.short_summary}"</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="ds-flex ds-flex-col ds-gap-3">
                    <button onClick={handleFinalBooking} disabled={loading} className="ds-btn ds-btn-primary ds-w-full ds-btn-lg">
                        {loading ? (
                            <span className="ds-flex ds-items-center ds-gap-2">
                                <span className="ds-spinner" />
                                Booking...
                            </span>
                        ) : (
                            'Confirm Booking'
                        )}
                    </button>
                    <button onClick={() => setStep(3)} className="ds-btn ds-btn-secondary ds-w-full">Change Time</button>
                </div>

                {bookingStatus === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ds-mt-4 ds-p-4 ds-bg-accent/10 ds-border ds-border-accent ds-rounded-xl ds-text-center">
                        <p className="ds-body-sm ds-text-accent ds-font-semibold">Booking successful! Redirecting...</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="ds-py-8">
            {/* Step Indicator */}
            <div className="ds-flex ds-justify-center ds-mb-8">
                <div className="ds-flex ds-items-center ds-gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="ds-flex ds-items-center">
                            <div className={`ds-w-8 ds-h-8 ds-rounded-full ds-flex ds-items-center ds-justify-center ds-text-sm ds-font-semibold ${
                                s === step ? 'ds-bg-primary ds-text-white' : 
                                s < step ? 'ds-bg-accent ds-text-white' : 'ds-bg-[var(--color-surface)] ds-text-secondary'
                            }`}>
                                {s < step ? <CheckCircle size={16} /> : s}
                            </div>
                            {s < 4 && <div className={`ds-w-8 ds-h-0.5 ds-mx-1 ${s < step ? 'ds-bg-accent' : 'ds-bg-[var(--color-border)]'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
};

export default SmartBookingWizard;
