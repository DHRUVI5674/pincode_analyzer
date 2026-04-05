import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  MapPin, BarChart2, Truck, Package,
  RefreshCw, Loader2, Activity, Clock,
  Send, Mail, Globe, Cpu, ShieldCheck,
  CheckCircle, MessageSquare,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const EJ_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'service_vehl12p';
const EJ_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'service_vehl12p';
const EJ_PUBKEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'QKFS18dSWKVZLrE8g';

import { API_BASE_URL as API_URL } from '../services/api';

/* ── palette exactly matching reference ── */
const BAR_PALETTE = ['#6366f1','#f43f5e','#10b981','#f59e0b','#8b5cf6','#6366f1','#f43f5e','#10b981','#f59e0b','#8b5cf6'];
const BG     = '#0c0e14';
const CARD   = '#141720';
const CARD2  = '#191d2b';
const BORDER = '#1f2438';
const TEXT   = '#f1f5f9';
const MUTED  = '#5a6380';
const SUB    = '#3a4060';

/* ── custom tooltip ── */
const HudTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1d2e', border: '1px solid #2d3149',
      borderRadius: 10, padding: '10px 14px', fontSize: 11,
    }}>
      {label && <p style={{ color: MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>{label}</p>}
      <p style={{ color: payload[0].fill || '#6366f1', fontWeight: 800 }}>
        {payload[0].value?.toLocaleString()}
      </p>
    </div>
  );
};

/* ── input style helper ── */
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: '#0e1118', border: `1px solid ${BORDER}`,
  borderRadius: 12, padding: '12px 16px',
  color: TEXT, fontSize: 13, outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'border-color 0.2s',
};

