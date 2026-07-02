import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus, X, Save } from 'lucide-react';
import { createPortal } from 'react-dom';

const SearchableSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = 'Select option...', 
    onCreate, 
    createLabel = 'Add new',
    quickFormFields = null, // Array of { name, label, type, required, options }
    onQuickCreate = null    // async (formData) => { return { label, value } }
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
    const [quickFormData, setQuickFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleActionClick = () => {
        if (quickFormFields && onQuickCreate) {
            // Pre-fill primary field (usually the first field or matching by name)
            const prefilled = {};
            quickFormFields.forEach(f => {
                if (f.prefillWithSearch) {
                    prefilled[f.name] = searchTerm.trim();
                } else {
                    prefilled[f.name] = '';
                }
            });
            setQuickFormData(prefilled);
            setIsQuickFormOpen(true);
        } else if (onCreate) {
            handleCreateSimple();
        }
    };

    const handleCreateSimple = async () => {
        if (onCreate && searchTerm.trim()) {
            try {
                const newOpt = await onCreate(searchTerm.trim());
                if (newOpt && newOpt.value) {
                    handleSelect(newOpt.value);
                }
            } catch (err) {
                console.error('Error creating option:', err);
            }
        }
    };

    const handleQuickFormSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        for (const f of quickFormFields) {
            if (f.required && !quickFormData[f.name]) {
                alert(`${f.label} is required`);
                return;
            }
        }

        setIsSaving(true);
        try {
            const newOpt = await onQuickCreate(quickFormData);
            if (newOpt && newOpt.value) {
                setIsQuickFormOpen(false);
                handleSelect(newOpt.value);
            }
        } catch (err) {
            alert(err?.message || 'Failed to create item');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white flex justify-between items-center focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            >
                <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search Field */}
                    <div className="flex items-center px-3 border-b border-slate-100 dark:border-slate-800 py-2">
                        <Search className="h-4 w-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Type to search or create..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none outline-none py-1 text-xs text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600"
                            autoFocus
                        />
                        {searchTerm && (
                            <button type="button" onClick={() => setSearchTerm('')}>
                                <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                            </button>
                        )}
                    </div>

                    {/* Options list container */}
                    <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar text-xs">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                        opt.value === value ? 'bg-primary/5 text-primary font-bold' : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-slate-400 dark:text-slate-600 text-center font-medium">
                                No matching options
                            </div>
                        )}
                    </div>

                    {/* Inline Create Trigger */}
                    {((quickFormFields && onQuickCreate) || onCreate) && searchTerm.trim() && !options.some(opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase()) && (
                        <button
                            type="button"
                            onClick={handleActionClick}
                            className="w-full border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                        >
                            <Plus className="h-4 w-4" />
                            {createLabel} "{searchTerm.trim()}"
                        </button>
                    )}
                </div>
            )}

            {/* Quick Create Modal */}
            {isQuickFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsQuickFormOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{createLabel}</h3>
                            <button type="button" onClick={() => setIsQuickFormOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleQuickFormSubmit} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {quickFormFields.map(field => (
                                <div key={field.name} className="space-y-1">
                                    <label className="block text-slate-700 dark:text-slate-300">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'select' ? (
                                        <select
                                            value={quickFormData[field.name] || ''}
                                            onChange={(e) => setQuickFormData({ ...quickFormData, [field.name]: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white"
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            value={quickFormData[field.name] || ''}
                                            onChange={(e) => setQuickFormData({ ...quickFormData, [field.name]: e.target.value })}
                                            disabled={field.disabled}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsQuickFormOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchableSelect;
