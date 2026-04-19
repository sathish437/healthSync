import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import {
    Activity, User, LogOut, Stethoscope, Calendar, LayoutDashboard,
    Menu, X, Home, UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

const Navbar = ({ user, handleLogout }) => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <>
            <nav className="ds-nav">
                <div className="ds-nav-inner">
                    <Link to="/" className="ds-nav-logo">
                        <Activity size={28} className="ds-nav-logo-icon" />
                        <span>HealthSync</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ds-nav-links ds-hide-mobile">
                        {user ? (
                            <>
                                {user.role === 'patient' && (
                                    <>
                                        <Link to="/patient-dashboard" className={`ds-nav-link ${isActive("/patient-dashboard") ? 'ds-nav-link-active' : ''}`}>
                                            <LayoutDashboard size={16} className="ds-mr-1" />
                                            Dashboard
                                        </Link>
                                        <Link to="/patient-dashboard" className={`ds-nav-link ${isActive("/patient-dashboard") ? 'ds-nav-link-active' : ''}`}>
                                            <Calendar size={16} className="ds-mr-1" />
                                            My Appointments
                                        </Link>
                                    </>
                                )}
                                {user.role === 'doctor' && (
                                    <>
                                        <Link to="/doctor-dashboard" className={`ds-nav-link ${isActive("/doctor-dashboard") ? 'ds-nav-link-active' : ''}`}>
                                            <Stethoscope size={16} className="ds-mr-1" />
                                            Dashboard
                                        </Link>
                                    </>
                                )}
                                <div className="ds-flex ds-items-center ds-gap-4 ds-ml-4 ds-pl-4" style={{borderLeft: '1px solid rgba(255,255,255,0.1)'}}>
                                    <span className="ds-flex ds-items-center ds-gap-2 ds-caption ds-text-secondary">
                                        <User size={14} /> {user.name}
                                    </span>
                                    <button onClick={handleLogout} className="ds-btn ds-btn-secondary ds-btn-sm">
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="ds-btn ds-btn-secondary ds-btn-sm">Sign In</Link>
                                <Link to="/register" className="ds-btn ds-btn-primary ds-btn-sm">Register</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        className={`ds-nav-hamburger ${mobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`ds-nav-mobile ${mobileMenuOpen ? 'active' : ''}`}>
                {user ? (
                    <>
                        {user.role === 'patient' && (
                            <>
                                <Link to="/patient-dashboard" className={`ds-nav-mobile-link ${isActive("/patient-dashboard") ? 'ds-nav-mobile-link-active' : ''}`} onClick={closeMobileMenu}>
                                    <LayoutDashboard size={24} />
                                    Dashboard
                                </Link>
                                <Link to="/patient-dashboard" className={`ds-nav-mobile-link ${isActive("/patient-dashboard") ? 'ds-nav-mobile-link-active' : ''}`} onClick={closeMobileMenu}>
                                    <Calendar size={24} />
                                    My Appointments
                                </Link>
                            </>
                        )}
                        {user.role === 'doctor' && (
                            <>
                                <Link to="/doctor-dashboard" className={`ds-nav-mobile-link ${isActive("/doctor-dashboard") ? 'ds-nav-mobile-link-active' : ''}`} onClick={closeMobileMenu}>
                                    <Stethoscope size={24} />
                                    Dashboard
                                </Link>
                            </>
                        )}
                        <div className="ds-p-4 ds-mt-auto">
                            <div className="ds-flex ds-items-center ds-gap-3 ds-mb-4 ds-p-4 ds-rounded-xl ds-bg-surface">
                                <UserCircle size={32} className="ds-text-primary" />
                                <div>
                                    <p className="ds-body-sm ds-font-semibold">{user.name}</p>
                                    <p className="ds-caption ds-text-secondary ds-uppercase">{user.role}</p>
                                </div>
                            </div>
                            <button onClick={() => { closeMobileMenu(); handleLogout(); }} className="ds-btn ds-btn-secondary ds-w-full">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={`ds-nav-mobile-link ${isActive("/login") ? 'ds-nav-mobile-link-active' : ''}`} onClick={closeMobileMenu}>
                            <User size={24} />
                            Sign In
                        </Link>
                        <Link to="/register" className={`ds-nav-mobile-link ${isActive("/register") ? 'ds-nav-mobile-link-active' : ''}`} onClick={closeMobileMenu}>
                            <UserCircle size={24} />
                            Register
                        </Link>
                    </>
                )}
            </div>
        </>
    );
};

// Bottom Navigation Bar for Mobile
const BottomNav = ({ user }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    if (!user) return null;

    return (
        <nav className="ds-bottom-nav">
            <div className="ds-bottom-nav-inner">
                {user.role === 'patient' ? (
                    <>
                        <Link to="/patient-dashboard" className={`ds-bottom-nav-item ${isActive("/patient-dashboard") ? 'ds-bottom-nav-item-active' : ''}`}>
                            <LayoutDashboard className="ds-bottom-nav-icon" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/patient-dashboard" className={`ds-bottom-nav-item ${isActive("/patient-dashboard") ? 'ds-bottom-nav-item-active' : ''}`}>
                            <Calendar className="ds-bottom-nav-icon" />
                            <span>Appointments</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/doctor-dashboard" className={`ds-bottom-nav-item ${isActive("/doctor-dashboard") ? 'ds-bottom-nav-item-active' : ''}`}>
                            <Stethoscope className="ds-bottom-nav-icon" />
                            <span>Dashboard</span>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="ds-container ds-page"
    >
        {children}
    </motion.div>
);

// Protected route component
const ProtectedRoute = ({ user, allowedRole, children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
    return children;
};

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="ds-app">
                <Navbar user={user} handleLogout={handleLogout} />
                <AnimatePresence mode="wait">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={
                            user ? <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace /> :
                            <PageWrapper><Login setUser={setUser} /></PageWrapper>
                        } />
                        <Route path="/register" element={
                            user ? <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace /> :
                            <PageWrapper><Register /></PageWrapper>
                        } />

                        {/* Protected Patient Routes */}
                        <Route path="/patient-dashboard" element={
                            <ProtectedRoute user={user} allowedRole="patient">
                                <PageWrapper><PatientDashboard /></PageWrapper>
                            </ProtectedRoute>
                        } />

                        {/* Protected Doctor Routes */}
                        <Route path="/doctor-dashboard" element={
                            <ProtectedRoute user={user} allowedRole="doctor">
                                <PageWrapper><DoctorDashboard /></PageWrapper>
                            </ProtectedRoute>
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={
                            user ? (
                                <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        } />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
                <BottomNav user={user} />
            </div>
        </Router>
    );
};

export default App;
