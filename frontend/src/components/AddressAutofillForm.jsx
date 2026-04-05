import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Copy, Check, Sparkles, Navigation, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddressAutofillForm = () => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    pincode: '',
    addressLine: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    country: 'India'
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode }));

    if (pincode.length === 6) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/address-autofill/${pincode}`);
        const data = await response.json();
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            city: data.address.postOffice || '',
            district: data.address.district || '',
            state: data.address.state || ''
          }));
          toast.success('Smart lookup complete');
        } else {
            toast.error('Node not found');
        }
      } catch (error) {
        toast.error('Lookup system offline');
      } finally {
        setLoading(false);
      }
    }
  };

  const copyAddress = () => {
    const fullAddress = `${formData.addressLine}${formData.landmark ? ', ' + formData.landmark : ''}\n${formData.city}, ${formData.district}\n${formData.state} - ${formData.pincode}\n${formData.country}`;
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Address copied');
  };

  const resetForm = () => {
      setFormData({
        pincode: '',
        addressLine: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        country: 'India'
      });
  };

  return (
    <div className={`max-w-4xl mx-auto p-1 border rounded-[3rem] transition-all duration-500 overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'}`}>
      <div className={`p-8 lg:p-12 rounded-[2.9rem] ${darkMode ? 'bg-[#0b0d14]' : 'bg-white'}`}>
        <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-indigo-500 text-white rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
                <Sparkles className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight">Smart <span className="text-indigo-500">Checkout</span></h1>
                <p className="text-sm font-medium opacity-50 uppercase tracking-widest leading-none mt-1">Intuitive Address Synthesis</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Pincode *</label>
                    <div className="relative group">
                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${loading ? 'animate-pulse text-indigo-500' : 'opacity-30 group-focus-within:opacity-100 group-focus-within:text-indigo-500'}`} />
                        <input 
                            type="text" value={formData.pincode} onChange={handlePincodeChange}
                            className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:bg-white/10' : 'bg-gray-50 border-gray-200 focus:bg-white'} focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-lg`}
                            placeholder="6-digit PIN"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase tracking-widest opacity-40 mb-2">Detailed Address</label>
                    <textarea 
                        value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})}
                        className={`w-full px-4 py-4 h-32 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:bg-white/10' : 'bg-gray-50 border-gray-200 focus:bg-white'} outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none`}
                        placeholder="Street, Building, Flat No..."
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {[
                        { label: 'City / PO', key: 'city', icon: Navigation },
                        { label: 'District', key: 'district' },
                        { label: 'State', key: 'state' }
                    ].map(field => (
                        <div key={field.key}>
                            <label className="block text-xs font-black uppercase tracking-widest opacity-40 mb-2">{field.label}</label>
                            <input 
                                type="text" readOnly value={formData[field.key]}
                                className={`w-full px-4 py-4 rounded-2xl border transition-all cursor-not-allowed opacity-60 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} font-bold shadow-inner`}
                                placeholder="Locked field"
                            />
                        </div>
                    ))}
                </div>
                
                <div className="pt-4 flex gap-4">
                    <button 
                        onClick={copyAddress}
                        disabled={!formData.pincode || !formData.city}
                        className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        Copy Result
                    </button>
                    <button onClick={resetForm} className={`px-6 py-4 rounded-2xl border font-bold transition-all hover:bg-rose-500/10 hover:text-rose-500 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <div className={`mt-12 p-6 rounded-[2rem] border transition-all duration-700 ${formData.pincode.length === 6 && formData.city ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'} ${darkMode ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Synthesis active: Haversine-optimized address resolution enabled</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddressAutofillForm;
