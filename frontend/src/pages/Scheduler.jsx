import React, { useState } from 'react';
import { 
    useGetJobCardsQuery, 
    useUpdateJobCardMutation 
} from '../slices/jobCardApiSlice';
import { useGetEmployeesQuery } from '../slices/hrApiSlice';
import { 
    LayoutGrid, 
    MapPin, 
    User, 
    Clock, 
    Wrench, 
    RefreshCw, 
    CheckCircle2 
} from 'lucide-react';

const Scheduler = () => {
    const { data: jobCards, isLoading: jobsLoading, refetch } = useGetJobCardsQuery();
    const { data: employees } = useGetEmployeesQuery();
    const [updateJobCard, { isLoading: isUpdating }] = useUpdateJobCardMutation();
    const [movingJob, setMovingJob] = useState(null);

    const bays = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4', 'Bay 5', 'Unassigned'];

    const technicians = employees?.filter(e => e.department === 'Service') || [];

    const handleMoveBay = async (jobId, targetBay) => {
        try {
            const bayNum = targetBay === 'Unassigned' ? '' : targetBay.replace('Bay ', '');
            await updateJobCard({ id: jobId, bayNumber: bayNum }).unwrap();
            refetch();
        } catch (err) {
            alert('Failed to reallocate bay');
        }
    };

    if (jobsLoading) return <div className="p-10 text-center font-black animate-pulse text-slate-400">LOADING VISUAL BAY SCHEDULER...</div>;

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Workshop Bay Scheduler</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Real-time scheduling, tracking, and physical bay allocations.</p>
                </div>
                <button 
                    onClick={() => refetch()} 
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>

            {/* Drag and Drop instructions */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <p className="text-xs text-primary font-bold">
                    To reallocate a vehicle: click "Move" on the card, and select the target service bay from the menu.
                </p>
            </div>

            {/* Bays Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {bays.map(bay => {
                    const bayNum = bay === 'Unassigned' ? '' : bay.replace('Bay ', '');
                    const activeJobsInBay = jobCards?.filter(j => 
                        (j.bayNumber || '') === bayNum && j.status !== 'Delivered'
                    ) || [];

                    return (
                        <div key={bay} className="flex flex-col min-h-[500px] bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            {/* Bay Title */}
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
                                    {bay}
                                </span>
                                <span className="h-5 w-5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">
                                    {activeJobsInBay.length}
                                </span>
                            </div>

                            {/* Job List inside Bay */}
                            <div className="flex-1 space-y-4">
                                {activeJobsInBay.length > 0 ? (
                                    activeJobsInBay.map(job => (
                                        <div key={job._id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                                        {job.vehicle?.registrationNumber || 'No Plate'}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                        job.priority === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        {job.priority || 'Medium'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{job.vehicle?.make} {job.vehicle?.model}</p>

                                                {/* Tech info */}
                                                <div className="flex items-center text-[10px] text-slate-600 dark:text-slate-400 gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-800">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="truncate">{job.technician?.name || 'Unassigned'}</span>
                                                </div>

                                                {/* Status info */}
                                                <div className="flex items-center text-[9px] text-slate-600 dark:text-slate-400 gap-1.5">
                                                    <Wrench className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="font-black uppercase text-primary">{job.status}</span>
                                                </div>

                                                {/* Actions */}
                                                <div className="pt-2 flex justify-between gap-2">
                                                    {movingJob === job._id ? (
                                                        <select
                                                            onChange={(e) => {
                                                                handleMoveBay(job._id, e.target.value);
                                                                setMovingJob(null);
                                                            }}
                                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-[9px] font-bold"
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Move to...</option>
                                                            {bays.map(b => <option key={b} value={b}>{b}</option>)}
                                                        </select>
                                                    ) : (
                                                        <button
                                                            onClick={() => setMovingJob(job._id)}
                                                            className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px] font-black uppercase text-slate-500 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors"
                                                        >
                                                            Reallocate Bay
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-[10px] text-slate-300 dark:text-slate-700 font-bold uppercase tracking-wider">
                                        Bay Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Scheduler;
