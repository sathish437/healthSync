import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Stethoscope, UserCircle } from 'lucide-react';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            // Redirect based on role
            if (user.role === 'doctor') {
                navigate('/doctor-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        } catch (err) {
            if (!err.response) {
                setError('Network Error: Backend server is offline.');
            } else {
                setError(err.response.data.error || 'Authentication failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ds-flex ds-justify-center ds-items-start ds-pt-8 ds-pt-12-desktop ds-px-4">
            <motion.div
                className="ds-card ds-card-elevated ds-w-full ds-max-w-md ds-p-5 ds-p-8-desktop ds-text-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Icon Header */}
                <div className="ds-flex ds-justify-center ds-mb-6">
                    <div className="ds-w-20 ds-h-20 ds-rounded-2xl ds-bg-primary/10 ds-text-primary ds-flex ds-items-center ds-justify-center">
                        <ShieldCheck size={40} />
                    </div>
                </div>

                <h2 className="ds-h1 ds-mb-2">Welcome Back</h2>
                <p className="ds-body ds-text-secondary ds-mb-8">Sign in to HealthSync</p>

                {/* Role Icons */}
                <div className="ds-flex ds-justify-center ds-gap-4 ds-mb-6">
                    <div className="ds-flex ds-items-center ds-gap-2 ds-p-3 ds-rounded-xl ds-bg-surface-2">
                        <Stethoscope size={20} className="ds-text-accent" />
                        <span className="ds-body-sm ds-text-secondary">Doctor</span>
                    </div>
                    <div className="ds-flex ds-items-center ds-gap-2 ds-p-3 ds-rounded-xl ds-bg-surface-2">
                        <UserCircle size={20} className="ds-text-primary" />
                        <span className="ds-body-sm ds-text-secondary">Patient</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ds-badge ds-badge-error ds-mb-6 ds-block"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="ds-form ds-text-left">
                    <div className="ds-input-group">
                        <label className="ds-label">Email Address</label>
                        <div className="ds-input-wrapper">
                            <Mail className="ds-input-icon" size={20} />
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
                        <label className="ds-label">Password</label>
                        <div className="ds-input-wrapper">
                            <Lock className="ds-input-icon" size={20} />
                            <input
                                type="password"
                                className="ds-input ds-input-with-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="ds-btn ds-btn-primary ds-w-full ds-btn-lg"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="ds-flex ds-items-center ds-gap-2 ds-justify-center">
                                <span className="ds-spinner" />
                                Signing in...
                            </span>
                        ) : (
                            <span className="ds-flex ds-items-center ds-gap-2 ds-justify-center">
                                Sign In <ArrowRight size={18} />
                            </span>
                        )}
                    </motion.button>
                </form>

                <p className="ds-body-sm ds-text-secondary ds-mt-6">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="ds-text-primary-color ds-font-medium hover:underline">
                        Create account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
