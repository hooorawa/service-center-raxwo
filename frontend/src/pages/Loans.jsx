import React, { useState } from 'react';
import { Landmark, Search, Plus, User, DollarSign, Calendar, Clock, CheckCircle, Wallet, ArrowRightLeft, Trash2 } from 'lucide-react';
import {
    useGetLoansQuery,
    useCreateLoanMutation,
    useGetEmployeesQuery,
    useGetSalaryAdvancesQuery,
    useCreateSalaryAdvanceMutation,
    useUpdateAdvanceStatusMutation
} from '../slices/hrApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Loans = () => {
    const { data: loans, isLoading } = useGetLoansQuery();
    const { data: employees } = useGetEmployeesQuery();
    const [createLoan, { isLoading: isCreating }] = useCreateLoanMutation();
    const { data: advances } = useGetSalaryAdvancesQuery();
    const [createAdvance] = useCreateSalaryAdvanceMutation();
    const [updateAdvance] = useUpdateAdvanceStatusMutation();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('loans');

    const loanSchema = [
        {
            name: 'employee',
            label: 'Employee',
            type: 'select',
            required: true,
            options: employees?.map(e => ({ label: e.name, value: e._id })) || []
        },
        { name: 'amount', label: 'Loan Amount (Rs.)', type: 'number', required: true },
        { name: 'installmentAmount', label: 'Monthly Installment (Rs.)', type: 'number', required: true },
        { name: 'reason', label: 'Reason for Loan', type: 'textarea', fullWidth: true, required: true },
    ];

    const filtered = loans?.filter(l =>
        l.employee?.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (data) => {
        try {
            if (activeTab === 'loans') {
                await createLoan(data).unwrap();
            } else {
                await createAdvance(data).unwrap();
            }
            alert('Recorded successfully');
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Failed to record entry');
        }
    };

    const handleAdvanceStatus = async (id, status) => {
        try {
            await updateAdvance({ id, status }).unwrap();
            alert(`Advance ${status}`);
        } catch (err) {
            alert(err?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end font-outfit">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Loans</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage internal salary advances and staff loan agreements.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex">
                        <button
                            onClick={() => setActiveTab('loans')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'loans' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Staff Loans
                        </button>
                        <button
                            onClick={() => setActiveTab('advances')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'advances' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Salary Advances
                        </button>
                    </div>
                    <button onClick={handleOpenModal} className="flex items-center px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Issue {activeTab === 'loans' ? 'Loan' : 'Advance'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all text-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        {activeTab === 'loans' ? (
                            <>
                                <thead>
                                    <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                        <th className="py-4 px-6">Employee</th>
                                        <th className="py-4 px-6">Loan Amount</th>
                                        <th className="py-4 px-6">Installment</th>
                                        <th className="py-4 px-6 text-center">Issued On</th>
                                        <th className="py-4 px-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold">Loading...</td></tr>
                                    ) : filtered.length > 0 ? (
                                        filtered.map(l => (
                                            <tr key={l._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                                <td className="py-4 px-6 text-slate-900 dark:text-white font-black uppercase text-xs">{l.employee?.name}</td>
                                                <td className="py-4 px-6 font-black text-slate-900 dark:text-white">Rs. {l.amount.toLocaleString()}</td>
                                                <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-black">Rs. {l.installmentAmount.toLocaleString()}/mo</td>
                                                <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs text-center">{new Date(l.createdAt).toLocaleDateString()}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${l.status === 'Active' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No records found.</td></tr>
                                    )}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead>
                                    <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                                        <th className="py-4 px-6">Employee</th>
                                        <th className="py-4 px-6">Amount</th>
                                        <th className="py-4 px-6">Request Date</th>
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {advances?.filter(a => a.employee?.name.toLowerCase().includes(search.toLowerCase())).map(a => (
                                        <tr key={a._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
                                            <td className="py-4 px-6 text-slate-900 dark:text-white font-black uppercase text-xs">{a.employee?.name}</td>
                                            <td className="py-4 px-6 font-black text-slate-900 dark:text-white">Rs. {a.amount.toLocaleString()}</td>
                                            <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-xs">{new Date(a.requestDate).toLocaleDateString()}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${a.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : a.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                {a.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleAdvanceStatus(a._id, 'Approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><CheckCircle className="h-4 w-4" /></button>
                                                        <button onClick={() => handleAdvanceStatus(a._id, 'Rejected')} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={activeTab === 'loans' ? 'Issue New Employee Loan' : 'Request Salary Advance'}>
                <DynamicForm
                    schema={activeTab === 'loans' ? loanSchema : [
                        { name: 'employee', label: 'Employee', type: 'select', required: true, options: employees?.map(e => ({ label: e.name, value: e._id })) || [] },
                        { name: 'amount', label: 'Advance Amount (Rs.)', type: 'number', required: true },
                        { name: 'reason', label: 'Reason', type: 'textarea', required: true }
                    ]}
                    onSubmit={handleSubmit}
                    loading={isCreating}
                />
            </Modal>
        </div>
    );
};

export default Loans;
