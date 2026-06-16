import React, { useState } from 'react';
import {
    Users,
    Search,
    Plus,
    Mail,
    Phone,
    Briefcase,
    DollarSign,
    Edit,
    Trash2,
    Download
} from 'lucide-react';
import {
    useGetEmployeesQuery,
    useRegisterEmployeeMutation,
    useUpdateEmployeeMutation,
    useDeleteEmployeeMutation
} from '../slices/hrApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const employeeSchema = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'phone', label: 'Phone Number', required: true },
    {
        name: 'department',
        label: 'Department',
        type: 'select',
        required: true,
        options: [
            { label: 'Service', value: 'Service' },
            { label: 'Inventory', value: 'Inventory' },
            { label: 'Finance', value: 'Finance' },
            { label: 'HR', value: 'HR' },
            { label: 'Management', value: 'Management' },
        ]
    },
    { name: 'designation', label: 'Designation', required: true },
    { name: 'salary', label: 'Monthly Salary (Rs.)', type: 'number', required: true },
    {
        name: 'employmentType',
        label: 'Employment Type',
        type: 'select',
        options: [
            { label: 'Permanent', value: 'Permanent' },
            { label: 'Contract', value: 'Contract' },
            { label: 'Probation', value: 'Probation' },
        ]
    },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
    { name: 'bankDetails.bankName', label: 'Bank Name' },
    { name: 'bankDetails.accountNumber', label: 'Account Number' },
    { name: 'taxInformation.tin', label: 'TIN / Tax ID' },
];

const Employees = () => {
    const { data: employees, isLoading } = useGetEmployeesQuery();
    const [registerEmployee, { isLoading: isCreating }] = useRegisterEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [deleteEmployee] = useDeleteEmployeeMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const filteredEmployees = employees?.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (employee = null) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingEmployee) {
                await updateEmployee({ id: editingEmployee._id, ...data }).unwrap();
            } else {
                await registerEmployee(data).unwrap();
            }
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await deleteEmployee(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    const handleExport = () => {
        window.open('/api/reports/hr/employees/excel', '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage staff profiles, departments, and payroll details.</p>
                </div>
                <div className="flex space-x-3 font-outfit">
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, department, or role..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Employee</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department & Role</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact Info</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Salary</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Employees...</td>
                                </tr>
                            ) : filteredEmployees?.length > 0 ? (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mr-4 uppercase">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-bold">{employee.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">ID: {employee._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-white font-bold">{employee.designation}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center mt-1">
                                                    <Briefcase className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-600" /> {employee.department}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center"><Mail className="h-3 w-3 mr-2 text-slate-300 dark:text-slate-600" /> {employee.email || 'N/A'}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center"><Phone className="h-3 w-3 mr-2 text-slate-300 dark:text-slate-600" /> {employee.phone}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                                            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {employee.salary.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(employee)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium">No employees found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingEmployee ? 'Edit Employee Profile' : 'Register New Employee'}
            >
                <DynamicForm
                    schema={employeeSchema}
                    onSubmit={handleSubmit}
                    initialData={editingEmployee}
                    loading={isCreating || isUpdating}
                />
            </Modal>
        </div>
    );
};

export default Employees;
