import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, Truck, Calendar, DollarSign, Trash2, CheckCircle } from 'lucide-react';
import { useGetPurchasesQuery, useCreatePurchaseMutation, useDeletePurchaseMutation, useGetProductsQuery, useGetSuppliersQuery } from '../slices/inventoryApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Purchases = () => {
    const { data: purchases, isLoading } = useGetPurchasesQuery();
    const { data: products } = useGetProductsQuery();
    const { data: suppliers } = useGetSuppliersQuery();

    const [createPurchase, { isLoading: isCreating }] = useCreatePurchaseMutation();
    const [deletePurchase] = useDeletePurchaseMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const purchaseSchema = [
        {
            name: 'supplier',
            label: 'Supplier',
            type: 'select',
            required: true,
            options: suppliers?.map(s => ({ label: s.name, value: s._id })) || []
        },
        {
            name: 'items',
            label: 'Products To Order',
            type: 'select',
            required: true,
            isMulti: false, // For now simple one item per purchase for UI simplicity, backend supports array
            options: products?.map(p => ({ label: `${p.name} (Current: ${p.stockLevel})`, value: p._id })) || []
        },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'costPrice', label: 'Unit Cost Price (Rs.)', type: 'number', required: true },
        {
            name: 'status',
            label: 'Order Status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Ordered', value: 'Ordered' },
                { label: 'Received', value: 'Received' },
                { label: 'Cancelled', value: 'Cancelled' },
            ]
        },
    ];

    const filtered = purchases?.filter(p =>
        p.supplier?.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            // Backend expects items as array
            const payload = {
                ...data,
                items: [{ product: data.items, quantity: data.quantity, costPrice: data.costPrice }],
                totalAmount: data.quantity * data.costPrice
            };
            await createPurchase(payload).unwrap();
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to create purchase order');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this purchase record?')) {
            try {
                await deletePurchase(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Purchase Orders</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage procurement orders and track incoming spare parts inventory.</p>
                </div>
                <button onClick={handleOpenModal} className="flex items-center px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> New Order
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex justify-between items-center">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by supplier..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6">Order ID</th>
                                <th className="py-4 px-6">Supplier</th>
                                <th className="py-4 px-6">Amount</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Purchases...</td></tr>
                            ) : filtered.map(p => (
                                <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                    <td className="py-4 px-6 font-black text-primary">PO#{p._id.slice(-6).toUpperCase()}</td>
                                    <td className="py-4 px-6">
                                        <p className="text-slate-900 dark:text-white font-black uppercase text-xs">{p.supplier?.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest">{new Date(p.orderDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="py-4 px-6 font-black text-slate-900 dark:text-white">Rs. {p.totalAmount.toLocaleString()}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'Received' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                            {p.status}
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create Purchase Order">
                <DynamicForm schema={purchaseSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Purchases;
