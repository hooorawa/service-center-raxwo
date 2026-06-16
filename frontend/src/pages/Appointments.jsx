import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Search,
    Plus,
    Clock,
    User,
    Car,
    Wrench,
    Package,
    ChevronRight,
    Edit,
    Trash2,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Gauge,
    Fuel,
    ClipboardList,
} from 'lucide-react';
import {
    useGetAppointmentsQuery,
    useBookAppointmentMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation
} from '../slices/appointmentApiSlice';
import { useGetCustomersQuery } from '../slices/customerApiSlice';
import { useGetVehiclesQuery } from '../slices/vehicleApiSlice';
import { useGetEmployeesQuery } from '../slices/hrApiSlice';
import { useGetServicesCatalogQuery } from '../slices/servicesManagementApiSlice';
import { useGetProductsQuery } from '../slices/inventoryApiSlice';
import Modal from '../components/Modal';
import PaymentModal from '../components/PaymentModal';

const Appointments = () => {
    // API Hooks
    const { data: appointments, isLoading } = useGetAppointmentsQuery();
    const { data: customers } = useGetCustomersQuery();
    const { data: vehicles } = useGetVehiclesQuery();
    const { data: employees } = useGetEmployeesQuery();
    const { data: servicesCatalog } = useGetServicesCatalogQuery();
    const { data: productsCatalog } = useGetProductsQuery();

    const [bookAppointment, { isLoading: isCreating }] = useBookAppointmentMutation();
    const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation();
    const [deleteAppointment] = useDeleteAppointmentMutation();

    // Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Form State for Booking/Editing
    const [formData, setFormData] = useState({
        customer: '',
        vehicle: '',
        dateTime: '',
        mechanic: '',
        mileage: '',
        fuelLevel: '1/2',
        notes: '',
        selectedServices: [],
        selectedParts: [],
        tax: 0,
        discount: 0
    });

    const statusOptions = ['Pending', 'Confirmed', 'In Service', 'Waiting Parts', 'Completed', 'Delivered', 'Cancelled'];

    const filteredAppointments = useMemo(() => {
        return appointments?.filter(a => {
            const matchesSearch =
                a.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [appointments, searchTerm, statusFilter]);

    // Totals Calculation for Form
    const currentTotals = useMemo(() => {
        const sTotal = formData.selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
        const pTotal = formData.selectedParts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const subtotal = sTotal + pTotal;
        const discountAmt = Number(formData.discount) || 0;
        const taxAmt = (subtotal - discountAmt) * (Number(formData.tax) / 100);
        return {
            serviceTotal: sTotal,
            partsTotal: pTotal,
            subtotal,
            taxAmount: taxAmt,
            grandTotal: subtotal - discountAmt + taxAmt
        };
    }, [formData.selectedServices, formData.selectedParts, formData.tax, formData.discount]);

    const handleOpenBooking = (appointment = null) => {
        if (appointment) {
            setFormData({
                customer: appointment.customer?._id,
                vehicle: appointment.vehicle?._id,
                dateTime: appointment.dateTime ? new Date(appointment.dateTime).toISOString().slice(0, 16) : '',
                mechanic: appointment.mechanic?._id,
                mileage: appointment.mileage || '',
                fuelLevel: appointment.fuelLevel || '1/2',
                notes: appointment.notes || '',
                selectedServices: appointment.services || [],
                selectedParts: appointment.parts || [],
                tax: appointment.billing?.tax || 0,
                discount: appointment.billing?.discount || 0
            });
            setSelectedAppointment(appointment);
        } else {
            setFormData({
                customer: '', vehicle: '', dateTime: '', mechanic: '', mileage: '', fuelLevel: '1/2', notes: '',
                selectedServices: [], selectedParts: [], tax: 0, discount: 0
            });
            setSelectedAppointment(null);
        }
        setIsBookingModalOpen(true);
    };

    const handleSaveAppointment = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            services: formData.selectedServices.map(s => ({
                service: s.service || s._id,
                name: s.name,
                price: s.price,
                quantity: s.quantity,
                subtotal: s.price * s.quantity
            })),
            parts: formData.selectedParts.map(p => ({
                product: p.product || p._id,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                subtotal: p.price * p.quantity,
                batchNumber: p.batchNumber
            }))
        };

        try {
            if (selectedAppointment) {
                await updateAppointment({ id: selectedAppointment._id, ...payload }).unwrap();
            } else {
                await bookAppointment(payload).unwrap();
            }
            setIsBookingModalOpen(false);
        } catch (err) {
            alert(err?.data?.message || 'Failed to save');
        }
    };

    const toggleService = (service) => {
        const exists = formData.selectedServices.find(s => (s.service || s._id) === service._id);
        if (exists) {
            setFormData({ ...formData, selectedServices: formData.selectedServices.filter(s => (s.service || s._id) !== service._id) });
        } else {
            setFormData({ ...formData, selectedServices: [...formData.selectedServices, { service: service._id, name: service.name, price: service.price, quantity: 1, subtotal: service.price }] });
        }
    };

    const addPart = (product) => {
        const exists = formData.selectedParts.find(p => (p.product || p._id) === product._id);
        if (exists) {
            setFormData({ ...formData, selectedParts: formData.selectedParts.map(p => (p.product || p._id) === product._id ? { ...p, quantity: p.quantity + 1 } : p) });
        } else {
            setFormData({ ...formData, selectedParts: [...formData.selectedParts, { product: product._id, name: product.name, price: product.sellingPrice, quantity: 1, batchNumber: product.batchNumber }] });
        }
    };

    return (
        <div className="space-y-8 font-outfit">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Workshop Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Manage automotive service lifecycle & workshop queue</p>
                </div>
                <button
                    onClick={() => handleOpenBooking()}
                    className="flex items-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                    Book New Job
                </button>
            </div>

            {/* Quick Stats & Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    {['All', ...statusOptions].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${statusFilter === status
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xl shadow-slate-900/10'
                                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Job, Plate or Customer..."
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Table / Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 uppercase text-[9px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                <th className="py-6 px-8">Job ID & Schedule</th>
                                <th className="py-6 px-8">Customer & Vehicle</th>
                                <th className="py-6 px-8">Workshop Status</th>
                                <th className="py-6 px-8">Billing</th>
                                <th className="py-6 px-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center text-slate-400 dark:text-slate-600 font-black uppercase text-xs tracking-widest animate-pulse">Initializing Workflow...</td>
                                </tr>
                            ) : filteredAppointments?.length > 0 ? (
                                filteredAppointments.map((app) => (
                                    <tr key={app._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-black text-primary mb-1 tracking-wider uppercase">#{app.appointmentNumber}</div>
                                                <div className="flex items-center text-slate-900 dark:text-white font-black text-sm">
                                                    <Clock className="h-4 w-4 mr-2 text-slate-400 group-hover:text-primary transition-colors" />
                                                    {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {new Date(app.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-slate-900 dark:text-white font-black uppercase text-[11px] mb-1.5">
                                                    <User className="h-3.5 w-3.5 mr-2 text-slate-300 group-hover:text-primary transition-colors" />
                                                    {app.customer?.name}
                                                </div>
                                                <div className="inline-flex items-center px-2.5 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg w-fit text-[9px] font-black tracking-widest uppercase">
                                                    <Car className="h-3 w-3 mr-1.5 opacity-60" />
                                                    {app.vehicle?.registrationNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${app.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            app.status === 'In Service' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                app.status === 'Waiting Parts' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                {app.mechanic && (
                                                    <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">
                                                        <UserCheck className="h-3 w-3 mr-1 text-slate-300" />
                                                        {app.mechanic.name}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">${app.billing?.grandTotal?.toLocaleString()}</div>
                                                <div className="flex items-center mt-1">
                                                    <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${app.billing?.balance <= 0 ? 'bg-green-500' : 'bg-primary'}`}
                                                            style={{ width: `${(app.billing?.paidAmount / app.billing?.grandTotal) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase ml-2 tracking-tighter">
                                                        {app.billing?.balance <= 0 ? 'Fully Paid' : `$${app.billing?.balance?.toLocaleString()} Bal`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right font-outfit">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => { setSelectedAppointment(app); setIsPaymentModalOpen(true); }}
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-green-500 transition-all hover:shadow-md"
                                                    title="Process Payment"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenBooking(app)}
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary transition-all hover:shadow-md"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30 text-slate-400">
                                            <ClipboardList className="h-16 w-16 stroke-[1px]" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No jobs matching current filter</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comprehensive Booking/Editing Modal */}
            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title={selectedAppointment ? `Edit Workshop Job - ${selectedAppointment.appointmentNumber}` : 'Register New Work Order'}
            >
                <form onSubmit={handleSaveAppointment} className="space-y-8 font-outfit">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Customer</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all"
                                        value={formData.customer}
                                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    >
                                        <option value="">Select Customer</option>
                                        {customers?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all"
                                        value={formData.vehicle}
                                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles?.filter(v => v.owner?._id === formData.customer || v.owner === formData.customer).map(v => (
                                            <option key={v._id} value={v._id}>{v.registrationNumber} ({v.model})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all"
                                        value={formData.dateTime}
                                        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Mechanic</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all"
                                        value={formData.mechanic}
                                        onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                                    >
                                        <option value="">Auto Select/None</option>
                                        {employees?.map(e => <option key={e._id} value={e._id}>{e.name} ({e.designation})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Mileage</label>
                                    <div className="relative">
                                        <Gauge className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all"
                                            placeholder="KM/Miles"
                                            value={formData.mileage}
                                            onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fuel Level</label>
                                    <div className="relative">
                                        <Fuel className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-0 focus:border-primary transition-all"
                                            value={formData.fuelLevel}
                                            onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                                        >
                                            <option value="E">Empty</option>
                                            <option value="1/4">1/4 Tank</option>
                                            <option value="1/2">1/2 Tank</option>
                                            <option value="3/4">3/4 Tank</option>
                                            <option value="F">Full Tank</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Workshop Status</label>
                                <select
                                    className="w-full bg-primary text-white border-2 border-primary rounded-2xl py-3 px-4 text-xs font-black uppercase tracking-widest focus:ring-0 shadow-lg shadow-primary/20 transition-all pointer-events-auto"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-slate-900">{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Right Column: Services & Parts Selector */}
                        <div className="space-y-6">
                            <div className="flex flex-col h-[450px] bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                    <ClipboardList className="h-3.5 w-3.5 mr-2" />
                                    Job Breakdown & Billing
                                </h4>

                                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                                    {/* Services Selection */}
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Services Catalog</p>
                                        <div className="flex flex-wrap gap-2">
                                            {servicesCatalog?.map(s => (
                                                <button
                                                    key={s._id}
                                                    type="button"
                                                    onClick={() => toggleService(s)}
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${formData.selectedServices.find(curr => (curr.service || curr._id) === s._id)
                                                            ? 'bg-primary text-white border-primary border-transparent'
                                                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                                                        }`}
                                                >
                                                    {s.name} - ${s.price}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Parts Selection (Search & Add) */}
                                    <div className="space-y-2 pt-2">
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1">Spare Parts & Consumables</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {productsCatalog?.map(p => (
                                                <button
                                                    key={p._id}
                                                    type="button"
                                                    onClick={() => addPart(p)}
                                                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-400 transition-all text-left"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-900 dark:text-white uppercase truncate w-24">{p.name}</span>
                                                        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">${p.sellingPrice} • Stock: {p.stockLevel}</span>
                                                    </div>
                                                    <Plus className="h-3 w-3 text-blue-500" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Items Summary Table */}
                                    {(formData.selectedServices.length > 0 || formData.selectedParts.length > 0) && (
                                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="space-y-2">
                                                {formData.selectedServices.map((s, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                                                        <span className="flex items-center"><Wrench className="h-3 w-3 mr-1.5 opacity-40" /> {s.name}</span>
                                                        <span>${s.price}</span>
                                                    </div>
                                                ))}
                                                {formData.selectedParts.map((p, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                                                        <span className="flex items-center"><Package className="h-3 w-3 mr-1.5 opacity-40" /> {p.name} x {p.quantity}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span>${p.price * p.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, selectedParts: formData.selectedParts.filter((_, i) => i !== idx) })}
                                                                className="text-red-400 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Running Totals Section */}
                                <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>${currentTotals.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mr-2">Tax (%)</span>
                                            <input
                                                type="number"
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[10px] font-black"
                                                value={formData.tax}
                                                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mr-2">Disc ($)</span>
                                            <input
                                                type="number"
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[10px] font-black"
                                                value={formData.discount}
                                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight pt-2">
                                        <span>Grand Total</span>
                                        <span className="text-primary">${currentTotals.grandTotal?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsBookingModalOpen(false)}
                            className="px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-12 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 transition-all disabled:opacity-50 active:scale-95 flex items-center"
                        >
                            {isCreating || isUpdating ? (
                                <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {selectedAppointment ? 'Update Work Order' : 'Approve & Create Job Card'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => { setIsPaymentModalOpen(false); setSelectedAppointment(null); }}
                appointment={selectedAppointment}
            />
        </div>
    );
};

export default Appointments;
