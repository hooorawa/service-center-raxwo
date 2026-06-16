import React, { useState } from 'react';
import { Shield, Search, Plus, Car, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { useGetInsurancePoliciesQuery, useCreateInsurancePolicyMutation, useDeleteInsurancePolicyMutation } from '../slices/serviceApiSlice';
import { useGetVehiclesQuery } from '../slices/vehicleApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Insurance = () => {
    const { data: policies, isLoading } = useGetInsurancePoliciesQuery();
    const { data: vehicles } = useGetVehiclesQuery();
    const [createPolicy, { isLoading: isCreating }] = useCreateInsurancePolicyMutation();
    const [deletePolicy] = useDeleteInsurancePolicyMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const insuranceSchema = [
        {
            name: 'vehicle',
            label: 'Vehicle',
            type: 'select',
            required: true,
            options: vehicles?.map(v => ({ label: v.registrationNumber, value: v._id })) || []
        },
        { name: 'policyNumber', label: 'Policy Number', required: true },
        { name: 'provider', label: 'Insurance Provider', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        { name: 'coverageDetails', label: 'Coverage Details', type: 'textarea', fullWidth: true },
    ];

    const filtered = policies?.filter(p =>
        p.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            await createPolicy(data).unwrap();
            handleCloseModal();
        } catch (err) {
            console.error('Policy creation error:', err);
            alert(err?.data?.message || err?.message || 'Failed to add policy. Check console for details.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this insurance record?')) {
            try {
                await deletePolicy(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Insurance</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Track insurance coverage and expiry for customer vehicles.</p>
                </div>
                <button onClick={handleOpenModal} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold font-outfit shadow-lg shadow-blue-200 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Policy
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search poly / plate..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6 uppercase tracking-widest">Company & Policy</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Vehicle</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Expiry Date</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold font-outfit">Loading...</td></tr>
                            ) : filtered.map(p => (
                                <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium font-outfit">
                                    <td className="py-4 px-6">
                                        <p className="text-slate-900 dark:text-white font-black">{p.provider}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase">#{p.policyNumber}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center text-slate-700 dark:text-slate-300 font-bold uppercase">
                                            <Car className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-600" /> {p.vehicle?.registrationNumber || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${new Date(p.endDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {new Date(p.endDate).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-none hover:shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Insurance Record">
                <DynamicForm schema={insuranceSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Insurance;
