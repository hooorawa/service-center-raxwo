import React, { useState } from 'react';
import {
    FileText,
    Search,
    Banknote,
    Car,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    AlertCircle,
    Plus,
    Trash2,
    Mail,
    MessageSquare,

    Link as LinkIcon
} from 'lucide-react';

import {
    useGetInvoicesQuery,
    useGenerateInvoiceMutation,
    useDeleteInvoiceMutation,
    useSendInvoiceEmailMutation,
    useSendInvoiceSMSMutation,
    useGeneratePaymentLinkMutation
} from '../slices/financeApiSlice';

import { useGetCustomersQuery, useCreateCustomerMutation } from '../slices/customerApiSlice';
import { useGetVehiclesQuery, useRegisterVehicleMutation } from '../slices/vehicleApiSlice';
import { useGetJobCardsQuery } from '../slices/jobCardApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';
import { format } from 'date-fns';

const Invoices = () => {
    const { data: invoices, isLoading } = useGetInvoicesQuery();
    const { data: customers } = useGetCustomersQuery();
    const { data: vehicles } = useGetVehiclesQuery();
    const { data: jobCards } = useGetJobCardsQuery();

    const [generateInvoice, { isLoading: isCreating }] = useGenerateInvoiceMutation();
    const [deleteInvoice] = useDeleteInvoiceMutation();
    const [sendEmail] = useSendInvoiceEmailMutation();
    const [sendSMS] = useSendInvoiceSMSMutation();
    const [createCustomer] = useCreateCustomerMutation();
    const [registerVehicle] = useRegisterVehicleMutation();
    const [generateLink, { isLoading: isGeneratingLink }] = useGeneratePaymentLinkMutation();


    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const invoiceSchema = [
        {
            name: 'customer',
            label: 'Customer',
            type: 'select',
            required: true,
            options: customers?.map(c => ({ label: c.name, value: c._id })) || [],
            createLabel: 'Add New Customer',
            quickFormFields: [
                { name: 'name', label: 'Name', required: true, prefillWithSearch: true },
                { name: 'phone', label: 'Phone Number', type: 'text', required: true },
                { name: 'email', label: 'Email Address', type: 'email' },
                { name: 'address', label: 'Address', type: 'text' },
            ],
            onQuickCreate: async (formData) => {
                const res = await createCustomer(formData).unwrap();
                return { label: res.name, value: res._id };
            }
        },
        {
            name: 'vehicle',
            label: 'Vehicle',
            type: 'select',
            required: true,
            options: vehicles?.map(v => ({ label: v.registrationNumber, value: v._id })) || [],
            createLabel: 'Add New Vehicle',
            quickFormFields: [
                { name: 'registrationNumber', label: 'Registration Number', required: true, prefillWithSearch: true },
                { name: 'make', label: 'Make (e.g. Toyota)', required: true },
                { name: 'model', label: 'Model (e.g. Prius)', required: true },
                { name: 'owner', label: 'Owner (Customer)', type: 'select', required: true, options: customers?.map(c => ({ label: c.name, value: c._id })) || [] },
            ],
            onQuickCreate: async (formData) => {
                const res = await registerVehicle(formData).unwrap();
                return { label: `${res.registrationNumber} (${res.make} ${res.model})`, value: res._id };
            }
        },
        {
            name: 'jobCard',
            label: 'Linked Job Card',
            type: 'select',
            options: jobCards?.filter(j => j.status !== 'Delivered')?.map(j => ({ label: `JC#${j._id.slice(-6).toUpperCase()} - ${j.vehicle?.registrationNumber}`, value: j._id })) || []
        },
        { name: 'totalAmount', label: 'Subtotal (Rs.)', type: 'number', required: true },
        { name: 'tax', label: 'Tax Amount (Rs.)', type: 'number', required: true },
        { name: 'discount', label: 'Discount (Rs.)', type: 'number' },
        { name: 'finalAmount', label: 'Final Total (Rs.)', type: 'number', required: true },
    ];

    const filteredInvoices = invoices?.filter(i =>
        i.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            await generateInvoice(data).unwrap();
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to generate invoice');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await deleteInvoice(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    const handleSendEmail = async (id) => {
        try {
            await sendEmail(id).unwrap();
            alert('Invoice sent via email');
        } catch (err) {
            alert(err?.data?.message || 'Failed to send email');
        }
    };

    const handleSendSMS = async (id) => {
        try {
            await sendSMS(id).unwrap();
            alert('Invoice sent via SMS');
        } catch (err) {
            alert(err?.data?.message || 'Failed to send SMS');
        }
    };

    const handleExport = () => {
        window.open('/api/reports/finance/invoices/excel', '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Records</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage invoices, track payments, and generate billing reports.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export
                    </button>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Invoice
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-2 font-outfit">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search invoices by number or customer..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary transition-all text-sm text-slate-900 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4 font-outfit">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-400 font-medium font-outfit">Loading Invoices...</div>
                ) : filteredInvoices?.length > 0 ? (
                    filteredInvoices.map((invoice) => {
                        const isPaid = invoice.paymentStatus === 'Paid';
                        const isPending = invoice.paymentStatus === 'Unpaid';
                        return (
                            <div key={invoice._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between group font-outfit">
                                <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold shadow-inner ${isPaid ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-primary/10 dark:bg-primary/10 text-primary'}`}>
                                        <FileText className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">#{invoice.invoiceNumber || invoice._id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{invoice.customer?.name} • {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-10 items-center">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Vehicle</p>
                                        <div className="flex items-center text-slate-700 dark:text-slate-300 font-bold">
                                            <Car className="h-3 w-3 mr-1.5 text-slate-400 dark:text-slate-500" />
                                            <span className="text-xs uppercase">{invoice.vehicle?.registrationNumber || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">Rs. {invoice.finalAmount?.toLocaleString()}</p>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center ${isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isPending ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                            {invoice.paymentStatus}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleSendEmail(invoice._id)}
                                            title="Send Email"
                                            className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-400 hover:text-blue-600 flex items-center justify-center transition-all"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleGenerateLink(invoice._id)}
                                            disabled={isGeneratingLink}
                                            title="Generate Payment Link"
                                            className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-400 hover:text-purple-600 flex items-center justify-center transition-all"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleSendSMS(invoice._id)}

                                            title="Send SMS"
                                            className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-400 hover:text-emerald-600 flex items-center justify-center transition-all"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </button>
                                        <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary flex items-center justify-center transition-all">
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice._id)}
                                            className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-500 flex items-center justify-center transition-all"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center font-outfit">
                        <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No financial records found.</p>
                        <button onClick={handleOpenModal} className="mt-4 text-primary font-bold hover:underline">Generate Your First Invoice</button>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Generate New Invoice">
                <DynamicForm schema={invoiceSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Invoices;
