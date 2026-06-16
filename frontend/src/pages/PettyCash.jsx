import React, { useState } from 'react';
import {
    Coins,
    Plus,
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet
} from 'lucide-react';
import { useGetPettyCashFundsQuery, useCreatePettyCashFundMutation, useRecordPettyCashTransactionMutation } from '../slices/financeApiSlice';

const PettyCash = () => {
    const { data: funds, isLoading } = useGetPettyCashFundsQuery();
    const [createFund] = useCreatePettyCashFundMutation();
    const [recordTransaction] = useRecordPettyCashTransactionMutation();
    const [modal, setModal] = useState(false);
    const [fundModal, setFundModal] = useState(false);
    const [fundFormData, setFundFormData] = useState({
        name: '',
        openingBalance: '',
        branch: ''
    });
    const [formData, setFormData] = useState({
        fund: '',
        type: 'Expense',
        amount: '',
        category: 'Postage',
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await recordTransaction(formData).unwrap();
            alert('Transaction recorded successfully');
            setModal(false);
        } catch (err) {
            alert(err?.data?.message || 'Failed to record transaction');
        }
    };

    const handleFundSubmit = async (e) => {
        e.preventDefault();
        try {
            await createFund({
                ...fundFormData,
                openingBalance: Number(fundFormData.openingBalance),
                currentBalance: Number(fundFormData.openingBalance)
            }).unwrap();
            alert('Petty cash fund created successfully');
            setFundModal(false);
            setFundFormData({ name: '', openingBalance: '', branch: '' });
        } catch (err) {
            alert(err?.data?.message || 'Failed to create fund');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Petty Cash Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage small operational cash expenses.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setFundModal(true)}
                        className="bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <Plus className="h-5 w-5 mr-2 text-slate-400" />
                        Create Fund
                    </button>
                    <button
                        onClick={() => setModal(true)}
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:shadow-lg transition-all"
                    >
                        <ArrowUpCircle className="h-5 w-5 mr-2" />
                        Record Transaction
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {funds?.map(fund => (
                    <div key={fund._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-violet-500 bg-opacity-10">
                                <Wallet className="h-6 w-6 text-violet-500" />
                            </div>
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full uppercase tracking-widest">{fund.branch || 'MAIN'}</span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{fund.name}</h3>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Rs. {fund.currentBalance.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Placeholder for Transaction History List */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <History className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a fund to view history</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">Comprehensive petty cash audit trail will appear here once a fund is selected.</p>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">New Petty Cash Entry</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fund</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold"
                                        value={formData.fund}
                                        onChange={(e) => setFormData({ ...formData, fund: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Fund</option>
                                        {funds?.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Expense">Expense</option>
                                            <option value="Top-up">Top-up</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount (Rs.)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold h-24"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter details..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex space-x-4">
                                <button type="button" onClick={() => setModal(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">Record Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {fundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <form onSubmit={handleFundSubmit} className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Petty Cash Fund</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fund Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold"
                                        value={fundFormData.name}
                                        onChange={(e) => setFundFormData({ ...fundFormData, name: e.target.value })}
                                        placeholder="e.g. Workshop Petty Cash"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Branch</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold"
                                        value={fundFormData.branch}
                                        onChange={(e) => setFundFormData({ ...fundFormData, branch: e.target.value })}
                                        placeholder="e.g. Colombo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Opening Balance (Rs.)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 font-bold"
                                        value={fundFormData.openingBalance}
                                        onChange={(e) => setFundFormData({ ...fundFormData, openingBalance: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex space-x-4">
                                <button type="button" onClick={() => setFundModal(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">Create Fund</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PettyCash;
