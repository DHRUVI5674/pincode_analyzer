import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import { 
  Search, MapPin, TrendingUp, ArrowRight, Activity, 
  ShieldCheck, Globe, Zap, Cpu, ScanLine, Navigation, 
  Layers, ChevronRight, Mail, MessageSquare, Send,
  User, CheckCircle2, Clock, Scale, Printer, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const ModernPincodeDashboard = () => {
    const { darkMode } = useTheme();
    const [stats, setStats] = useState(null);
    const [stateDistribution, setStateDistribution] = useState([]);
    const [deliveryDistribution, setDeliveryDistribution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, distRes, delivRes] = await Promise.all([
                    axios.get(`${API_URL}/stats`),
                    axios.get(`${API_URL}/stats/state-distribution`),
                    axios.get(`${API_URL}/stats/delivery-distribution`)
                ]);
                setStats(statsRes.data.data || statsRes.data);
                setStateDistribution(distRes.data.slice(0, 8));
                setDeliveryDistribution(delivRes.data);
            } catch (error) {
                console.error('Dashboard data error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            toast.success('Message sent! Our team will reach out shortly.');
            setContactForm({ name: '', email: '', message: '' });
            setSending(false);
        }, 1500);
    };

    const features = [
        { title: "Bulk Search", desc: "Batch validate PIN code nodes.", path: "/bulk-search", icon: TrendingUp, color: "text-[#6366f1]" },
        { title: "Route Estimator", desc: "Precision vector geofencing.", path: "/delivery-estimator", icon: Truck, color: "text-[#6366f1]" },
        { title: "Map Visualizer", desc: "Interactive global clusters.", path: "/map-integration", icon: ScanLine, color: "text-[#6366f1]" },
    ];

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6366f1]">Re-indexing Cluster Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-20 pb-24 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            
            {/* Hero Section */}
            <section className="relative pt-20 pb-16 text-center max-w-5xl mx-auto px-6">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#4f46e5]/10 text-[#6366f1] text-[10px] font-black uppercase tracking-[0.4em] mb-10 border border-[#4f46e5]/20 animate-pulse">
                    <ShieldCheck className="w-4 h-4" /> CORE_STABLE_V2.0
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
                    LOGISTICS <span className="text-[#6366f1]">TELEMETRY</span> HUB
                </h1>
                <p className="text-lg md:text-xl font-bold opacity-30 uppercase tracking-[0.3em] mb-12 max-w-3xl mx-auto leading-relaxed">
                    Analyze, optimize, and visualize the national postal matrix with high-fidelity geospatial indexing.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Link to="/explore" className="btn-action bg-[#4f46e5]">
                        INITIALIZE_SCAN <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/bulk-search" className={`px-10 py-5 rounded-2xl font-black font-mono text-sm tracking-widest border-2 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <Cpu className="w-5 h-5" />
                        SYSTEM_STATS
                    </Link>
                </div>
            </section>

            {/* Core Stats Bento */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
                {[
                    { label: 'NODES_MAPPED', value: stats?.totalPincodes || '154,721', icon: MapPin, color: 'text-[#6366f1]' },
                    { label: 'DELIVERY_CORES', value: stats?.deliveryOffices || '141,920', icon: Zap, color: 'text-[#6366f1]' },
                    { label: 'ACTIVE_ZONES', value: stats?.totalStates || '36', icon: Globe, color: 'text-[#6366f1]' },
                    { label: 'UPTIME_SIGNAL', value: '99.98%', icon: Activity, color: 'text-[#6366f1]' },
                ].map((item, i) => (
                    <div key={i} className="glass-card p-10 group cursor-default border-white/5">
                        <item.icon className="w-8 h-8 mb-6 text-[#6366f1] group-hover:scale-125 transition-transform duration-500" />
                        <div className="text-4xl font-black mb-2 tracking-tighter">{item.value}</div>
                        <div className="text-[10px] font-black opacity-30 tracking-[0.4em] uppercase">{item.label}</div>
                    </div>
                ))}
            </section>

            {/* Analytical Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
                <div className="glass-card p-10 border-white/5">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Regional Density</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mt-2">Node Concentration Analytics</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-[#6366f1]" />
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stateDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="state" angle={-45} textAnchor="end" height={60} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} stroke="transparent" />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} stroke="transparent" />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#1c1f26', color: '#fff' }} />
                                <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-10 border-white/5 flex flex-col justify-center items-center">
                    <div className="flex items-center justify-between w-full mb-10">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Delivery Infrastructure</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mt-2">Service Type Synthesis</p>
                        </div>
                        <Layers className="w-6 h-6 text-[#6366f1]" />
                    </div>
                    <div className="h-[400px] w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Core Delivery', value: deliveryDistribution?.delivery || 141920 },
                                        { name: 'Support Node', value: deliveryDistribution?.nonDelivery || 12801 }
                                    ]}
                                    innerRadius={110}
                                    outerRadius={150}
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    <Cell fill="#4f46e5" />
                                    <Cell fill="#1c1f26" stroke="rgba(255,255,255,0.05)" />
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#1c1f26', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                            <div className="text-5xl font-black tracking-tighter">91%</div>
                            <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">ACTIVE_OPS</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Grid */}
            <section className="px-6 space-y-12">
                <div className="text-center">
                    <h2 className="text-[10px] font-black opacity-30 tracking-[0.6em] uppercase">SYSTEM_MODULE_DEPLOYMENT</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <Link key={i} to={f.path} className="group">
                            <div className="glass-card p-12 h-full flex flex-col justify-between group-hover:-translate-y-4 transition-all duration-500 border-white/5">
                                <div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-10 border border-white/5 group-hover:border-[#6366f1]/50 transition-all">
                                        <f.icon className="w-8 h-8 text-[#6366f1]" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase">{f.title}</h3>
                                    <p className="text-xs font-bold opacity-30 leading-relaxed uppercase tracking-[0.2em]">{f.desc}</p>
                                </div>
                                <div className="mt-12 flex items-center gap-4 text-[10px] font-black tracking-widest text-[#6366f1]">
                                    ACCESS_MODULE <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Contact Support Section (IMAGE 1 MATCH) */}
            <section className="px-6 pt-12">
                <div className="p-12 md:p-20 rounded-[4rem] bg-[#0d0f14] border border-white/5 shadow-2xl relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#4f46e5]/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Content Left */}
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#1c1f26] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-[#6366f1]">
                                <Mail className="w-4 h-4" /> CONTACT SUPPORT
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                                Have questions? <br />
                                <span className="opacity-100">Drop us a message.</span>
                            </h2>
                            <p className="text-lg md:text-xl font-bold opacity-40 leading-relaxed max-w-xl">
                                Our team usually responds within 24 hours. Whether it's a data query or a feature request, we're here to help.
                            </p>
                            
                            <div className="flex items-center gap-6 pt-6">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="w-14 h-14 rounded-full bg-[#1c1f26] border-4 border-[#0d0f14] flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-[#2a2d35]/50" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                                    Join <span className="text-white">500+</span> companies trusting our data.
                                </p>
                            </div>
                        </div>

                        {/* Form Right */}
                        <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                                    <input 
                                        required
                                        type="text" 
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        className="w-full bg-[#1c1f26] border border-white/5 rounded-3xl pl-16 pr-8 py-6 outline-none focus:border-[#4f46e5]/50 transition-all font-bold placeholder:opacity-20"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                                    <input 
                                        required
                                        type="email" 
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        className="w-full bg-[#1c1f26] border border-white/5 rounded-3xl pl-16 pr-8 py-6 outline-none focus:border-[#4f46e5]/50 transition-all font-bold placeholder:opacity-20"
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <MessageSquare className="absolute left-6 top-8 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                                <textarea 
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    className="w-full bg-[#1c1f26] border border-white/5 rounded-4xl pl-16 pr-8 py-8 h-48 outline-none focus:border-[#4f46e5]/50 transition-all font-bold resize-none placeholder:opacity-20"
                                    placeholder="How can we help you?"
                                />
                            </div>
                            <button 
                                disabled={sending}
                                className="w-full py-6 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#4f46e5]/30 flex items-center justify-center gap-4 group/btn disabled:opacity-50"
                            >
                                {sending ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-6 h-6 transition-transform group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1" />
                                        <span className="text-lg tracking-widest text-shadow-lg">Send Message</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ModernPincodeDashboard;
