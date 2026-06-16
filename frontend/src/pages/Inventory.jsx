import React, { useState } from 'react';
import {
    Package,
    Search,
    Plus,
    AlertTriangle,
    Edit,
    Trash2,
    Download,
    History,
    Barcode,
    Tags,
    Calendar,
    ArrowDownLeft,
    ArrowUpRight,
    Building2,
    Warehouse,
    Settings,
    MapPin
} from 'lucide-react';
import {
    useGetProductsQuery,
    useAddProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetInventoryMovementsQuery,
    useGetWarehousesQuery,
    useCreateWarehouseMutation,
    useUpdateWarehouseMutation,
    useRunProcurementAuditMutation
} from '../slices/inventoryApiSlice';

import { useGetSuppliersQuery } from '../slices/inventoryApiSlice';
import Modal from '../components/Modal';
import DynamicForm from '../components/DynamicForm';

const Inventory = () => {
    const { data: products, isLoading } = useGetProductsQuery();
    const { data: suppliers } = useGetSuppliersQuery();
    const [addProduct, { isLoading: isCreating }] = useAddProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);

    const [activeTab, setActiveTab] = useState('inventory');
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    const { data: warehouses } = useGetWarehousesQuery();

    const {
        data: movements = [],
        isLoading: loadingMovements
    } = useGetInventoryMovementsQuery(
        selectedProductForHistory?._id,
        {
            skip: !selectedProductForHistory
        }
    );
    const [createWarehouse, { isLoading: isCreatingWarehouse }] = useCreateWarehouseMutation();
    const [updateWarehouse, { isLoading: isUpdatingWarehouse }] = useUpdateWarehouseMutation();
    const [runAudit, { isLoading: isAuditing }] = useRunProcurementAuditMutation();

    const productSchema = [
        { name: 'name', label: 'Part Name / Product', required: true, placeholder: 'e.g., Brake Pads (Front)' },
        { name: 'sku', label: 'SKU / Part Number', required: true, placeholder: 'e.g., BP-FR-V1' },
        { name: 'barcode', label: 'Barcode', placeholder: 'Scan or Enter Barcode' },
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
                { label: 'Oils & Lubricants', value: 'Oils & Lubricants' },
                { label: 'Filters', value: 'Filters' },
                { label: 'Brakes', value: 'Brakes' },
                { label: 'Tyres', value: 'Tyres' },
                { label: 'Batteries', value: 'Batteries' },
                { label: 'Engine Parts', value: 'Engine Parts' },
                { label: 'Other', value: 'Other' },
            ]
        },
        { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true },
        { name: 'costPrice', label: 'Cost Price', type: 'number', required: true },
        { name: 'stockLevel', label: 'Initial Stock', type: 'number', required: true },
        { name: 'reorderLevel', label: 'Reorder Level', type: 'number', required: true },
        { name: 'unit', label: 'Unit (e.g. Pcs, Ltr, Box)', required: true },
        {
            name: 'supplier',
            label: 'Preferred Supplier',
            type: 'select',
            options: suppliers?.map(s => ({ label: s.name, value: s._id })) || []
        },
        { name: 'batchNumber', label: 'Default Batch Number' },
        { name: 'expiryDate', label: 'Default Expiry Date', type: 'date' },
        { name: 'trackBatch', label: 'Enable Batch Tracking', type: 'checkbox' },
        { name: 'hasSerialNumbers', label: 'Requires Serial Numbers', type: 'checkbox' },
    ];


    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct({
                ...product,
                supplier: product.supplier?._id,
                expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingProduct(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingProduct) {
                await updateProduct({ id: editingProduct._id, ...data }).unwrap();
            } else {
                await addProduct(data).unwrap();
            }
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (err) {
            alert(err?.data?.message || 'Failed to save product');
        }
    };

    const handleRunAudit = async () => {
        try {
            const res = await runAudit().unwrap();
            alert(res.message);
        } catch (err) {
            alert(err?.data?.message || 'Procurement audit failed');
        }
    };


    const warehouseSchema = [
        { name: 'name', label: 'Warehouse Name', required: true },
        { name: 'location', label: 'Physical Location' },
        { name: 'manager', label: 'Warehouse Manager' },
        { name: 'isDefault', label: 'Set as Default Hub', type: 'checkbox' },
    ];

    const handleWarehouseSubmit = async (data) => {
        try {
            if (editingWarehouse) {
                await updateWarehouse({ id: editingWarehouse._id, ...data }).unwrap();
            } else {
                await createWarehouse(data).unwrap();
            }
            setIsWarehouseModalOpen(false);
            setEditingWarehouse(null);
        } catch (err) {
            alert(err?.data?.message || 'Failed to save warehouse');
        }
    };

    return (

        <div className="space-y-8 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Spare Parts & Inventory</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage automotive stock, barcodes, and movement history</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleRunAudit}
                        disabled={isAuditing}
                        className="flex items-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                    >
                        <Settings className={`mr-2 h-4 w-4 ${isAuditing ? 'animate-spin' : ''}`} />
                        {isAuditing ? 'Auditing...' : 'Run Audit'}
                    </button>
                    <button className="flex items-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 transition-all">

                        <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                        <span onClick={() => handleOpenModal()}>New Part</span>
                    </button>
                </div>
            </div>

            <div className="flex space-x-6 border-b border-slate-100 dark:border-slate-800 mb-8 font-outfit">
                <button onClick={() => setActiveTab('inventory')} className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Inventory List</button>
                <button onClick={() => setActiveTab('warehouses')} className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'warehouses' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Warehouse Control</button>
                <button onClick={() => setActiveTab('settings')} className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Stock Settings</button>
            </div>

            {activeTab === 'inventory' && (
                <>
                    <div className="relative w-full max-w-lg mb-8">
                        <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Name, SKU or Barcode..."
                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-0 focus:border-primary transition-all text-sm font-bold text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </>
            )}


            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase text-xs tracking-[0.2em] animate-pulse">Scanning Inventory...</div>
                    ) : filteredProducts?.length > 0 ? (
                        filteredProducts.map((product) => {
                            const isLowStock = product.stockLevel <= product.reorderLevel;
                            return (
                                <div key={product._id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 group transition-all hover:scale-[1.02]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-3xl ${isLowStock ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'} transition-all group-hover:bg-primary group-hover:text-white`}>
                                            <Package className="h-6 w-6 stroke-[2px]" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {isLowStock && (
                                                <span className="flex items-center text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100 animate-pulse">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Low
                                                </span>
                                            )}
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                                                {product.unit}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{product.name}</h3>
                                        <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                            <Tags className="h-3 w-3 mr-1.5 opacity-50" />
                                            {product.category}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                                            <p className={`text-xl font-black ${isLowStock ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                {product.stockLevel || 0}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MSRP</p>
                                            <p className="text-xl font-black text-primary">
                                                ${product.sellingPrice?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Part ID / SKU</div>
                                            <div className="text-[10px] font-black text-slate-900 dark:text-white tracking-widest uppercase">{product.sku}</div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => { setSelectedProductForHistory(product); setIsHistoryModalOpen(true); }}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:text-blue-500"
                                                title="Stock History"
                                            >
                                                <History className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:text-primary"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center opacity-40">
                            <Package className="h-16 w-16 mb-4 stroke-[1px]" />
                            <p className="text-xs font-black uppercase tracking-[0.3em]">Spare parts catalog is empty</p>
                        </div>
                    )}
                </div>
            )}


            {activeTab === 'warehouses' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Warehouse Cards */}
                    {warehouses?.map(w => (
                        <div key={w._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <Warehouse className="h-7 w-7" />
                                </div>
                                {w.isDefault && <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest italic">Default Hub</span>}
                            </div>
                            <div className="space-y-1 mb-8 relative z-10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{w.name}</h3>
                                <p className="text-sm font-bold text-slate-400 flex items-center uppercase italic">
                                    <MapPin className="h-4 w-4 mr-1" /> {w.location || 'Undisclosed'}
                                </p>
                            </div>
                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mgr: {w.manager || 'N/A'}</div>
                                <button
                                    onClick={() => { setEditingWarehouse(w); setIsWarehouseModalOpen(true); }}
                                    className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                >
                                    <Settings className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => { setEditingWarehouse(null); setIsWarehouseModalOpen(true); }}
                        className="bg-slate-50 dark:bg-slate-950 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all group"
                    >
                        <Plus className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Initialize Hub</span>
                    </button>

                </div>
            )}


            {/* Product Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Update Part Specifications' : 'Onboard New Spare Part'}
            >
                <DynamicForm
                    schema={productSchema}
                    onSubmit={handleSubmit}
                    initialData={editingProduct}
                    loading={isCreating || isUpdating}
                />
            </Modal>

            {/* Stock History Modal */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title={`Stock Movement Logs - ${selectedProductForHistory?.name}`}
            >
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 font-outfit uppercase">
                    {loadingMovements ? (
                        <div className="text-center py-10 font-black text-[10px] text-slate-400 tracking-widest animate-pulse">Retrieving Logs...</div>
                    ) : movements?.length > 0 ? (
                        movements.map((m, idx) => (
                            <div key={idx} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-xl mr-4 ${m.type === 'Purchase' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {m.type === 'Purchase' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-900 dark:text-white tracking-wider">{m.type}</div>
                                        <div className="text-[8px] text-slate-400 font-bold">{new Date(m.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-[8px] font-black text-slate-400 mb-0.5">Quantity</div>
                                        <div className={`text-xs font-black ${m.type === 'Purchase' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {m.type === 'Purchase' ? '+' : '-'}{m.quantity}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-black text-slate-400 mb-0.5">Result</div>
                                        <div className="text-xs font-black text-slate-900 dark:text-white">{m.afterStock}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-10">
                            No movement logs found for this part.
                        </div>
                    )}
                </div>
            </Modal>
            {/* Warehouse Modal */}
            <Modal
                isOpen={isWarehouseModalOpen}
                onClose={() => setIsWarehouseModalOpen(false)}
                title={editingWarehouse ? 'Adjust Hub Configuration' : 'Establish New Inventory Hub'}
            >
                <DynamicForm
                    schema={warehouseSchema}
                    onSubmit={handleWarehouseSubmit}
                    initialData={editingWarehouse}
                    loading={isCreatingWarehouse || isUpdatingWarehouse}
                />
            </Modal>
        </div>
    );
};


export default Inventory;
