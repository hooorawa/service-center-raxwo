import React, { useState } from 'react';
import { FileText, Plus, Search, Calendar, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import { useGetQuotationsQuery, useGenerateQuotationMutation, useDeleteQuotationMutation } from '../slices/financeApiSlice';
import { useGetCustomersQuery } from '../slices/customerApiSlice';
import { useGetVehiclesQuery } from '../slices/vehicleApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const statusStyle = { Draft: 'bg-slate-50 text-slate-700', Sent: 'bg-blue-50 text-blue-700', Approved: 'bg-emerald-50 text-emerald-700', Rejected: 'bg-red-50 text-red-700' };

const Quotations = () => {
    const { data: quotations, isLoading } = useGetQuotationsQuery();
    const { data: customers } = useGetCustomersQuery();
    const { data: vehicles } = useGetVehiclesQuery();

    const [generateQuotation, { isLoading: isCreating }] = useGenerateQuotationMutation();
    const [deleteQuotation] = useDeleteQuotationMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const quotationSchema = [
        {
            name: 'customer',
            label: 'Customer',
            type: 'select',
            required: true,
            options: customers?.map(c => ({ label: c.name, value: c._id })) || []
        },
        {
            name: 'vehicle',
            label: 'Vehicle',
            type: 'select',
            required: true,
            options: vehicles?.map(v => ({ label: v.registrationNumber, value: v._id })) || []
        },
        { name: 'totalAmount', label: 'Estimated Total (Rs.)', type: 'number', required: true },
        { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: true },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Draft', value: 'Draft' },
                { label: 'Sent', value: 'Sent' },
                { label: 'Approved', value: 'Approved' },
                { label: 'Rejected', value: 'Rejected' },
            ]
        },
    ];

    const filtered = quotations?.filter(q =>
        q.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        q.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            await generateQuotation(data).unwrap();
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to generate quotation');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this quotation?')) {
            try {
                await deleteQuotation(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Service Quotations</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Generate and manage cost estimates for repair services.</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all font-outfit"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create Quotation
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or car..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                                {['Ref #', 'Customer', 'Vehicle', 'Total Amount', 'Expiry', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(q => (
                                <tr key={q._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                    <td className="py-4 px-6 font-black text-primary">{q._id.slice(-6).toUpperCase()}</td>
                                    <td className="py-4 px-6 text-slate-900 dark:text-white font-bold">{q.customer?.name}</td>
                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 uppercase text-xs font-bold">{q.vehicle?.plateNumber}</td>
                                    <td className="py-4 px-6 font-black text-slate-900 dark:text-white">Rs. {q.totalAmount.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs">{new Date(q.expiryDate).toLocaleDateString()}</td>
                                    <td className="py-4 px-6"><span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${statusStyle[q.status]} dark:bg-opacity-10`}>{q.status}</span></td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => handleDelete(q._id)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-none hover:shadow-sm">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Service Quotation">
                <DynamicForm schema={quotationSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Quotations;
