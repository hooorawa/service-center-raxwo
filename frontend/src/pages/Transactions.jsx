import React, { useState } from 'react';
import {
    BarChart3,
    Search,
    Download,
    ArrowUpCircle,
    ArrowDownCircle,
    Filter
} from 'lucide-react';
import { useGetTransactionsQuery } from '../slices/financeApiSlice';

const Transactions = () => {
    const { data: transactions, isLoading } = useGetTransactionsQuery();
    const [searchTerm, setSearchTerm] = useState('');

    const handleExport = () => {
        window.open('/api/reports/finance/transactions/excel', '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction Ledger</h2>
                    <p className="text-slate-500 dark:text-slate-400">Consolidated history of all financial activities across the system.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                    <Download className="h-5 w-5 mr-2 text-slate-400" />
                    Download Complete Ledger (Excel)
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-2xl bg-indigo-500 bg-opacity-10">
                            <BarChart3 className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Transactions</h3>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by description or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reference ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {transactions?.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
                                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">TRX-{t._id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(t.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${t.type === 'Income' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'} uppercase tracking-widest`}>
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className={`text-sm font-black ${t.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {t.type === 'Income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                            <div className={`h-1.5 w-1.5 rounded-full mr-2 ${t.type === 'Income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            Success
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-bold text-slate-500 dark:text-slate-400 text-xs italic">
                                        {t.description}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
