import React from 'react';
import { useForm } from 'react-hook-form';

const DynamicForm = ({ schema, onSubmit, initialData = {}, loading = false }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schema.map((field) => (
                    <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'select' ? (
                            <select
                                {...register(field.name, { required: field.required })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            >
                                <option value="">Select {field.label}</option>
                                {field.options.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">{opt.label}</option>
                                ))}
                            </select>
                        ) : field.type === 'textarea' ? (
                            <textarea
                                {...register(field.name, { required: field.required })}
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-600"
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                        ) : (
                            <input
                                type={field.type || 'text'}
                                {...register(field.name, { required: field.required })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-600"
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                        )}

                        {errors[field.name] && (
                            <p className="mt-1 text-xs font-bold text-red-500">This field is required</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all disabled:opacity-50 active:scale-95"
                >
                    {loading ? 'Processing...' : 'Submit'}
                </button>
            </div>
        </form>
    );
};

export default DynamicForm;
