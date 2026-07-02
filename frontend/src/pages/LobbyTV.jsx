import React, { useEffect } from 'react';
import { useGetJobCardsQuery } from '../slices/jobCardApiSlice';
import { Wrench, Clock, ShieldCheck, Car, Play } from 'lucide-react';

const LobbyTV = () => {
    const { data: jobCards, isLoading, refetch } = useGetJobCardsQuery();

    // Auto-refresh queue every 10 seconds for real-time lobby updates
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 10000);
        return () => clearInterval(interval);
    }, [refetch]);

    const activeJobs = jobCards?.filter(j => j.status !== 'Delivered') || [];

    const categories = {
        'WASH & DIAGNOSTICS': activeJobs.filter(j => ['Pending', 'Inspection'].includes(j.status)),
        'REPAIRS IN PROGRESS': activeJobs.filter(j => ['In Progress', 'Awaiting Parts'].includes(j.status)),
        'READY FOR DELIVERY': activeJobs.filter(j => j.status === 'Ready')
    };

    if (isLoading) {
        return (
            <div className="min-screen bg-slate-950 text-white flex items-center justify-center font-outfit">
                <div className="text-center space-y-4 animate-pulse">
                    <Wrench className="h-16 w-16 mx-auto text-primary animate-spin" />
                    <h2 className="text-xl font-black tracking-widest uppercase">INITIALISING LOBBY QUEUE FEED...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-950 text-white font-outfit flex flex-col p-8 select-none z-[9999]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-primary italic flex items-center gap-3">
                        <Car className="h-8 w-8 text-primary animate-pulse" />
                        Apex Service Center
                    </h1>
                    <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mt-1">Live Workshop Status Feed • lobby Display Monitor</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black font-mono tracking-tighter">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[8px] font-black tracking-widest text-emerald-500 uppercase flex items-center justify-end gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Connected & Synchronised
                    </p>
                </div>
            </div>

            {/* Grid Columns */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden mb-4">
                {Object.entries(categories).map(([title, jobs]) => (
                    <div key={title} className="bg-slate-900/30 border border-slate-900 rounded-[2rem] p-6 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-900">
                            <h3 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2">
                                {title === 'WASH & DIAGNOSTICS' && <Clock className="h-4 w-4 text-orange-500" />}
                                {title === 'REPAIRS IN PROGRESS' && <Play className="h-4 w-4 text-primary" />}
                                {title === 'READY FOR DELIVERY' && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                                {title}
                            </h3>
                            <span className="h-6 w-6 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                                {jobs.length}
                            </span>
                        </div>

                        {/* Queue Cards */}
                        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                            {jobs.length > 0 ? (
                                jobs.map(job => (
                                    <div key={job._id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 flex justify-between items-center transition-all hover:bg-slate-900/80">
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black tracking-tight text-white uppercase">
                                                {job.vehicle?.registrationNumber || 'No Plate'}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">
                                                {job.vehicle?.make} {job.vehicle?.model}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                title === 'READY FOR DELIVERY' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                                {job.status}
                                            </span>
                                            {job.bayNumber && (
                                                <p className="text-[9px] font-black text-slate-500 uppercase mt-2">
                                                    Bay {job.bayNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-black uppercase tracking-widest py-20">
                                    No Vehicles
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                Thank you for your patience. Your vehicle's real-time progress is shown above.
            </div>
        </div>
    );
};

export default LobbyTV;
