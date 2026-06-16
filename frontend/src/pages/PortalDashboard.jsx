import React, { useEffect, useState } from 'react';
import {
    Car,
    Clock,
    FileText,
    Wrench,
    ChevronRight,
    LogOut,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PortalDashboard = () => {
    const [customer, setCustomer] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const info = JSON.parse(localStorage.getItem('customerInfo'));
        const token = localStorage.getItem('customerToken');

        if (!token || !info) {
            navigate('/portal/login');
            return;
        }

        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Fetch customer specific data
                const res = await axios.get(`/api/portal/my-data`, config);
                setCustomer(res.data.customer);
                setAppointments(res.data.appointments);
                setVehicles(res.data.vehicles);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerInfo');
        navigate('/portal/login');
    };

    if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-black animate-pulse uppercase">Syncing Repair Data...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-outfit pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Car className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Client Portal</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center text-slate-500 font-bold hover:text-red-500 transition-colors px-3 py-2"
                >
                    <LogOut className="h-5 w-5 mr-2" />
                    Exit
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-6 pt-10">
                <div className="mb-12">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Welcome, {customer?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Monitor your active repairs and view service history.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vehicles Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                <Car className="h-4 w-4 mr-2" />
                                Your Registered Vehicles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map(v => (
                                    <div key={v._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                                <Car className="h-7 w-7" />
                                            </div>
                                            <span className="bg-primary/5 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase">{v.registrationNumber}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{v.make} {v.model}</h4>
                                        <p className="text-xs text-slate-400 font-bold">{v.year} • {v.vin || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                <Wrench className="h-4 w-4 mr-2" />
                                Recent Service History
                            </h3>
                            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden">
                                {appointments.length > 0 ? appointments.map((apt, idx) => (
                                    <div key={apt._id} className={`p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${idx !== appointments.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                                        <div className="flex items-center space-x-4 text-slate-500">
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{apt.vehicle?.registrationNumber} - {apt.appointmentNumber}</h4>
                                                <p className="text-xs font-bold text-slate-400">{new Date(apt.dateTime).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Paid Amount</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Rs. {apt.billing?.paidAmount?.toLocaleString()}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center text-slate-400 font-bold">No previous repairs recorded.</div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Need a Service?</h3>
                            <p className="text-slate-400 text-sm font-bold mb-6">Book your next maintenance appointment in seconds.</p>
                            <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-xl">
                                Request Booking
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Active Notifications</h3>
                            <div className="space-y-4">
                                <div className="flex space-x-3 p-3 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                                    <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-tight">Upcoming Service</p>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">Your vehicle (WP ABC-1234) is due for major service in 14 days.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PortalDashboard;
