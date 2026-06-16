import React, { useState } from 'react';
import { Truck, Search, Plus, Mail, Phone, MapPin, Trash2, Edit } from 'lucide-react';
import { useGetSuppliersQuery, useAddSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation } from '../slices/inventoryApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Suppliers = () => {
    const { data: suppliers, isLoading } = useGetSuppliersQuery();
    const [addSupplier, { isLoading: isCreating }] = useAddSupplierMutation();
    const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
    const [deleteSupplier] = useDeleteSupplierMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const supplierSchema = [
        { name: 'name', label: 'Supplier Name', required: true },
        { name: 'contactPerson', label: 'Contact Person' },
        { name: 'email', label: 'Email Address', type: 'email' },
        { name: 'phone', label: 'Phone Number', required: true },
        { name: 'address', label: 'Business Address', fullWidth: true },
        { name: 'category', label: 'Category (Spare Parts, Oil, etc.)' },
    ];

    const filtered = suppliers?.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = (supplier = null) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingSupplier) {
                await updateSupplier({ id: editingSupplier._id, ...data }).unwrap();
            } else {
                await addSupplier(data).unwrap();
            }
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this supplier?')) {
            try {
                await deleteSupplier(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Spares Suppliers</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage vendor profiles and contact information for procurement.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold font-outfit shadow-lg shadow-primary/20 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Company</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Contact</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Address</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Suppliers...</td></tr>
                            ) : filtered.map(s => (
                                <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold mr-4 uppercase">{s.name.charAt(0)}</div>
                                            <div>
                                                <p className="text-slate-900 dark:text-white font-bold">{s.name}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest">{s.category || 'GENERAL'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-900 dark:text-white font-bold">{s.contactPerson}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center"><Phone className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-600" /> {s.phone}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-bold max-w-xs truncate">{s.address || 'N/A'}</td>
                                    <td className="py-4 px-6 text-right font-outfit">
                                        <button onClick={() => handleOpenModal(s)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary rounded-xl transition-all shadow-none hover:shadow-sm mr-2"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(s._id)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-none hover:shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? 'Update Supplier Profile' : 'Register New Supplier'}>
                <DynamicForm schema={supplierSchema} onSubmit={handleSubmit} initialData={editingSupplier} loading={isCreating || isUpdating} />
            </Modal>
        </div>
    );
};

export default Suppliers;
