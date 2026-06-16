import React, { useState } from 'react';
import {
    useGetRegistersQuery,
    useOpenRegisterMutation,
    useCloseRegisterMutation,
    useAdjustCashMutation
} from '../slices/cashApiSlice';
import {
    Building2,
    Unlock,
    Lock,
    Plus,
    Minus,
    History,
    TrendingUp,
    AlertCircle,
    Banknote,
    Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const CashRegister = () => {
    const { data: registers, isLoading, refetch } = useGetRegistersQuery();
    const [openRegister] = useOpenRegisterMutation();
    const [closeRegister] = useCloseRegisterMutation();
    const [adjustCash] = useAdjustCashMutation();

    const [selectedRegister, setSelectedRegister] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'open', 'close', 'adjust'
    const [formData, setFormData] = useState({ amount: '', notes: '', type: 'Add' });

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'open') {
                await openRegister({ id: selectedRegister._id, openingBalance: Number(formData.amount) }).unwrap();
                toast.success('Register opened successfully');
            } else if (modalMode === 'close') {
                await closeRegister({ id: selectedRegister._id, actualBalance: Number(formData.amount), notes: formData.notes }).unwrap();
                toast.success('Register closed and reconciled');
            } else if (modalMode === 'adjust') {
                await adjustCash({ id: selectedRegister._id, type: formData.type, amount: Number(formData.amount), reason: formData.notes }).unwrap();
                toast.success('Cash adjustment recorded');
            }
            setIsModalOpen(false);
            setFormData({ amount: '', notes: '', type: 'Add' });
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Action failed');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Cash Registers...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cash Register Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Monitor real-time cash flow and manage shift reconciliations.</p>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {registers?.map(reg => (
                    <div key={reg._id} className="relative group overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${reg.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                <Building2 size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${reg.status === 'Open' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                {reg.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{reg.registerName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{reg.location}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Current Balance</span>
                                <span className="font-bold text-slate-900 dark:text-white">Rs. {reg.currentBalance.toLocaleString()}</span>
                            </div>
                            {reg.status === 'Open' && (
                                <div className="flex justify-between text-[10px] text-slate-400 italic">
                                    <span>Opened by: Admin</span>
                                    <span>{format(new Date(reg.openedAt), 'HH:mm')}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {reg.status === 'Closed' ? (
                                <button
                                    onClick={() => { setSelectedRegister(reg); setModalMode('open'); setIsModalOpen(true); }}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all"
                                >
                                    <Unlock size={18} /> Open Shift
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setSelectedRegister(reg); setModalMode('close'); setIsModalOpen(true); }}
                                        className="col-span-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all mb-2"
                                    >
                                        <Lock size={18} /> Close Shift
                                    </button>
                                    <button
                                        onClick={() => { setSelectedRegister(reg); setModalMode('adjust'); setFormData({ ...formData, type: 'Add' }); setIsModalOpen(true); }}
                                        className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 py-2.5 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <Plus size={16} /> Cash In
                                    </button>
                                    <button
                                        onClick={() => { setSelectedRegister(reg); setModalMode('adjust'); setFormData({ ...formData, type: 'Remove' }); setIsModalOpen(true); }}
                                        className="flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 py-2.5 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <Minus size={16} /> Cash Out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {modalMode === 'open' && 'Open Register Shift'}
                            {modalMode === 'close' && 'End Shift & Reconcile'}
                            {modalMode === 'adjust' && `Cash ${formData.type}`}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                            {selectedRegister?.registerName} - {selectedRegister?.location}
                        </p>

                        <form onSubmit={handleAction} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                    {modalMode === 'open' ? 'Opening Balance' : modalMode === 'close' ? 'Actual Cash Count' : 'Amount'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {modalMode !== 'open' && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Notes / Reason</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        rows="3"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            )}

                            {modalMode === 'close' && (
                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                    <div>
                                        <p className="text-xs font-bold text-amber-700">Expected: Rs. {selectedRegister?.currentBalance.toLocaleString()}</p>
                                        <p className="text-[10px] text-amber-600">Please count the cash carefully to verify any variance.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashRegister;
