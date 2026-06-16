import React, { useState } from 'react';
import { CreditCard, Search, Calendar, FileText, CheckCircle, Smartphone, Trash2, Plus } from 'lucide-react';
import { useGetPaymentsQuery, useRecordPaymentMutation, useDeletePaymentMutation, useGetInvoicesQuery, useRefundPaymentMutation } from '../slices/financeApiSlice';

import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const methodIcon = { Cash: FileText, Card: CreditCard, 'Bank Transfer': Smartphone, Online: Smartphone };

const Payments = () => {
    const { data: payments, isLoading } = useGetPaymentsQuery();
    const { data: invoices } = useGetInvoicesQuery();
    const [recordPayment, { isLoading: isCreating }] = useRecordPaymentMutation();
    const [deletePayment] = useDeletePaymentMutation();
    const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();


    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const paymentSchema = [
        {
            name: 'invoice',
            label: 'Invoice',
            type: 'select',
            required: true,
            options: invoices?.filter(i => i.paymentStatus !== 'Paid').map(i => ({ label: `INV#${i.invoiceNumber} - ${i.customer?.name} (Due: Rs. ${i.finalAmount - i.paidAmount})`, value: i._id })) || []
        },
        { name: 'amount', label: 'Payment Amount (Rs.)', type: 'number', required: true },
        {
            name: 'paymentMethod',
            label: 'Payment Method',
            type: 'select',
            required: true,
            options: [
                { label: 'Cash', value: 'Cash' },
                { label: 'Card', value: 'Card' },
                { label: 'Bank Transfer', value: 'Bank Transfer' },
                { label: 'Online', value: 'Online' },
            ]
        },
        { name: 'transactionId', label: 'Transaction ID / Reference' },
        { name: 'notes', label: 'Internal Notes', type: 'textarea', fullWidth: true },
    ];

    const filtered = payments?.filter(p =>
        p.invoice?.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            await recordPayment(data).unwrap();
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to record payment');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this payment record? This will NOT refund the customer.')) {
            try {
                await deletePayment(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment History</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Monitor all incoming payments and transaction history.</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all font-outfit"
                >
                    <Plus className="mr-2 h-4 w-4" /> Record Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-outfit">
                {[{ label: 'Total Received', value: payments?.reduce((acc, p) => acc + p.amount, 0).toLocaleString(), icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'Transactions', value: payments?.length, icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
                { label: 'Avg Payment', value: payments?.length ? Math.round(payments.reduce((acc, p) => acc + p.amount, 0) / payments.length).toLocaleString() : 0, icon: CreditCard, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' }].map(s => (
                    <div key={s.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-all">
                        <div className={`p-4 rounded-2xl ${s.color}`}><s.icon className="h-6 w-6" /></div>
                        <div><p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p><p className="text-2xl font-black text-slate-900 dark:text-white">{s.label.includes('Received') || s.label.includes('Avg') ? `Rs. ${s.value}` : s.value}</p></div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or TXID..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                                {['Date', 'Customer', 'Method', 'Amount', 'Transaction ID', 'Actions'].map(h => (
                                    <th key={h} className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => {
                                const Icon = methodIcon[p.paymentMethod] || FileText;
                                return (
                                    <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 font-black text-slate-900 dark:text-white uppercase text-xs">{p.invoice?.customer?.name}</td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-bold flex items-center"><Icon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-600" /> {p.paymentMethod}</td>
                                        <td className="py-4 px-6 font-black text-emerald-600 dark:text-emerald-400">Rs. {p.amount.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-slate-400 dark:text-slate-500 text-[10px] font-black tracking-widest uppercase">{p.transactionId || 'N/A'}</td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            {!p.isRefunded && (
                                                <button
                                                    onClick={() => handleRefund(p._id)}
                                                    disabled={isRefunding}
                                                    title="Refund Payment"
                                                    className="p-2 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-400 hover:text-amber-600 rounded-xl transition-all"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-none hover:shadow-sm">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record Client Payment">
                <DynamicForm schema={paymentSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Payments;
