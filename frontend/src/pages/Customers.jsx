import React, { useState } from 'react';
import {
    Users,
    Search,
    Plus,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit,
    Download,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    useGetCustomersQuery,

    useDeleteCustomerMutation,
    useCreateCustomerMutation,
    useUpdateCustomerMutation
} from '../slices/customerApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const customerSchema = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'address', label: 'Home Address', type: 'textarea', fullWidth: true },
];

const Customers = () => {
    const navigate = useNavigate();
    const { data: customers, isLoading } = useGetCustomersQuery();

    const [deleteCustomer] = useDeleteCustomerMutation();
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
    const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const filteredCustomers = customers?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleOpenModal = (customer = null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingCustomer) {
                await updateCustomer({ id: editingCustomer._id, ...data }).unwrap();
            } else {
                await createCustomer(data).unwrap();
            }
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? This will also remove their vehicles.')) {
            try {
                await deleteCustomer(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    const handleExport = () => {
        window.open('/api/reports/customers/excel', '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and view all service center clients.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all font-outfit"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Customer
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex justify-between items-center">
                    <div className="relative w-96 font-outfit">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="text-sm font-medium text-slate-500 font-outfit">
                        Total Results: <span className="text-slate-900 font-bold">{filteredCustomers?.length || 0}</span>
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Customer Details</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Customers...</td>
                                </tr>
                            ) : filteredCustomers?.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-0 font-medium">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mr-4">
                                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-bold">{customer.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">ID: {customer._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                                                <Mail className="h-4 w-4 mr-2 text-slate-300 dark:text-slate-600" />
                                                {customer.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                                                <Phone className="h-4 w-4 mr-2 text-slate-300 dark:text-slate-600" />
                                                {customer.phone}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                                                <MapPin className="h-4 w-4 mr-2 text-slate-300 dark:text-slate-600" />
                                                {customer.address || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/customers/${customer._id}/ledger`)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-all shadow-none hover:shadow-sm"
                                                    title="View Ledger"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>


                                                <button
                                                    onClick={() => handleDelete(customer._id)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium whitespace-pre-wrap">
                                        No customers found matching your search.
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
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            >
                <DynamicForm
                    schema={customerSchema}
                    onSubmit={handleSubmit}
                    initialData={editingCustomer}
                    loading={isCreating || isUpdating}
                />
            </Modal>
        </div>
    );
};

export default Customers;
