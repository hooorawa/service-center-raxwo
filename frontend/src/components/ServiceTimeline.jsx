import React from 'react';
import { useGetJobCardsQuery } from '../slices/jobCardApiSlice';
import { Clock, Wrench, User, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const ServiceTimeline = ({ vehicleId }) => {
    const { data: jobCards, isLoading } = useGetJobCardsQuery();

    const vehicleJobs = jobCards
        ?.filter(j => (j.vehicle?._id || j.vehicle) === vehicleId)
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

    if (isLoading) return <div className="p-10 text-center font-black animate-pulse text-slate-400">LOADING SERVICE HISTORY TIMELINE...</div>;

    if (vehicleJobs.length === 0) {
        return (
            <div className="py-16 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">
                No past service history records found for this vehicle.
            </div>
        );
    }

    return (
        <div className="flow-root font-outfit p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-slate-100 dark:border-slate-800/80">
            <ul className="-mb-8">
                {vehicleJobs.map((job, idx) => (
                    <li key={job._id}>
                        <div className="relative pb-8">
                            {idx !== vehicleJobs.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                                        <Wrench className="h-4 w-4" />
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Service Status: <span className="text-primary uppercase font-black">{job.status}</span>
                                        </p>
                                        <div className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide space-y-1">
                                            <p className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {format(new Date(job.createdAt), 'MMMM dd, yyyy - HH:mm')}
                                            </p>
                                            <p className="flex items-center">
                                                <User className="h-3 w-3 mr-1" />
                                                Assigned Technician: {job.technician?.name || 'Unassigned'}
                                            </p>
                                            {job.mileage && (
                                                <p className="font-mono">
                                                    Mileage at service: {job.mileage.toLocaleString()} KM
                                                </p>
                                            )}
                                        </div>

                                        {/* Tasks List */}
                                        {job.tasks && job.tasks.length > 0 && (
                                            <div className="mt-3">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tasks Completed</span>
                                                <ul className="mt-1 list-disc list-inside text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                                                    {job.tasks.map((task, tIdx) => (
                                                        <li key={tIdx}>{task.description}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Parts List */}
                                        {job.partsUsed && job.partsUsed.length > 0 && (
                                            <div className="mt-3">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Parts Replaced</span>
                                                <ul className="mt-1 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                                                    {job.partsUsed.map((part, pIdx) => (
                                                        <li key={pIdx} className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 max-w-xs flex justify-between">
                                                            <span>{part.product?.name || 'Spare Part'}</span>
                                                            <span className="font-black text-slate-950 dark:text-white">x{part.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <span>JC#{job._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ServiceTimeline;
