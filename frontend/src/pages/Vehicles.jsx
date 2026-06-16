import React, { useState } from 'react';
import {
    Car,
    Search,
    Plus,
    User,
    Edit,
    Trash2,
    Calendar,
    Hash,
    Truck,
} from 'lucide-react';
import {
    useGetVehiclesQuery,
    useDeleteVehicleMutation,
    useRegisterVehicleMutation,
    useUpdateVehicleMutation
} from '../slices/vehicleApiSlice';
import { useGetCustomersQuery } from '../slices/customerApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Vehicles = () => {
    const { data: vehicles, isLoading } = useGetVehiclesQuery();
    const { data: customers } = useGetCustomersQuery();
    const [deleteVehicle] = useDeleteVehicleMutation();
    const [registerVehicle, { isLoading: isCreating }] = useRegisterVehicleMutation();
    const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    const vehicleSchema = [
        {
            name: 'owner',
            label: 'Owner',
            type: 'select',
            required: true,
            options: customers?.map(c => ({ label: c.name, value: c._id })) || []
        },
        { name: 'registrationNumber', label: 'Registration Number (Plate)', required: true },
        { name: 'make', label: 'Make (e.g. Toyota)', required: true },
        { name: 'model', label: 'Model (e.g. Corolla)', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'color', label: 'Color' },
        { name: 'chassisNumber', label: 'Chassis Number' },
        { name: 'engineNumber', label: 'Engine Number' },
    ];

    const filteredVehicles = vehicles?.filter(v =>
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.owner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle({
                ...vehicle,
                owner: vehicle.owner?._id // Set only the ID for the select field
            });
        } else {
            setEditingVehicle(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingVehicle) {
                await updateVehicle({ id: editingVehicle._id, ...data }).unwrap();
            } else {
                await registerVehicle(data).unwrap();
            }
            handleCloseModal();
        } catch (err) {
            alert(err?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await deleteVehicle(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Registry</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Track all registered vehicles and their service history.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Register Vehicle
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-outfit transition-all">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by plate, owner, or model..."
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
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vehicle</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Owner</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identifiers</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">Loading Vehicles...</td>
                                </tr>
                            ) : filteredVehicles?.length > 0 ? (
                                filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold mr-4">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-bold uppercase">{vehicle.registrationNumber}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                                                <User className="h-4 w-4 mr-2 text-slate-300 dark:text-slate-600" />
                                                {vehicle.owner?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                {vehicle.chassisNumber && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold tracking-tighter">VIN: {vehicle.chassisNumber}</p>}
                                                {vehicle.engineNumber && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold tracking-tighter">ENG: {vehicle.engineNumber}</p>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(vehicle)}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vehicle._id)}
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
                                    <td colSpan="4" className="py-20 text-center text-slate-400 font-medium">No vehicles found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
            >
                <DynamicForm
                    schema={vehicleSchema}
                    onSubmit={handleSubmit}
                    initialData={editingVehicle}
                    loading={isCreating || isUpdating}
                />
            </Modal>
        </div>
    );
};

export default Vehicles;
