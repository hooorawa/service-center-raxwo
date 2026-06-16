import React, { useState } from 'react';
import {
    Clock,
    User,
    Car,
    AlertCircle,
    CheckCircle2,
    Timer,
    Boxes,
    Wrench,
    LayoutGrid,
    List,
    ChevronRight,
    MapPin,
    Zap
} from 'lucide-react';
import { useGetJobCardsQuery, useUpdateJobCardMutation } from '../slices/jobCardApiSlice';
import InspectionReport from '../components/InspectionReport';
import { format } from 'date-fns';


const StatusBadge = ({ status }) => {
    const styles = {
        'Waiting': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        'Assigned': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        'In Service': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
        'Waiting Parts': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        'Quality Check': 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
        'Ready For Delivery': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        'Delivered': 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || 'bg-slate-100'}`}>
            {status}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const styles = {
        'Low': 'bg-slate-50 text-slate-400',
        'Medium': 'bg-blue-50 text-blue-500',
        'High': 'bg-orange-50 text-orange-500',
        'Urgent': 'bg-red-50 text-red-600 animate-pulse',
    };
    return (
        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-current opacity-70 ${styles[priority]}`}>
            {priority}
        </span>
    );
};

const WorkshopQueue = () => {
    const { data: jobCards, isLoading } = useGetJobCardsQuery();
    const [updateJobCard] = useUpdateJobCardMutation();
    const [viewMode, setViewMode] = useState('grid');

    const queues = [
        'Waiting',
        'Assigned',
        'In Service',
        'Waiting Parts',
        'Quality Check',
        'Ready For Delivery'
    ];

    const [isInspectionOpen, setIsInspectionOpen] = useState(false);
    const [activeJobId, setActiveJobId] = useState(null);


    const getBayColor = (bay) => {
        const hash = bay.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
        return colors[hash % colors.length];
    };

    if (isLoading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse">SYNCHRONIZING WORKSHOP QUEUE...</div>;

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Workshop Control Center</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Real-time bay monitoring and service production queue.</p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[600px]">
                {queues.map(status => (
                    <div key={status} className="flex flex-col min-w-[280px]">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{status}</h3>
                            <span className="h-5 w-5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">
                                {jobCards?.filter(j => j.status === status).length || 0}
                            </span>
                        </div>

                        <div className="flex-1 space-y-4 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            {jobCards?.filter(j => j.status === status).map(job => (
                                <div key={job._id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${getBayColor(job.bayNumber || '0')}`} />

                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">{job.vehicle?.registrationNumber}</h4>
                                                <PriorityBadge priority={job.priority || 'Medium'} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{job.vehicle?.make} {job.vehicle?.model}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {job.bayNumber && (
                                                <div className="flex items-center text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg mb-1">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    BAY {job.bayNumber}
                                                </div>
                                            )}
                                            <div className="flex items-center text-[8px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                <Clock className="h-2.5 w-2.5 mr-1" />
                                                {job.estimatedCompletion ? format(new Date(job.estimatedCompletion), 'HH:mm') : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{job.customer?.name}</p>
                                            <div className="flex items-center text-[9px] text-slate-400 font-black uppercase">
                                                <Zap className="h-2.5 w-2.5 mr-1 text-primary" />
                                                {job.technician?.name || 'WAITING ASSIGNMENT'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800">
                                        <button
                                            onClick={() => { setActiveJobId(job._id); setIsInspectionOpen(true); }}
                                            className="text-[10px] font-black text-primary hover:underline flex items-center group-hover:translate-x-1 transition-transform"
                                        >
                                            INSPECTION
                                            <ChevronRight className="h-3 w-3 ml-1" />
                                        </button>
                                        <div className="flex items-center text-[10px] font-black text-slate-300">

                                            <Timer className="h-3 w-3 mr-1" />
                                            {Math.floor(Math.random() * 60)}m
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* In-view Digital Inspection Modal */}
            {isInspectionOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[40px] shadow-2xl relative overflow-hidden">
                        <button
                            onClick={() => setIsInspectionOpen(false)}
                            className="absolute top-6 right-6 h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-all z-10"
                        >
                            <span className="text-xl">×</span>
                        </button>
                        <div className="p-2">
                            <InspectionReport jobCardId={activeJobId} onClose={() => setIsInspectionOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default WorkshopQueue;
