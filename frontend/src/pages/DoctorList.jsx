import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Star, Clock, Activity, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpec, setSelectedSpec] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/doctors");
                setDoctors(res.data);
            } catch (err) {
                console.error("Failed to fetch doctors:", err);
            }
        };
        fetchDoctors();
    }, []);

    const specializations = ["All", ...new Set(doctors.map(d => d.specialization))];

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpec = selectedSpec === "All" || doctor.specialization === selectedSpec;
        return matchesSearch && matchesSpec;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 24, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div>
            {/* Page Header */}
            <header className="ds-page-header">
                <h1 className="ds-page-title">Find Your Specialist</h1>
                <p className="ds-page-subtitle">Book appointments with top-rated doctors across various specialties.</p>
            </header>

            {/* Search & Filter Section */}
            <div className="ds-dashboard-grid ds-mb-6">
                <div className="ds-col-8">
                    <div className="ds-input-wrapper">
                        <Search className="ds-input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by doctor name or specialization..."
                            className="ds-input ds-input-with-icon"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="ds-col-4">
                    <div className="ds-flex ds-gap-2 ds-flex-wrap">
                        {specializations.slice(0, 4).map(spec => (
                            <motion.button
                                key={spec}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setSelectedSpec(spec)}
                                className={`ds-btn ds-btn-sm ${selectedSpec === spec ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                            >
                                {spec}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Filter Pills */}
            {specializations.length > 4 && (
                <div className="ds-flex ds-gap-2 ds-flex-wrap ds-mb-6">
                    {specializations.slice(4).map(spec => (
                        <motion.button
                            key={spec}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSelectedSpec(spec)}
                            className={`ds-btn ds-btn-sm ${selectedSpec === spec ? 'ds-btn-primary' : 'ds-btn-ghost'}`}
                        >
                            {spec}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Doctor Cards Grid */}
            <motion.div
                className="ds-dashboard-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode="popLayout">
                    {filteredDoctors.map(doctor => (
                        <motion.div
                            key={doctor.id}
                            variants={itemVariants}
                            layout
                            className="ds-col-4"
                        >
                            <div className="ds-card ds-card-hover ds-h-full">
                                {/* Card Header */}
                                <div className="ds-flex ds-gap-4 ds-mb-5">
                                    <div className="ds-flex ds-items-center ds-justify-center ds-w-16 ds-h-16 ds-rounded-xl ds-bg-primary/10 ds-text-primary ds-font-bold ds-text-xl ds-shrink-0">
                                        {doctor.name.charAt(0)}
                                    </div>
                                    <div className="ds-flex-1 ds-min-w-0">
                                        <h3 className="ds-h3 ds-truncate">{doctor.name}</h3>
                                        <span className="ds-badge ds-badge-primary">{doctor.specialization}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="ds-card-body ds-mb-5">
                                    <div className="ds-flex ds-items-center ds-gap-2 ds-body-sm ds-text-primary">
                                        <Clock size={16} className="ds-text-secondary" />
                                        <span>{doctor.experience || "10+"} Years Experience</span>
                                    </div>
                                    <div className="ds-flex ds-items-center ds-gap-2 ds-body-sm ds-text-secondary">
                                        <MapPin size={16} />
                                        <span>HealthSync Medical Center</span>
                                    </div>
                                    <p className="ds-body-sm ds-text-secondary ds-line-clamp-2">
                                        {doctor.description || "Expert medical practitioner providing high-quality care with a focus on patient comfort."}
                                    </p>
                                </div>

                                {/* Card Footer */}
                                <div className="ds-flex ds-items-center ds-justify-between ds-pt-4 ds-border-t ds-border-[var(--color-border)]">
                                    <div className="ds-flex ds-items-center ds-gap-1 ds-body-sm ds-text-accent">
                                        <Star size={16} fill="currentColor" /> 
                                        <span className="ds-font-semibold">4.9</span>
                                        <span className="ds-text-muted ds-text-xs">(120+)</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(`/book/${doctor.id}`)}
                                        className="ds-btn ds-btn-primary ds-btn-sm"
                                    >
                                        Book Now
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredDoctors.length === 0 && (
                <div className="ds-card ds-text-center ds-py-16">
                    <Activity className="ds-mx-auto ds-mb-4 ds-text-muted" size={48} />
                    <p className="ds-body ds-text-secondary">No specialists found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default DoctorList;
