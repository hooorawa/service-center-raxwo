import React, { useState } from 'react';
import { Wrench, Search, Car, User, Clock, CheckCircle, ChevronRight, Filter } from 'lucide-react';
import { useGetRepairListQuery } from '../slices/serviceApiSlice';
import { format } from 'date-fns';

const Repairs = () => {
    const { data: repairs, isLoading } = useGetRepairListQuery();
    const [search, setSearch] = useState('');

    const filtered = repairs?.filter(r =>
        r.vehicle?.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.customer?.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Repair History</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">View a consolidated list of all vehicle repairs and job cards.</p>
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-2 font-outfit">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search repair records..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary transition-all text-sm text-slate-900 dark:text-white" />
                </div>
                <button className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-primary transition-all">
                    <Filter className="h-5 w-5" />
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6">ID</th>
                                <th className="py-4 px-6">Vehicle</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Completion</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Repairs...</td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(r => (
                                    <tr key={r._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm">
                                        <td className="py-4 px-6 text-primary font-bold">RE#{r._id.slice(-6).toUpperCase()}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-900 dark:text-white font-bold uppercase">
                                                <Car className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-600" /> {r.vehicle?.registrationNumber}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-bold">{r.customer?.name}</td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase">
                                            {r.estimatedCompletion ? format(new Date(r.estimatedCompletion), 'MMM dd, yyyy') : 'N/A'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'Delivered' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary rounded-xl transition-all shadow-none hover:shadow-sm"><ChevronRight className="h-5 w-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-medium">No repair records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Repairs;
