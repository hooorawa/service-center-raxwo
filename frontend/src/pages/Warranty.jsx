import React, { useState } from 'react';
import { Award, Search, Plus, Car, FileText, CheckCircle, Trash2, Edit } from 'lucide-react';
import { useGetWarrantyClaimsQuery, useCreateWarrantyClaimMutation, useUpdateWarrantyClaimMutation, useDeleteWarrantyClaimMutation } from '../slices/serviceApiSlice';
import { useGetVehiclesQuery } from '../slices/vehicleApiSlice';
import { useGetInvoicesQuery } from '../slices/financeApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Warranty = () => {
    const { data: claims, isLoading } = useGetWarrantyClaimsQuery();
    const { data: vehicles } = useGetVehiclesQuery();
    const { data: invoices } = useGetInvoicesQuery();

    const [createClaim, { isLoading: isCreating }] = useCreateWarrantyClaimMutation();
    const [updateClaim] = useUpdateWarrantyClaimMutation();
    const [deleteClaim] = useDeleteWarrantyClaimMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const warrantySchema = [
        {
            name: 'vehicle',
            label: 'Vehicle',
            type: 'select',
            required: true,
            options: vehicles?.map(v => ({ label: v.registrationNumber, value: v._id })) || []
        },
        {
            name: 'invoice',
            label: 'Original Invoice (Optional)',
            type: 'select',
            options: invoices?.map(i => ({ label: `INV#${i.invoiceNumber}`, value: i._id })) || []
        },
        { name: 'claimType', label: 'Claim Type (Spare Part, Labor, etc.)', required: true },
        { name: 'description', label: 'Issue Description', type: 'textarea', fullWidth: true, required: true },
        {
            name: 'status',
            label: 'Claim Status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Under Review', value: 'Review' },
                { label: 'Accepted', value: 'Accepted' },
                { label: 'Rejected', value: 'Rejected' },
            ]
        },
    ];

    const filtered = claims?.filter(c =>
        c.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
        c.claimType.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            await createClaim(data).unwrap();
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to submit claim');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this warranty claim?')) {
            try {
                await deleteClaim(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateClaim({ id, status }).unwrap();
        } catch (err) {
            alert(err?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Warranty Claims</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage spare parts and service warranty requests from customers.</p>
                </div>
                <button onClick={handleOpenModal} className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-200 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> New Claim
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search claims..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6 uppercase tracking-widest">Claim ID</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Vehicle</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Type</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Status</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Claims...</td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(c => (
                                    <tr key={c._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm">
                                        <td className="py-4 px-6 text-primary font-black">WR#{c._id.slice(-6).toUpperCase()}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-900 dark:text-white font-bold uppercase">
                                                <Car className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-600" /> {c.vehicle?.registrationNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{c.claimType}</td>
                                        <td className="py-4 px-6">
                                            <select
                                                value={c.status}
                                                onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 focus:ring-0 cursor-pointer transition-all ${c.status === 'Accepted' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                    c.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                                                        'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                    }`}
                                            >
                                                <option value="Pending" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Pending</option>
                                                <option value="Review" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Review</option>
                                                <option value="Accepted" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Accepted</option>
                                                <option value="Rejected" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleDelete(c._id)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-none hover:shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">No warranty claims found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Warranty Claim Form">
                <DynamicForm schema={warrantySchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Warranty;
