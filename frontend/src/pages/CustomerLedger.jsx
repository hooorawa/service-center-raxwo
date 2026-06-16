import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    CreditCard,
    ArrowLeft,
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    Printer
} from 'lucide-react';
import axios from 'axios';

const CustomerLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [statement, setStatement] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const { data } = await axios.get(`/api/finance/statement/${id}`, config);
                setStatement(data);

                const custRes = await axios.get(`/api/customers/${id}`, config);
                setCustomer(custRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase">Syncing Ledger...</div>;

    const totalInvoiced = statement.reduce((acc, curr) => acc + curr.debit, 0);
    const totalPaid = statement.reduce((acc, curr) => acc + curr.credit, 0);
    const currentBalance = totalInvoiced - totalPaid;

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full -mr-20 -mt-20" />

                <div className="flex items-center space-x-6 relative z-10">
                    <button onClick={() => navigate(-1)} className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Customer Ledger</h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{customer?.name} • {customer?.phone}</p>
                    </div>
                </div>

                <div className="flex space-x-3 relative z-10">
                    <button className="flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all text-xs">
                        <Printer className="mr-2 h-4 w-4" /> Print Statement
                    </button>
                    <button className="flex items-center px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all text-xs">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Billing</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Rs. {totalInvoiced.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payments</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">Rs. {totalPaid.toLocaleString()}</p>
                </div>
                <div className={`p-6 rounded-[32px] border shadow-sm ${currentBalance > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Outstanding Balance</p>
                    <p className={`text-2xl font-black tracking-tighter ${currentBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        Rs. {currentBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                            {['Date', 'Type', 'Reference', 'Debit (+)', 'Credit (-)', 'Balance'].map(h => (
                                <th key={h} className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {statement.map((entry, idx) => (
                            <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-5 px-6 font-bold text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="py-5 px-6">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${entry.type === 'Invoice' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {entry.type}
                                    </span>
                                </td>
                                <td className="py-5 px-6 font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                    {entry.reference}
                                    <p className="text-[9px] font-bold text-slate-400 normal-case italic">{entry.description}</p>
                                </td>
                                <td className="py-5 px-6 font-black text-red-500">
                                    {entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}
                                </td>
                                <td className="py-5 px-6 font-black text-emerald-600">
                                    {entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}
                                </td>
                                <td className="py-5 px-6 font-black text-slate-900 dark:text-white">
                                    Rs. {entry.balance.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {statement.length === 0 && <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs">No transactions recorded for this ledger.</div>}
            </div>
        </div>
    );
};

export default CustomerLedger;
