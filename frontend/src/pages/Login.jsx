import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const { adminInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (adminInfo) {
            navigate('/');
        }
    }, [navigate, adminInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setCredentials({ ...res }));
            navigate('/');
        } catch (err) {
            alert(err?.data?.message || err.error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500 font-outfit">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-2xl shadow-primary/20 mb-6">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Terminal</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Vehicle Repair Management System</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                <button type="button" className="text-xs text-primary hover:text-blue-700 transition-colors font-bold">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Log In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 dark:text-slate-600 mt-8 text-sm">
                    &copy; 2026 Enterprise Service Solutions
                </p>
            </div>
        </div>
    );
};

export default Login;
