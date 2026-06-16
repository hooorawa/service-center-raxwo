import React, { useState } from 'react';
import {
    Search,
    Plus,
    Wrench,
    Clock,
    DollarSign,
    Tag,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import {
    useGetServicesCatalogQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation
} from '../slices/servicesManagementApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Services = () => {
    const { data: services, isLoading } = useGetServicesCatalogQuery();
    const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
    const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
    const [deleteService] = useDeleteServiceMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const serviceSchema = [
        { name: 'name', label: 'Service Name', type: 'text', required: true },
        { name: 'serviceCode', label: 'Service Code', type: 'text', placeholder: 'e.g., SVC-OIL' },
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
                { label: 'General Service', value: 'General Service' },
                { label: 'Oils & Lubricants', value: 'Oils & Lubricants' },
                { label: 'Brake & Suspension', value: 'Brake & Suspension' },
                { label: 'Engine Repair', value: 'Engine Repair' },
                { label: 'Electrical', value: 'Electrical' },
                { label: 'Body & Detailing', value: 'Body & Detailing' },
                { label: 'Others', value: 'Others' },
            ]
        },
        { name: 'price', label: 'Price (Labour + Base)', type: 'number', required: true },
        { name: 'duration', label: 'Est. Duration (Mins)', type: 'number', required: true },
        { name: 'discount', label: 'Default Discount (%)', type: 'number' },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
            ]
        },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    ];

    const filteredServices = services?.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.serviceCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (service = null) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingService) {
                await updateService({ id: editingService._id, ...data }).unwrap();
            } else {
                await createService(data).unwrap();
            }
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to save service');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Service Catalog</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage workshop services, pricing, and estimated durations.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all font-outfit"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Service
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search services by name or code..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6">Service</th>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6">Duration</th>
                                <th className="py-4 px-6 text-right">Price</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Services...</td>
                                </tr>
                            ) : filteredServices?.length > 0 ? (
                                filteredServices.map((service) => (
                                    <tr key={service._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-slate-900 dark:text-white font-black uppercase text-xs">
                                                    <Wrench className="h-4 w-4 mr-2 text-primary" />
                                                    {service.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1 pl-6">
                                                    {service.serviceCode || 'NO CODE'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                                {service.duration} mins
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="text-slate-900 dark:text-white font-black text-sm">
                                                ${service.price?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {service.status === 'Active' ? (
                                                <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center">
                                                    <ToggleRight className="h-3.5 w-3.5 mr-1.5" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center">
                                                    <ToggleLeft className="h-3.5 w-3.5 mr-1.5" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(service)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service._id)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold whitespace-pre-wrap font-outfit">
                                        No services found in the catalog.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingService ? 'Edit Service' : 'Add New Service'}
            >
                <DynamicForm
                    schema={serviceSchema}
                    onSubmit={handleSubmit}
                    initialData={editingService}
                    loading={isCreating || isUpdating}
                />
            </Modal>
        </div>
    );
};

export default Services;
