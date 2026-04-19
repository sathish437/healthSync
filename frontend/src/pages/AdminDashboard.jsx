import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Activity, 
    Shield, 
    Zap, 
    BarChart3, 
    Users, 
    Building2,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ appointments: [], doctors: [], hospitals: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [appointments, doctors, hospitals] = await Promise.all([
                axios.get('http://localhost:5000/api/appointments/admin/all'),
                axios.get('http://localhost:5000/api/doctors'),
                axios.get('http://localhost:5000/api/appointments/hospitals')
            ]);
            setStats({ 
                appointments: appointments.data, 
                doctors: doctors.data, 
                hospitals: hospitals.data 
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const urgencyData = [
        { name: 'Emergency', value: stats.appointments.filter(a => a.urgency_level === 'emergency').length, color: '#EF4444' },
        { name: 'High', value: stats.appointments.filter(a => a.urgency_level === 'high').length, color: '#F59E0B' },
        { name: 'Normal', value: stats.appointments.filter(a => a.urgency_level === 'medium' || a.urgency_level === 'low').length, color: '#34D399' }
    ];

    const utilizationData = [
        { day: 'Mon', load: 65 },
        { day: 'Tue', load: 80 },
        { day: 'Wed', load: 75 },
        { day: 'Thu', load: 95 },
        { day: 'Fri', load: 85 },
        { day: 'Sat', load: 40 },
        { day: 'Sun', load: 30 }
    ];

    if (loading) return (
        <div className="ds-flex ds-justify-center ds-items-center ds-py-16">
            <div className="ds-spinner ds-mr-3" />
            <span className="ds-body ds-text-secondary">Loading dashboard...</span>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="ds-page-header ds-flex ds-justify-between ds-items-start">
                <div>
                    <div className="ds-flex ds-items-center ds-gap-4 ds-mb-2">
                        <Shield className="ds-text-primary" size={40} />
                        <h1 className="ds-page-title">Admin Dashboard</h1>
                    </div>
                    <p className="ds-page-subtitle">System overview and analytics</p>
                </div>
                <div className="ds-flex ds-gap-3">
                    <button className="ds-btn ds-btn-secondary ds-btn-sm"><Activity size={16} /> Logs</button>
                    <button className="ds-btn ds-btn-primary ds-btn-sm"><Zap size={16} /> Optimize</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="ds-dashboard-grid ds-mb-6">
                <div className="ds-col-4">
                    <div className="ds-card ds-border-l-4 ds-border-l-[var(--color-primary)]">
                        <div className="ds-flex ds-justify-between ds-items-start ds-mb-4">
                            <div className="ds-p-3 ds-rounded-xl ds-bg-primary/10 ds-text-primary"><Users size={24} /></div>
                            <span className="ds-badge ds-badge-accent ds-text-xs">+12%</span>
                        </div>
                        <p className="ds-caption ds-text-secondary ds-mb-1">Total Patients</p>
                        <p className="ds-h2">{stats.appointments.length * 4 + 128}</p>
                    </div>
                </div>
                <div className="ds-col-4">
                    <div className="ds-card ds-border-l-4 ds-border-l-[var(--color-secondary)]">
                        <div className="ds-flex ds-justify-between ds-items-start ds-mb-4">
                            <div className="ds-p-3 ds-rounded-xl ds-bg-secondary/10 ds-text-secondary"><Building2 size={24} /></div>
                            <span className="ds-badge ds-badge-success ds-text-xs">Active</span>
                        </div>
                        <p className="ds-caption ds-text-secondary ds-mb-1">Hospitals</p>
                        <p className="ds-h2">{stats.hospitals.length}</p>
                    </div>
                </div>
                <div className="ds-col-4">
                    <div className="ds-card ds-border-l-4 ds-border-l-[var(--color-accent)]">
                        <div className="ds-flex ds-justify-between ds-items-start ds-mb-4">
                            <div className="ds-p-3 ds-rounded-xl ds-bg-accent/10 ds-text-accent"><BarChart3 size={24} /></div>
                            <span className="ds-badge ds-badge-secondary ds-text-xs">98%</span>
                        </div>
                        <p className="ds-caption ds-text-secondary ds-mb-1">Appointments</p>
                        <p className="ds-h2">{stats.appointments.length}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="ds-dashboard-grid ds-mb-6">
                <div className="ds-col-8">
                    <div className="ds-card">
                        <div className="ds-flex ds-items-center ds-gap-3 ds-mb-6">
                            <TrendingUp className="ds-text-primary" size={24} />
                            <h3 className="ds-h3">Weekly Load</h3>
                        </div>
                        <div className="ds-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={utilizationData}>
                                    <defs>
                                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4C3AFF" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4C3AFF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#1E2430', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}
                                    />
                                    <Area type="monotone" dataKey="load" stroke="#4C3AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="ds-col-4">
                    <div className="ds-card ds-text-center">
                        <h3 className="ds-h3 ds-mb-4">Urgency Distribution</h3>
                        <div className="ds-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={urgencyData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {urgencyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#1E2430', borderRadius: '12px', border: 'none'}}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ds-grid ds-grid-cols-3 ds-gap-2 ds-mt-4">
                            {urgencyData.map(d => (
                                <div key={d.name}>
                                    <p className="ds-caption ds-text-secondary ds-mb-1">{d.name}</p>
                                    <p className="ds-h3" style={{color: d.color}}>{d.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctors List */}
            <div className="ds-card">
                <h3 className="ds-h3 ds-mb-5">Active Practitioners</h3>
                <div className="ds-dashboard-grid">
                    {stats.doctors.map(doc => (
                        <div key={doc.id} className="ds-col-4">
                            <div className="ds-flex ds-items-center ds-justify-between ds-p-4 ds-rounded-xl ds-bg-[var(--color-surface)]">
                                <div className="ds-flex ds-items-center ds-gap-3">
                                    <div className="ds-w-10 ds-h-10 ds-rounded-lg ds-bg-primary/10 ds-flex ds-items-center ds-justify-center ds-text-primary ds-font-bold">
                                        {doc.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="ds-body-sm ds-font-semibold">{doc.name}</p>
                                        <p className="ds-caption ds-text-secondary">{doc.specialization}</p>
                                    </div>
                                </div>
                                <span className="ds-badge ds-badge-success">Active</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