/* ════════════════════════════════════════ */
const Dashboard = () => {
  const [stats,     setStats]     = useState(null);
  const [stateDist, setStateDist] = useState([]);
  const [delivery,  setDelivery]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [liveTime,  setLiveTime]  = useState(new Date());

  /* contact form */
  const formRef = useRef(null);
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  /* initialise EmailJS once */
  useEffect(() => { emailjs.init(EJ_PUBKEY); }, []);

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, dRes, dlRes] = await Promise.all([
        axios.get(`${API_URL}/stats`),
        axios.get(`${API_URL}/stats/state-distribution`),
        axios.get(`${API_URL}/stats/delivery-distribution`),
      ]);
      const raw = sRes.data?.data ?? sRes.data;
      setStats(raw);
      setStateDist(dRes.data.slice(0, 10));
      setDelivery(dlRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const total  = (delivery?.delivery ?? 0) + (delivery?.nonDelivery ?? 0);
  const dlPct  = total ? Math.round((delivery.delivery / total) * 100) : 94;
  const ndPct  = 100 - dlPct;
  const donut  = [
    { name: 'Delivery',     value: delivery?.delivery    ?? 0 },
    { name: 'Non-Delivery', value: delivery?.nonDelivery ?? 0 },
  ];

  const METRICS = [
    { heading: 'GLOBAL DISTRIBUTION', value: stats?.totalPincodes,         fallback: '154,823', sub: 'UNIQUE HUB IDS',        icon: MapPin,    grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: '#6366f130' },
    { heading: 'REGIONAL SEGMENTS',   value: stats?.totalStates,            fallback: '34',      sub: 'ACTIVE JURISDICTIONS',  icon: BarChart2, grad: 'linear-gradient(135deg,#f43f5e,#f97316)', glow: '#f43f5e30' },
    { heading: 'DELIVERY NODES',      value: stats?.deliveryOffices,        fallback: '145,251', sub: 'LAST-MILE COVERAGE',    icon: Truck,     grad: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: '#10b98130' },
    { heading: 'OPERATIONAL ASSETS',  value: stats?.nonDeliveryOffices,     fallback: '9,572',   sub: 'LOGISTIC SUPPORT',      icon: Package,   grad: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: '#f59e0b30' },
  ];

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      await emailjs.sendForm(EJ_SERVICE, EJ_TEMPLATE, formRef.current, EJ_PUBKEY);
      setSent(true);
      toast.success('Message sent successfully! We\'ll reply within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error('EmailJS error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 style={{ width: 40, height: 40, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: MUTED, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', margin: 0 }}>
          Synchronising Intelligence…
        </p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ══ Top bar ══ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ color: MUTED, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>
              LIVE MODE · {liveTime.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 18px #6366f140', color: '#fff', fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
          </button>
        </div>

        {/* ══ Metric Cards — exactly matching reference ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
          {METRICS.map((m, i) => (
            <div key={i} style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 22,
              padding: '22px 24px', position: 'relative', overflow: 'hidden',
              transition: 'transform 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* corner glow */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: m.grad, opacity: 0.15, transform: 'translate(40%,-40%)', filter: 'blur(18px)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <p style={{ color: MUTED, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', maxWidth: 110, lineHeight: 1.6, margin: 0 }}>
                  {m.heading}
                </p>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: m.grad, boxShadow: `0 4px 16px ${m.glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <m.icon style={{ width: 18, height: 18, color: '#fff' }} />
                </div>
              </div>

              <p style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 6px 0' }}>
                {m.value != null ? Number(m.value).toLocaleString() : m.fallback}
              </p>
              <p style={{ color: SUB, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', margin: 0 }}>
                {m.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ══ Charts Row — Bar + Donut ══ */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1.65fr_1fr] gap-4">

          {/* ── Segmental Density Bar Chart ── */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Activity style={{ width: 14, height: 14, color: '#6366f1' }} />
                <h2 style={{ color: TEXT, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.35em', margin: 0 }}>
                  Segmental Density (Top 10)
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: '#1a1f30', border: `1px solid ${BORDER}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                <span style={{ color: '#6366f1', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Live Mode Stats
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={stateDist} margin={{ left: -18, right: 4, bottom: 60, top: 4 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="state"
                  angle={-35} textAnchor="end" height={70} interval={0}
                  tick={{ fill: MUTED, fontSize: 9, fontWeight: 700 }}
                  stroke="transparent"
                  tickFormatter={v => (v ?? '').trim()}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 9, fontWeight: 700 }}
                  stroke="transparent"
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000) * 1000 === v ? v / 1000 : (v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip content={<HudTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="count" name="Offices" radius={[6, 6, 0, 0]}>
                  {stateDist.map((_, i) => (
                    <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Coverage Mix Donut ── */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock style={{ width: 14, height: 14, color: '#10b981' }} />
              <h2 style={{ color: TEXT, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.35em', margin: 0 }}>
                Coverage Mix
              </h2>
            </div>

            {/* Donut */}
            <div style={{ position: 'relative', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut} cx="50%" cy="50%"
                    innerRadius={72} outerRadius={102}
                    paddingAngle={6} dataKey="value"
                    startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip content={<HudTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* centre label */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#10b981', letterSpacing: '-0.04em', lineHeight: 1 }}>{dlPct}%</span>
                <span style={{ color: MUTED, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: 5 }}>
                  Global Accuracy
                </span>
              </div>
            </div>

            {/* Legend tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Delivery Nodes', color: '#10b981', value: delivery?.delivery },
                { label: 'Support Assets', color: '#f59e0b', value: delivery?.nonDelivery },
              ].map((l, i) => (
                <div key={i} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span style={{ color: MUTED, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{l.label}</span>
                  </div>
                  <p style={{ color: TEXT, fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                    {l.value?.toLocaleString() ?? '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary table */}
            <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ color: SUB, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.35em', margin: 0 }}>
                  Network Summary
                </p>
              </div>
              {[
                { label: 'Total Records',  value: stats?.totalPincodes?.toLocaleString() ?? '—' },
                { label: 'Active Regions', value: stats?.totalStates ?? 36 },
                { label: 'Delivery Rate',  value: `${dlPct}%` },
                { label: 'Support Rate',   value: `${ndPct}%` },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <span style={{ color: MUTED, fontSize: 10, fontWeight: 700 }}>{row.label}</span>
                  <span style={{ color: TEXT, fontSize: 11, fontWeight: 900 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Send Message Section ══ */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 22, overflow: 'hidden' }}>

          {/* header strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 28px', borderBottom: `1px solid ${BORDER}`, background: CARD2 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: 15, height: 15, color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ color: TEXT, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>
                Send a Message
              </h2>
              <p style={{ color: MUTED, fontSize: 10, margin: '2px 0 0 0' }}>We'll respond within 24 hours</p>
            </div>
          </div>

          {/* body */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 0 }}>

            {/* Left – info panel */}
            <div style={{ padding: '28px 32px', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <p style={{ color: MUTED, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.35em', margin: '0 0 10px 0' }}>
                  Contact Info
                </p>
                <h3 style={{ color: TEXT, fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                  Get in Touch<br /><span style={{ color: '#6366f1' }}>with Nexus OS</span>
                </h3>
                <p style={{ color: MUTED, fontSize: 12, marginTop: 10, lineHeight: 1.7 }}>
                  Questions about India's pincode intelligence platform? Drop us a message and our team will be in touch.
                </p>
              </div>

              {[
                { icon: Mail,   text: 'support@nexusos.in' },
                { icon: Globe,  text: 'nexusos.in' },
                { icon: MapPin, text: 'India · 28 states + UTs' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: '#6366f112', border: '1px solid #6366f128', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon style={{ width: 15, height: 15, color: '#6366f1' }} />
                  </div>
                  <span style={{ color: MUTED, fontSize: 12, fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}

              {/* system status dots */}
              <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { dot: '#10b981', label: 'API · Nominal' },
                  { dot: '#6366f1', label: 'DB · Connected' },
                  { dot: '#f59e0b', label: 'Cache · Warm' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
                    <span style={{ color: SUB, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – form */}
            <form ref={formRef} onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                {[
                  { name: 'name', placeholder: 'Your Name *',    type: 'text',  key: 'name' },
                  { name: 'email', placeholder: 'Email Address *', type: 'email', key: 'email' },
                ].map(f => (
                  <input
                    key={f.key}
                    name={f.name} type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                ))}
              </div>

              <input
                name="subject" type="text" placeholder="Subject (optional)"
                value={form.subject} onChange={handleInput}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = BORDER}
              />

              <textarea
                name="message" placeholder="Your message *" rows={5}
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = BORDER}
              />

              <button
                type="submit" disabled={sending || sent}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 13, border: 'none',
                  cursor: sending || sent ? 'not-allowed' : 'pointer',
                  background: sent
                    ? 'linear-gradient(135deg,#10b981,#06b6d4)'
                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  boxShadow: '0 4px 20px #6366f140',
                  color: '#fff', fontWeight: 900, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.2em',
                  transition: 'opacity 0.2s', opacity: sending ? 0.7 : 1,
                }}
                onMouseOver={e => { if (!sending && !sent) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseOut={e => e.currentTarget.style.filter = 'none'}
              >
                {sent
                  ? <><CheckCircle style={{ width: 15, height: 15 }} /> Sent!</>
                  : sending
                  ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Sending…</>
                  : <><Send style={{ width: 15, height: 15 }} /> Send Message</>
                }
              </button>

              <p style={{ color: SUB, fontSize: 10, textAlign: 'center', margin: 0 }}>
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </div>
        </div>

        {/* ══ Status bar ══ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { dot: '#10b981', label: 'API · Nominal' },
              { dot: '#6366f1', label: 'DB · Connected' },
              { dot: '#f59e0b', label: 'Cache · Warm' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
                <span style={{ color: SUB, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <span style={{ color: SUB, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            India Postal Intelligence · Build 4.2
          </span>
        </div>

      </div>{/* /page wrapper */}

      {/* ════ Modern Footer ════ */}
      <footer style={{ background: '#06080e', borderTop: `1px solid ${BORDER}`, padding: '52px 20px 24px', marginTop: 8 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36, marginBottom: 40 }}>

            {/* Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 8, borderRadius: 10, background: '#6366f112', border: '1px solid #6366f128' }}>
                  <Cpu style={{ width: 17, height: 17, color: '#6366f1' }} />
                </div>
                <span style={{ color: TEXT, fontSize: 17, fontWeight: 900, letterSpacing: '-0.02em' }}>
                  NEXUS <span style={{ color: '#6366f1' }}>OS</span>
                </span>
              </div>
              <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.75, margin: 0 }}>
                High-precision logistics intelligence matrix for India's domestic postal distribution network.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[Globe, Mail, Send].map((Icon, i) => (
                  <a key={i} href="#"
                    style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111420', border: `1px solid ${BORDER}`, color: '#6366f1', textDecoration: 'none', transition: 'border-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseOut={e => e.currentTarget.style.borderColor = BORDER}
                  >
                    <Icon style={{ width: 13, height: 13 }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Core Modules */}
            <div>
              <p style={{ color: SUB, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: 18 }}>Core_Modules</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[['Dashboard','/'],[' Geo Explore','/explore'],['Analytics','/analytics'],['Map View','/map-integration']].map(([name,path]) => (
                  <li key={path}>
                    <Link to={path}
                      style={{ color: MUTED, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#6366f1'}
                      onMouseOut={e => e.currentTarget.style.color = MUTED}
                    >
                      <span style={{ fontSize: 7, color: '#6366f1' }}>▶</span>{name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Vectors */}
            <div>
              <p style={{ color: SUB, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: 18 }}>Data_Vectors</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[['Bulk Search','/bulk-search'],['Delivery Time','/delivery-estimator'],['Comparison','/comparison'],['Favourites','/favorites-system']].map(([name,path]) => (
                  <li key={path}>
                    <Link to={path}
                      style={{ color: MUTED, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#10b981'}
                      onMouseOut={e => e.currentTarget.style.color = MUTED}
                    >
                      <span style={{ fontSize: 7, color: '#10b981' }}>▶</span>{name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Status */}
            <div style={{ background: '#0c0f1a', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span style={{ color: '#10b981', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em' }}>System Online</span>
              </div>
              {[
                { label: 'API Status',  val: 'Nominal',   c: '#10b981' },
                { label: 'DB Uplink',   val: 'Connected', c: '#6366f1' },
                { label: 'Cache Layer', val: 'Warm',      c: '#f59e0b' },
                { label: 'Build',       val: 'v4.2.0',    c: MUTED },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: MUTED, fontSize: 10, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ color: s.c, fontSize: 10, fontWeight: 900 }}>{s.val}</span>
                </div>
              ))}
              <div style={{ height: 3, background: '#131620', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: 4 }} />
              </div>
              <p style={{ color: SUB, fontSize: 9, textAlign: 'right', margin: 0 }}>78% capacity</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop: 18, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: SUB, fontSize: 11, fontWeight: 700 }}>
              © {new Date().getFullYear()} NEXUS OS — India Postal Intelligence · All rights reserved
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {['Privacy','Terms','Security'].map(t => (
                <a key={t} href="#"
                  style={{ color: SUB, fontSize: 11, fontWeight: 700, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseOut={e => e.currentTarget.style.color = SUB}
                >{t}</a>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck style={{ width: 12, height: 12, color: '#10b981' }} />
                <span style={{ color: SUB, fontSize: 10, fontWeight: 700 }}>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default Dashboard;
