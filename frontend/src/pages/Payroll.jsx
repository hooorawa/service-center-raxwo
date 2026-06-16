import React, { useState } from 'react';
import {
    Calculator,
    History,
    CheckCircle2,
    Download,
    Play,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react';
import {
    useGetPayrollHistoryQuery,
    useProcessPayrollMutation
} from '../slices/payrollApiSlice';
import { toast } from 'react-toastify';

const Payroll = () => {
    const [processModal, setProcessModal] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const { data: history, isLoading } = useGetPayrollHistoryQuery();
    const [processPayroll, { isLoading: processing }] = useProcessPayrollMutation();

    const handleProcess = async (e) => {
        e.preventDefault();
        try {
            await processPayroll({ month, year }).unwrap();
            alert('Payroll processed successfully!');
            setProcessModal(false);
        } catch (err) {
            alert(err?.data?.message || 'Failed to process payroll');
        }
    };

    const handleExport = (id) => {
        window.open(`/api/reports/payroll/${id}/excel`, '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">Process and manage monthly employee salaries.</p>
                </div>
                <button
                    onClick={() => setProcessModal(true)}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:shadow-lg transition-all"
                >
                    <Play className="h-5 w-5 mr-2" />
                    Process Monthly Payroll
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="p-3 rounded-2xl bg-blue-500 bg-opacity-10 w-fit mb-4">
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Last Month</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        Rs. {history?.[0]?.totalNetSalary?.toLocaleString() || '0'}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="p-3 rounded-2xl bg-emerald-500 bg-opacity-10 w-fit mb-4">
                        <Users className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Employees Paid</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {history?.[0]?.status === 'Processed' ? 'All Active' : '0'}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="p-3 rounded-2xl bg-amber-500 bg-opacity-10 w-fit mb-4">
                        <History className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Next Processing</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">July 2026</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payroll History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Period</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Net</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {history?.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">
                                        {['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month]} {p.year}
                                    </td>
                                    <td className="px-8 py-5 text-slate-600 dark:text-slate-300">
                                        Rs. {p.totalNetSalary.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2">
                                        <button
                                            onClick={() => handleExport(p._id)}
                                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                                            title="Export Excel"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors" title="View Details">
                                            <FileText className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {processModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Process Payroll</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Select the month and year to process salary payments.</p>

                            <form onSubmit={handleProcess} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Month</label>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Year</label>
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value={2026}>2026</option>
                                            <option value={2025}>2025</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setProcessModal(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-primary text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Start Execution'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
