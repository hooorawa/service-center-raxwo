import React, { useState } from 'react';
import {
    DollarSign,
    CreditCard,
    Building2,
    CheckCircle2,
    Plus,
    X,
    FileText,
    History,
} from 'lucide-react';
import { useRecordSplitPaymentMutation, useGetAppointmentTransactionsQuery } from '../slices/financeApiSlice';
import { useGetRegistersQuery } from '../slices/cashApiSlice';
import Modal from './Modal';


const PaymentModal = ({ isOpen, onClose, appointment }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Cash');
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedRegisterId, setSelectedRegisterId] = useState('');

    const { data: registers } = useGetRegistersQuery();
    const openRegisters = registers?.filter(r => r.status === 'Open') || [];


    const [recordPayment, { isLoading }] = useRecordSplitPaymentMutation();
    const { data: transactions, isLoading: loadingHistory } = useGetAppointmentTransactionsQuery(appointment?._id, {
        skip: !appointment?._id
    });

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await recordPayment({
                appointmentId: appointment._id,
                amount: Number(amount),
                paymentMethod: method,
                transactionId,
                registerId: method === 'Cash' ? selectedRegisterId : undefined,
                notes
            }).unwrap();


            setAmount('');
            setTransactionId('');
            setNotes('');
            // Optional: Close modal if fully paid
            if (appointment.billing.balance - Number(amount) <= 0) {
                // onClose();
            }
        } catch (err) {
            alert(err?.data?.message || 'Failed to record payment');
        }
    };

    if (!appointment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Payment Management - ${appointment.appointmentNumber}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Outstanding Balance</span>
                            <span className="text-2xl font-black text-primary">${appointment.billing?.balance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <span>Total Billed: ${appointment.billing?.grandTotal?.toLocaleString()}</span>
                            <span>Paid: ${appointment.billing?.paidAmount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase ml-1">Amount to Pay</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    max={appointment.billing?.balance}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase ml-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Cash', 'Card', 'Bank Transfer'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMethod(m)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${method === m
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {m === 'Cash' && <DollarSign className="h-5 w-5 mb-1" />}
                                        {m === 'Card' && <CreditCard className="h-5 w-5 mb-1" />}
                                        {m === 'Bank Transfer' && <Building2 className="h-5 w-5 mb-1" />}
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{m}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {method !== 'Cash' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase ml-1">Ref / Transaction ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Enter reference number"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                        )}

                        {method === 'Cash' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase ml-1 text-primary">Select Open Cash Register</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-primary/30 dark:border-primary/20 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                                    value={selectedRegisterId}
                                    onChange={(e) => setSelectedRegisterId(e.target.value)}
                                >
                                    <option value="">-- Choose Register --</option>
                                    {openRegisters.map(r => (
                                        <option key={r._id} value={r._id}>{r.registerName} ({r.location}) - Bal: Rs. {r.currentBalance}</option>
                                    ))}
                                </select>
                                {openRegisters.length === 0 && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">No registers are currently open. Please open one first.</p>
                                )}
                            </div>
                        )}


                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase ml-1">Notes</label>
                            <textarea
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                rows="2"
                                placeholder="Payment notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !amount || amount <= 0}
                            className="w-full bg-primary hover:bg-blue-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isLoading ? 'Processing...' : 'Complete Transaction'}
                        </button>
                    </form>
                </div>

                {/* Payment History */}
                <div className="flex flex-col h-full uppercase font-outfit">
                    <div className="flex items-center mb-6">
                        <History className="h-4 w-4 mr-2 text-slate-400" />
                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction History</h4>
                    </div>

                    <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {loadingHistory ? (
                            <div className="text-center py-10 text-slate-400 text-xs font-bold">Loading transactions...</div>
                        ) : transactions?.length > 0 ? (
                            transactions.map(t => (
                                <div key={t._id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl mr-3 shadow-sm">
                                                {t.paymentMethod === 'Cash' && <DollarSign className="h-3.5 w-3.5 text-green-500" />}
                                                {t.paymentMethod === 'Card' && <CreditCard className="h-3.5 w-3.5 text-blue-500" />}
                                                {t.paymentMethod === 'Bank Transfer' && <Building2 className="h-3.5 w-3.5 text-purple-500" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{t.paymentMethod}</div>
                                                <div className="text-[8px] text-slate-400 font-bold">{new Date(t.paymentDate).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white">${t.amount.toLocaleString()}</div>
                                    </div>
                                    {t.transactionId && (
                                        <div className="text-[8px] font-black text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg inline-block">{t.transactionId}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-10">
                                No payments recorded yet for this appointment.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {appointment.billing?.balance <= 0 ? (
                            <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl border border-green-100 dark:border-green-500/20">
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                <span className="text-xs font-black uppercase tracking-widest">Fully Paid</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                                <span className="text-xs font-black uppercase tracking-widest">${appointment.billing?.balance?.toLocaleString()} Remaining</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;
