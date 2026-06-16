import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const PortalLogin = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/portal/send-otp', { email });
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/portal/login', { email, otp });
            localStorage.setItem('customerToken', data.token);
            localStorage.setItem('customerInfo', JSON.stringify(data));
            toast.success('Login Successful');
            navigate('/portal/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-outfit">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent)] pointer-events-none" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex justify-center mb-8">
                    <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                        <Car className="h-10 w-10" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Customer Portal</h2>
                    <p className="text-slate-400 font-bold mt-2">Track your repairs and manage invoices.</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary transition-all font-bold"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center uppercase tracking-widest text-sm"
                        >
                            {loading ? 'Sending...' : 'Send Login OTP'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary transition-all font-bold tracking-[1em] text-center"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center uppercase tracking-widest text-sm"
                        >
                            {loading ? 'Verifying...' : 'Access Portal'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-500 font-bold hover:text-white transition-colors text-sm"
                        >
                            Try different email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PortalLogin;
