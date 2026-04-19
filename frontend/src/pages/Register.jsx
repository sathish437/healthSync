import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Phone, MapPin, Calendar, Building,
    Stethoscope, Clock, DollarSign, FileText, UserCircle,
    ChevronRight, ChevronLeft, CheckCircle
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Common fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    // Patient fields
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');

    // Doctor fields
    const [specialization, setSpecialization] = useState('');
    const [experience, setExperience] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [description, setDescription] = useState('');

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const validateStep2 = () => {
        if (!name || !email || !password) {
            setError('Name, email, and password are required');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (validateStep2()) {
            setStep(3);
        }
    };

    const validateStep3 = () => {
        if (role === 'patient') {
            if (!age || !gender) {
                setError('Age and gender are required');
                return false;
            }
        } else {
            if (!specialization) {
                setError('Specialization is required');
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;

        setLoading(true);
        setError('');

        const payload = {
            email,
            password,
            role,
            name,
            phone
        };

        if (role === 'patient') {
            payload.age = parseInt(age);
            payload.gender = gender;
            payload.address = address;
        } else {
            payload.specialization = specialization;
            payload.experience = experience;
            payload.hospitalName = hospitalName;
            payload.consultationFee = parseFloat(consultationFee) || 0;
            payload.description = description;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', payload);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Role Selection
    const renderStep1 = () => (
        <div className="ds-text-center">
            <h2 className="ds-h1 ds-mb-3">I am a...</h2>
            <p className="ds-body ds-text-secondary ds-mb-8">Select your role to continue</p>

            <div className="ds-dashboard-grid ds-flex-col-mobile">
                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('patient')}
                    className="ds-col-6 ds-col-12 ds-card ds-card-hover ds-p-6 ds-text-center"
                >
                    <div className="ds-w-16 ds-h-16 ds-rounded-2xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center ds-mx-auto ds-mb-3">
                        <UserCircle size={28} />
                    </div>
                    <h3 className="ds-h2 ds-mb-2">Patient</h3>
                    <p className="ds-body-sm ds-text-secondary">Book appointments with doctors</p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('doctor')}
                    className="ds-col-6 ds-col-12 ds-card ds-card-hover ds-p-6 ds-text-center"
                >
                    <div className="ds-w-16 ds-h-16 ds-rounded-2xl ds-bg-accent/10 ds-text-accent ds-flex ds-items-center ds-justify-center ds-mx-auto ds-mb-3">
                        <Stethoscope size={28} />
                    </div>
                    <h3 className="ds-h2 ds-mb-2">Doctor</h3>
                    <p className="ds-body-sm ds-text-secondary">Manage your practice</p>
                </motion.button>
            </div>
        </div>
    );

    // Step 2: Common Fields
    const renderStep2 = () => (
        <div>
            <div className="ds-flex ds-items-center ds-gap-3 ds-mb-6">
                <button onClick={() => setStep(1)} className="ds-btn ds-btn-ghost ds-btn-sm">
                    <ChevronLeft size={18} />
                </button>
                <h2 className="ds-h1">Basic Information</h2>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="ds-badge ds-badge-error ds-mb-5 ds-block">
                    {error}
                </motion.div>
            )}

            <div className="ds-form">
                <div className="ds-input-group">
                    <label className="ds-label">Full Name</label>
                    <div className="ds-input-wrapper">
                        <User className="ds-input-icon" size={18} />
                        <input
                            type="text"
                            className="ds-input ds-input-with-icon"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="ds-form-row">
                    <div className="ds-input-group">
                        <label className="ds-label">Email Address</label>
                        <div className="ds-input-wrapper">
                            <Mail className="ds-input-icon" size={18} />
                            <input
                                type="email"
                                className="ds-input ds-input-with-icon"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="ds-input-group">
                        <label className="ds-label">Phone Number</label>
                        <div className="ds-input-wrapper">
                            <Phone className="ds-input-icon" size={18} />
                            <input
                                type="tel"
                                className="ds-input ds-input-with-icon"
                                placeholder="+1 234 567 8900"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="ds-input-group">
                    <label className="ds-label">Password</label>
                    <div className="ds-input-wrapper">
                        <Lock className="ds-input-icon" size={18} />
                        <input
                            type="password"
                            className="ds-input ds-input-with-icon"
                            placeholder="Create a password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleNext}
                    className="ds-btn ds-btn-primary ds-w-full"
                >
                    Continue <ChevronRight size={18} />
                </motion.button>
            </div>
        </div>
    );

    // Step 3: Role-Specific Fields
    const renderStep3 = () => (
        <div>
            <div className="ds-flex ds-items-center ds-gap-3 ds-mb-6">
                <button onClick={() => setStep(2)} className="ds-btn ds-btn-ghost ds-btn-sm">
                    <ChevronLeft size={18} />
                </button>
                <h2 className="ds-h1">{role === 'patient' ? 'Personal Details' : 'Professional Details'}</h2>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="ds-badge ds-badge-error ds-mb-5 ds-block">
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="ds-form">
                {role === 'patient' ? (
                    <>
                        <div className="ds-form-row">
                            <div className="ds-input-group">
                                <label className="ds-label">Age</label>
                                <div className="ds-input-wrapper">
                                    <Calendar className="ds-input-icon" size={18} />
                                    <input
                                        type="number"
                                        className="ds-input ds-input-with-icon"
                                        placeholder="Your age"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="ds-input-group">
                                <label className="ds-label">Gender</label>
                                <select
                                    className="ds-input"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="ds-input-group">
                            <label className="ds-label">Address</label>
                            <div className="ds-input-wrapper">
                                <MapPin className="ds-input-icon" size={18} />
                                <input
                                    type="text"
                                    className="ds-input ds-input-with-icon"
                                    placeholder="Your address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="ds-form-row">
                            <div className="ds-input-group">
                                <label className="ds-label">Specialization *</label>
                                <div className="ds-input-wrapper">
                                    <Stethoscope className="ds-input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="ds-input ds-input-with-icon"
                                        placeholder="e.g. Cardiology, Dermatology"
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="ds-input-group">
                                <label className="ds-label">Experience</label>
                                <div className="ds-input-wrapper">
                                    <Clock className="ds-input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="ds-input ds-input-with-icon"
                                        placeholder="e.g. 10 years"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ds-form-row">
                            <div className="ds-input-group">
                                <label className="ds-label">Hospital/Clinic Name</label>
                                <div className="ds-input-wrapper">
                                    <Building className="ds-input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="ds-input ds-input-with-icon"
                                        placeholder="Hospital or clinic name"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ds-input-group">
                                <label className="ds-label">Consultation Fee ($)</label>
                                <div className="ds-input-wrapper">
                                    <DollarSign className="ds-input-icon" size={18} />
                                    <input
                                        type="number"
                                        className="ds-input ds-input-with-icon"
                                        placeholder="e.g. 100"
                                        value={consultationFee}
                                        onChange={(e) => setConsultationFee(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ds-input-group">
                            <label className="ds-label">Professional Description</label>
                            <div className="ds-input-wrapper">
                                <FileText className="ds-input-icon" size={18} />
                                <textarea
                                    className="ds-input ds-input-with-icon ds-resize-none"
                                    rows="3"
                                    placeholder="Brief description of your expertise"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="ds-btn ds-btn-primary ds-w-full ds-btn-lg"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="ds-flex ds-items-center ds-gap-2 ds-justify-center">
                            <span className="ds-spinner" />
                            Creating account...
                        </span>
                    ) : (
                        <span className="ds-flex ds-items-center ds-gap-2 ds-justify-center">
                            <CheckCircle size={18} />
                            Create Account
                        </span>
                    )}
                </motion.button>
            </form>
        </div>
    );

    return (
        <div className="ds-flex ds-justify-center ds-items-start ds-pt-4 ds-pb-4 ds-px-4">
            <motion.div
                className="ds-card ds-card-elevated ds-w-full ds-max-w-2xl ds-p-5 ds-p-8-desktop"
                style={{ '--p-8-desktop': 'var(--space-5)' }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Progress Steps */}
                <div className="ds-flex ds-items-center ds-justify-center ds-gap-1 ds-mb-6 ds-mb-8-desktop">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="ds-flex ds-items-center">
                            <div className={`ds-w-7 ds-h-7 ds-w-8-desktop ds-h-8-desktop ds-rounded-full ds-flex ds-items-center ds-justify-center ds-text-xs ds-text-sm-desktop ds-font-semibold ${
                                s === step ? 'ds-bg-primary ds-text-white' :
                                s < step ? 'ds-bg-accent ds-text-white' : 'ds-bg-surface-2 ds-text-secondary'
                            }`}>
                                {s < step ? <CheckCircle size={14} className="ds-w-4 ds-h-4-desktop" /> : s}
                            </div>
                            {s < 3 && <div className={`ds-w-8 ds-w-12-desktop ds-h-0.5 ds-mx-1 ds-mx-2-desktop ${s < step ? 'ds-bg-accent' : 'ds-bg-surface-2'}`} />}
                        </div>
                    ))}
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <p className="ds-body-sm ds-text-secondary ds-mt-6 ds-text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="ds-text-primary-color ds-font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
