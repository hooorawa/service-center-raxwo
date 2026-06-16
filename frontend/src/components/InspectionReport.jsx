import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    XCircle,
    Camera,
    ChevronDown,
    Save,
    CheckCircle2,
    Info
} from 'lucide-react';
import { useGetInspectionByJobCardQuery, useUpsertInspectionMutation } from '../slices/serviceApiSlice';

const InspectionItem = ({ item, onUpdate }) => {
    const statusStyles = {
        'Green': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Yellow': 'bg-amber-50 text-amber-600 border-amber-100',
        'Red': 'bg-red-50 text-red-600 border-red-100',
        'N/A': 'bg-slate-50 text-slate-400 border-slate-100',
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{item.name}</span>
                <div className="flex space-x-1">
                    {['Green', 'Yellow', 'Red', 'N/A'].map(s => (
                        <button
                            key={s}
                            onClick={() => onUpdate({ ...item, status: s })}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all border ${item.status === s ? statusStyles[s] : 'bg-transparent text-slate-300 border-transparent hover:border-slate-100'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                placeholder="Observation notes..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-2 text-[10px] font-bold focus:ring-1 focus:ring-primary h-12"
                value={item.notes || ''}
                onChange={(e) => onUpdate({ ...item, notes: e.target.value })}
            />
        </div>
    );
};

const InspectionReport = ({ jobCardId, onClose }) => {
    const { data: existingInspection, isLoading } = useGetInspectionByJobCardQuery(jobCardId);
    const [upsertInspection, { isLoading: isSaving }] = useUpsertInspectionMutation();

    const categories = [
        { id: 'engine', label: 'Engine & Transmission', icon: '🔧' },
        { id: 'battery', label: 'Battery & Electrical', icon: '🔋' },
        { id: 'brakes', label: 'Braking System', icon: '🛑' },
        { id: 'tires', label: 'Tires & Wheels', icon: '🛞' },
        { id: 'fluids', label: 'Fluids & Filters', icon: '🧪' },
        { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
        { id: 'exterior', label: 'Exterior & Body', icon: '🚗' },
    ];

    const defaultItems = {
        engine: [{ name: 'Oil Level' }, { name: 'Belt Condition' }, { name: 'Coolant Level' }],
        battery: [{ name: 'Voltage' }, { name: 'Terminal Corrosion' }, { name: 'Charge Level' }],
        brakes: [{ name: 'Pad Thickness' }, { name: 'Disc Condition' }, { name: 'Brake Fluid' }],
        tires: [{ name: 'Tread Depth' }, { name: 'Tire Pressure' }, { name: 'Sidewall Condition' }],
        fluids: [{ name: 'Power Steering' }, { name: 'Transmission Fluid' }, { name: 'Washer Fluid' }],
        ac: [{ name: 'Vents Temp' }, { name: 'Gas Level' }, { name: 'Filter Condition' }],
        exterior: [{ name: 'Lights' }, { name: 'Wipers' }, { name: 'Body Dents' }],
    };

    const [formState, setFormState] = useState(defaultItems);

    useEffect(() => {
        if (existingInspection?.categories) {
            setFormState(existingInspection.categories);
        }
    }, [existingInspection]);

    const handleUpdateItem = (catId, index, updatedItem) => {
        setFormState(prev => ({
            ...prev,
            [catId]: prev[catId].map((item, i) => i === index ? updatedItem : item)
        }));
    };

    const handleSave = async () => {
        try {
            await upsertInspection({
                jobCard: jobCardId,
                categories: formState
            }).unwrap();
            alert('Digital Inspection Saved Successfully');
        } catch (err) {
            alert('Failed to save inspection');
        }
    };

    if (isLoading) return <div className="p-10 text-center font-black animate-pulse">LIFTING VEHICLE FOR INSPECTION...</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl font-outfit max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center">
                        <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                        Digital Vehicle Inspection
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">Comprehensive multipoint health check report.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Lock Inspection'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map(cat => (
                    <div key={cat.id} className="space-y-4">
                        <div className="flex items-center space-x-2 px-2">
                            <span className="text-lg">{cat.icon}</span>
                            <h4 className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{cat.label}</h4>
                        </div>
                        <div className="space-y-3">
                            {formState[cat.id]?.map((item, idx) => (
                                <InspectionItem
                                    key={idx}
                                    item={item}
                                    onUpdate={(updated) => handleUpdateItem(cat.id, idx, updated)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Technician Summary & Recommendations</h4>
                <textarea
                    className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary h-32"
                    placeholder="Enter overall workshop recommendations for this vehicle..."
                />
            </div>
        </div>
    );
};

export default InspectionReport;
