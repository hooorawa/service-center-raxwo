import React, { useState } from 'react';
import { Umbrella, Search, Plus, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useGetLeaveRequestsQuery, useUpdateLeaveStatusMutation, useGetEmployeesQuery } from '../slices/hrApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Leave = () => {
    const { data: leaves, isLoading } = useGetLeaveRequestsQuery();
    const [updateLeaveStatus] = useUpdateLeaveStatusMutation();

    const [search, setSearch] = useState('');

    const handleAction = async (id, status) => {
        if (window.confirm(`Are you sure you want to ${status} this leave request?`)) {
            try {
                await updateLeaveStatus({ id, status }).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to update status');
            }
        }
    };

    const filtered = leaves?.filter(l =>
        l.employee?.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Approve or reject employee time-off and vacation requests.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6 uppercase tracking-widest">Employee</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-center">Leave Dates</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Type & Reason</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-center">Status</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Requests...</td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(l => (
                                    <tr key={l._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                        <td className="py-4 px-6">
                                            <p className="text-slate-900 dark:text-white font-black uppercase text-xs">{l.employee?.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest">{l.employee?.department}</p>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs text-center">
                                            {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-xs text-slate-900 dark:text-white font-black uppercase">{l.leaveType}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-500 italic max-w-xs truncate">"{l.reason}"</p>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${l.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : l.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                {l.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-outfit">
                                            {l.status === 'Pending' && (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => handleAction(l._id, 'Approved')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><CheckCircle className="h-4 w-4" /></button>
                                                    <button onClick={() => handleAction(l._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><XCircle className="h-4 w-4" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">No requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leave;
