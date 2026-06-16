import React, { useState } from 'react';
import {
    Wrench,
    Search,
    Plus,
    User,
    Car,
    Clock,
    Timer,
    Edit,
    Trash2,
    ChevronRight,
} from 'lucide-react';
import {
    useGetJobCardsQuery,
    useCreateJobCardMutation,
    useUpdateJobCardMutation,
    useDeleteJobCardMutation
} from '../slices/jobCardApiSlice';
import { useGetCustomersQuery } from '../slices/customerApiSlice';
import { useGetVehiclesQuery } from '../slices/vehicleApiSlice';
import { useGetEmployeesQuery } from '../slices/hrApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';
import InspectionReport from '../components/InspectionReport';
import { format } from 'date-fns';


const JobCards = () => {
    const { data: jobCards, isLoading } = useGetJobCardsQuery();
    const { data: customers } = useGetCustomersQuery();
    const { data: vehicles } = useGetVehiclesQuery();
    const { data: employees } = useGetEmployeesQuery();

    const [createJobCard, { isLoading: isCreating }] = useCreateJobCardMutation();
    const [updateJobCard, { isLoading: isUpdating }] = useUpdateJobCardMutation();
    const [deleteJobCard] = useDeleteJobCardMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJobCard, setEditingJobCard] = useState(null);
    const [isInspectionOpen, setIsInspectionOpen] = useState(false);
    const [activeJobCardId, setActiveJobCardId] = useState(null);


    const technicians = employees?.filter(e => e.department === 'Service') || [];

    const jobCardSchema = [
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
            options: vehicles?.map(v => ({ label: `${v.registrationNumber} (${v.make} ${v.model})`, value: v._id })) || []
        },
        {
            name: 'technician',
            label: 'Assigned Technician',
            type: 'select',
            options: technicians.map(t => ({ label: t.name, value: t._id }))
        },
        {
            name: 'bayNumber',
            label: 'Service Bay',
            type: 'text',
        },
        {
            name: 'priority',
            label: 'Priority',
            type: 'select',
            required: true,
            options: [
                { label: 'Low', value: 'Low' },
                { label: 'Medium', value: 'Medium' },
                { label: 'High', value: 'High' },
                { label: 'Urgent', value: 'Urgent' },
            ]
        },
        {
            name: 'status',

            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Inspection', value: 'Inspection' },
                { label: 'Work In Progress', value: 'In Progress' },
                { label: 'Awaiting Parts', value: 'Awaiting Parts' },
                { label: 'Ready', value: 'Ready' },
                { label: 'Delivered', value: 'Delivered' },
            ]
        },
        { name: 'estimatedCompletion', label: 'Estimated Completion', type: 'datetime-local', required: true },
        { name: 'inspectionResults', label: 'Initial Inspection Results', type: 'textarea', fullWidth: true },
    ];

    const filteredJobCards = jobCards?.filter(j =>
        j.vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (jobCard = null) => {
        if (jobCard) {
            setEditingJobCard({
                ...jobCard,
                customer: jobCard.customer?._id,
                vehicle: jobCard.vehicle?._id,
                technician: jobCard.technician?._id,
                estimatedCompletion: jobCard.estimatedCompletion ? new Date(jobCard.estimatedCompletion).toISOString().slice(0, 16) : ''
            });
        } else {
            setEditingJobCard(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingJobCard(null);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingJobCard) {
                await updateJobCard({ id: editingJobCard._id, ...data }).unwrap();
            } else {
                await createJobCard(data).unwrap();
            }
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job card?')) {
            try {
                await deleteJobCard(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Repair Workshop</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Monitor and update progress on all vehicle repair job cards.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all font-outfit"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Open Job Card
                </button>
            </div>

            <div className="flex items-center space-x-4 mb-2 font-outfit">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by plate or customer..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary transition-all text-sm text-slate-900 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl transition-all">
                    Active Jobs ({jobCards?.filter(j => j.status !== 'Delivered').length || 0})
                </button>
            </div>

            <div className="space-y-4 font-outfit">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-400 font-medium">Loading Job Cards...</div>
                ) : filteredJobCards?.length > 0 ? (
                    filteredJobCards.map((jobCard) => (
                        <div key={jobCard._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between group">
                            <div className="flex items-center space-x-6 mb-4 md:mb-0">
                                <div className="h-14 w-14 rounded-2xl bg-primary/5 dark:bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Wrench className="h-7 w-7" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize group-hover:text-primary transition-colors">{jobCard.vehicle?.registrationNumber}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${jobCard.status === 'Delivered' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                                            jobCard.status === 'Ready' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                                                'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                                            }`}>
                                            {jobCard.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">{jobCard.customer?.name} • <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{jobCard.vehicle?.make} {jobCard.vehicle?.model}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8 items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1">Technician</span>
                                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                                        <User className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-600" />
                                        <span className="text-xs font-bold">{jobCard.technician?.name || 'Unassigned'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1">Due Date</span>
                                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                                        <Timer className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-600" />
                                        <span className="text-xs font-bold">{format(new Date(jobCard.estimatedCompletion), 'MMM dd, HH:mm')}</span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(jobCard)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-primary hover:text-white flex items-center justify-center transition-all shadow-none hover:shadow-lg"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(jobCard._id)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-none hover:shadow-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-all shadow-none hover:shadow-sm">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => { setActiveJobCardId(jobCard._id); setIsInspectionOpen(true); }}
                                    className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                                >
                                    Digital Inspection
                                </button>
                            </div>
                        </div>
                    ))

                ) : (
                    <div className="py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                        <Wrench className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No job cards found.</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-primary font-bold hover:underline">Open New Job Card</button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingJobCard ? 'Update Job Card' : 'Open New Job Card'}
            >
                <DynamicForm
                    schema={jobCardSchema}
                    onSubmit={handleSubmit}
                    initialData={editingJobCard}
                    loading={isCreating || isUpdating}
                />
            </Modal>

            <Modal
                isOpen={isInspectionOpen}
                onClose={() => setIsInspectionOpen(false)}
                title="Vehicle Health Check (DVI)"
                maxWidth="6xl"
            >
                <InspectionReport jobCardId={activeJobCardId} onClose={() => setIsInspectionOpen(false)} />
            </Modal>
        </div>

    );
};

export default JobCards;
