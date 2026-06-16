import React, { useState } from 'react';
import { Fingerprint, Search, Calendar, User, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useGetAttendanceQuery, useRecordAttendanceMutation, useGetEmployeesQuery } from '../slices/hrApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Attendance = () => {
    const { data: attendance, isLoading } = useGetAttendanceQuery();
    const { data: employees } = useGetEmployeesQuery();
    const [recordAttendance, { isLoading: isCreating }] = useRecordAttendanceMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const attendanceSchema = [
        {
            name: 'employeeId',
            label: 'Employee',
            type: 'select',
            required: true,
            options: employees?.map(e => ({ label: e.name, value: e._id })) || []
        },
        { name: 'date', label: 'Date', type: 'date', required: true },
        {
            name: 'status',
            label: 'Attendance Status',
            type: 'select',
            required: true,
            options: [
                { label: 'Present', value: 'Present' },
                { label: 'Absent', value: 'Absent' },
                { label: 'Late', value: 'Late' },
                { label: 'Half Day', value: 'Half Day' },
            ]
        },
        { name: 'checkIn', label: 'Check-In Time', type: 'time' },
        { name: 'checkOut', label: 'Check-Out Time', type: 'time' },
    ];

    const filtered = attendance?.filter(a =>
        a.employee?.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            await recordAttendance(data).unwrap();
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to record attendance');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Log</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Track daily staff attendance, check-ins, and shift timeliness.</p>
                </div>
                <button onClick={handleOpenModal} className="flex items-center px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl transition-all font-outfit">
                    <Plus className="mr-2 h-4 w-4" /> Mark Attendance
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6 uppercase tracking-widest">Date</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Employee</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-center">Status</th>
                                <th className="py-4 px-6 uppercase tracking-widest">Check In</th>
                                <th className="py-4 px-6 uppercase tracking-widest text-right">Check Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Records...</td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(a => (
                                    <tr key={a._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs">{new Date(a.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">
                                            <p className="text-slate-900 dark:text-white font-black uppercase text-xs">{a.employee?.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest">{a.employee?.department}</p>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${a.status === 'Present' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : a.status === 'Absent' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-900 dark:text-white font-black text-xs">{a.checkIn || '--:--'}</td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs text-right">{a.checkOut || '--:--'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Mark Employee Attendance">
                <DynamicForm schema={attendanceSchema} onSubmit={handleSubmit} loading={isCreating} />
            </Modal>
        </div>
    );
};

export default Attendance;
