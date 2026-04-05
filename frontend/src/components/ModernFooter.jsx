import React from 'react';
import { Globe, MessageCircle, Briefcase, Mail, MapPin, ExternalLink, ShieldCheck, Cpu, Terminal as TerminalIcon, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ModernFooter = () => {
    const { darkMode } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`relative border-t py-20 overflow-hidden ${darkMode ? 'bg-[#020408] border-[var(--neon-cyan)]/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
            <div className="scanline opacity-5"></div>
            <div className="absolute top-0 right-0 p-8 flex flex-col items-end opacity-5 font-mono text-[8px] pointer-events-none">
                <span>ENCRYPT_SEC_V4.2</span>
                <span>DATA_STREAM_ALPHA</span>
                <span>SYS_INIT_COMPLETE</span>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    
                    {/* Brand HUD */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border flex items-center justify-center ${darkMode ? 'border-[var(--neon-cyan)]/30 bg-[var(--neon-cyan)]/5' : 'bg-indigo-100 border-indigo-200'}`}>
                                <Cpu className={`w-5 h-5 ${darkMode ? 'text-[var(--neon-cyan)] animate-pulse-cyan' : 'text-indigo-600'}`} />
                            </div>
                            <span className="text-xl font-black tracking-tighter">NEXUS <span className={darkMode ? 'text-[var(--neon-cyan)]' : 'text-indigo-600'}>OS</span></span>
                        </div>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] leading-relaxed">
                            A high-precision logistics intelligence matrix for domestic distribution analysis.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { Icon: Globe, label: 'Website' },
                                { Icon: Send, label: 'Social' },
                                { Icon: Briefcase, label: 'Work' },
                                { Icon: Mail, label: 'Email' }
                            ].map(({ Icon, label }, i) => (
                                <a key={i} href="#" aria-label={label} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${darkMode ? 'border-white/10 hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]' : 'bg-white border-gray-200 hover:border-indigo-400 text-indigo-600'}`}>
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation HUD */}
                    <div>
                        <h4 className="text-[10px] font-mono font-black opacity-30 tracking-[0.4em] uppercase mb-10">CORE_MODULES</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Terminal Home', path: '/' },
                                { name: 'Geo Scan', path: '/explore' },
                                { name: 'System Metrics', path: '/analytics' },
                                { name: 'Tactical Maps', path: '/map-integration' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--neon-cyan)] transition-all">
                                        <div className="w-1 h-1 bg-[var(--neon-cyan)] opacity-0 group-hover:opacity-100" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Technical HUD */}
                    <div>
                        <h4 className="text-[10px] font-mono font-black opacity-30 tracking-[0.4em] uppercase mb-10">DATA_VECTORS</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Bulk matrix', path: '/bulk-search' },
                                { name: 'Vector Route', path: '/delivery-estimator' },
                                { name: 'Node parity', path: '/comparison' },
                                { name: 'Secure Nodes', path: '/favorites-system' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-[var(--neon-rose)] transition-all">
                                        <div className="w-1 h-1 bg-[var(--neon-rose)] opacity-0 group-hover:opacity-100" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Status HUD */}
                    <div className="hud-module p-8 rounded-2xl border-white/5 bg-white/5">
                        <div className="hud-bracket hud-bracket-tl opacity-20"></div>
                        <div className="hud-bracket hud-bracket-br opacity-20"></div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                            <span className="text-[10px] font-mono font-black text-emerald-500 tracking-widest uppercase">UPTIME_ACTIVE</span>
                        </div>
                        <div className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-4">UPLINK_A32.9_STABLE</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-[var(--neon-cyan)] animate-pulse-cyan"></div>
                        </div>
                    </div>

                </div>

                {/* Final Trace */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px]">
                    <div className="text-xs font-black tracking-tighter opacity-20">
                         © {currentYear} NEXUS_OS // LOGISTICS_INTELLIGENCE_CORE
                    </div>
                    <div className="flex items-center gap-8 opacity-40">
                        <a href="#" className="hover:text-[var(--neon-cyan)] transition-colors">PRIVACY_PROTO</a>
                        <a href="#" className="hover:text-[var(--neon-cyan)] transition-colors">SYS_TERMS</a>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>NODE_SECURE</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ModernFooter;
