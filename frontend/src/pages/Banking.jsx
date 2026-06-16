import React, { useState } from 'react';
import {
    Building2,
    Plus,
    CreditCard,
    QrCode,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    History,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { useGetBankAccountsQuery, useCreateBankAccountMutation } from '../slices/financeApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Banking = () => {
    const { data: accounts, isLoading } = useGetBankAccountsQuery();
    const [createAccount, { isLoading: isCreating }] = useCreateBankAccountMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const accountSchema = [
        { name: 'accountName', label: 'Account Holder Name', required: true },
        { name: 'bankName', label: 'Bank Name', required: true },
        { name: 'accountNumber', label: 'Account Number', required: true },
        { name: 'branch', label: 'Branch Name' },
        { name: 'initialBalance', label: 'Initial Balance (Rs.)', type: 'number', required: true },
        { name: 'currency', label: 'Currency', type: 'select', options: [{ label: 'LKR', value: 'LKR' }, { label: 'USD', value: 'USD' }], default: 'LKR' },
    ];

    const handleSubmit = async (data) => {
        try {
            await createAccount(data).unwrap();
            setIsModalOpen(false);
        } catch (err) {
            alert(err?.data?.message || 'Failed to create account');
        }
    };

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center">
                        <Building2 className="h-7 w-7 mr-3 text-primary" />
                        Treasury & Banking
                    </h2>
                    <p className="text-slate-500 font-bold">Manage enterprise bank accounts and monitor cash flows.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Account
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts?.map(acc => (
                    <div key={acc._id} className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tight italic">ACTIVE</span>
                        </div>

                        <div className="space-y-1 mb-8 relative z-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{acc.bankName}</h3>
                            <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{acc.accountName}</p>
                            <p className="text-sm font-bold text-slate-400">**** **** {acc.accountNumber.slice(-4)}</p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Available Balance</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Rs. {acc.currentBalance.toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                                    <QrCode className="h-5 w-5" />
                                </button>
                                <button className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all">
                                    <History className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Combined Cash Flow
                    </h3>
                    <div className="h-64 flex items-end justify-between space-x-2 px-2">
                        {[40, 70, 45, 90, 65, 80, 50, 60, 85, 45, 95, 75].map((h, i) => (
                            <div key={i} className="flex-1 space-y-2 group">
                                <div className="relative h-full flex items-end">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${i === 10 ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}k
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[8px] font-black text-slate-400 text-center uppercase tracking-tighter">M{i + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Transfers</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Payroll Disbursement', amount: -450000, date: 'Today', type: 'out' },
                            { label: 'Customer Payment - INV#882', amount: 125500, date: 'Yesterday', type: 'in' },
                            { label: 'Vendor Payout - ABC Parts', amount: -68000, date: '08 Jun', type: 'out' },
                            { label: 'Stripe Settlement', amount: 84200, date: '07 Jun', type: 'in' },
                        ].map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {t.type === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{t.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{t.date}</p>
                                    </div>
                                </div>
                                <p className={`font-black text-sm tracking-tighter ${t.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {t.type === 'in' ? '+' : ''}{t.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Enterprise Bank Account">
                <DynamicForm schema={accountSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Banking;
