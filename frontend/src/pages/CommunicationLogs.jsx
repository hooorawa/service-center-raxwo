import React, { useState } from 'react';
import {
    MessageSquare,
    Mail,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    User,
    Link as LinkIcon
} from 'lucide-react';
import { useGetSMSLogsQuery, useGetEmailLogsQuery } from '../slices/communicationApiSlice';

const CommunicationLogs = () => {
    const [activeTab, setActiveTab] = useState('email');
    const { data: smsLogs, isLoading: smsLoading } = useGetSMSLogsQuery();
    const { data: emailLogs, isLoading: emailLoading } = useGetEmailLogsQuery();
    const [searchTerm, setSearchTerm] = useState('');

    const logs = activeTab === 'email' ? emailLogs : smsLogs;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Communication Center</h2>
                    <p className="text-slate-500 dark:text-slate-400">View history of automated SMS and Email notifications.</p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'email' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('sms')}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'sms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        SMS Logs
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${activeTab === 'email' ? 'bg-blue-500' : 'bg-emerald-500'} bg-opacity-10`}>
                            {activeTab === 'email' ? <Mail className="h-6 w-6 text-blue-500" /> : <MessageSquare className="h-6 w-6 text-emerald-500" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {activeTab === 'email' ? 'Outgoing Email History' : 'Outgoing SMS History'}
                        </h3>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab} logs...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Recipient</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{activeTab === 'email' ? 'Subject' : 'Event'}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date & Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs?.filter(l => (activeTab === 'email' ? l.recipient : l.recipient).includes(searchTerm)).map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <User className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{log.recipient}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                            {activeTab === 'email' ? log.subject : log.event}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center text-slate-500">
                                            <Clock className="h-3 w-3 mr-2" />
                                            <p className="text-xs font-bold">{new Date(log.date).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px]">
                                            {log.message}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommunicationLogs;
