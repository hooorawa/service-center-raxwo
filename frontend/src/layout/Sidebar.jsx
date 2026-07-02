import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Car,
    Calendar,
    Wrench,
    Package,
    UserCircle,
    FileText,
    CreditCard,
    Settings,
    ShieldCheck,
    Award,
    Bell,
    BarChart3,
    LogOut,
    Calculator,
    Building2,
    MessageSquare,
    Coins,
    LayoutGrid
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Customers', icon: Users, path: '/customers' },
        { name: 'Vehicles', icon: Car, path: '/vehicles' },
        { name: 'Appointments', icon: Calendar, path: '/appointments' },
        {
            title: 'Service Operations',
            items: [
                { name: 'Job Cards', icon: Wrench, path: '/job-cards' },
                { name: 'Visual Bay Scheduler', icon: LayoutGrid, path: '/scheduler' },
                { name: 'Workshop Queue', icon: LayoutDashboard, path: '/workshop-queue' },
                { name: 'Services', icon: Wrench, path: '/services' },

                { name: 'Repairs', icon: ShieldCheck, path: '/repairs' },
                { name: 'Insurance', icon: Award, path: '/insurance' },
                { name: 'Warranty', icon: ShieldCheck, path: '/warranty' },
            ]
        },
        {
            title: 'Inventory',
            items: [
                { name: 'Products', icon: Package, path: '/inventory' },
                { name: 'Suppliers', icon: UserCircle, path: '/suppliers' },
                { name: 'Purchases', icon: FileText, path: '/purchases' },
            ]
        },
        {
            title: 'HR',
            items: [
                { name: 'Employees', icon: Users, path: '/employees' },
                { name: 'Attendance', icon: Calendar, path: '/attendance' },
                { name: 'Leave', icon: FileText, path: '/leave' },
                { name: 'Loans', icon: CreditCard, path: '/loans' },
                { name: 'Payroll', icon: Calculator, path: '/payroll' },
            ]
        },
        {
            title: 'Finance & Banking',
            items: [
                { name: 'Banking', icon: Building2, path: '/banking' },
                { name: 'Petty Cash', icon: Coins, path: '/petty-cash' },
                { name: 'Cash Register', icon: Coins, path: '/cash-register' },
                { name: 'Transactions', icon: BarChart3, path: '/transactions' },

            ]
        },
        {
            title: 'Sales',
            items: [
                { name: 'Quotations', icon: FileText, path: '/quotations' },
                { name: 'Invoices', icon: FileText, path: '/invoices' },
                { name: 'Payments', icon: CreditCard, path: '/payments' },
                { name: 'Comms Log', icon: MessageSquare, path: '/communication' },
            ]
        },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-300 border-r border-slate-800 dark:border-slate-800 transition-transform duration-300 transform md:sticky md:top-0 md:translate-x-0 flex flex-col h-screen shrink-0 font-outfit shadow-2xl md:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="flex items-center justify-between h-16 bg-slate-900 dark:bg-slate-950 px-6 border-b border-slate-800 dark:border-slate-800">
                <h1 className="text-xl font-bold text-white dark:text-white tracking-wider">REPAIR ERP</h1>
                <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
                    <LogOut className="h-5 w-5 rotate-180" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-4 px-3 dark:bg-slate-900/10">
                {menuItems.map((item, index) => (
                    <div key={index} className="mb-4">
                        {item.title ? (
                            <>
                                <p className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    {item.title}
                                </p>
                                {item.items.map((subItem, subIndex) => (
                                    <NavLink
                                        key={subIndex}
                                        to={subItem.path}
                                        onClick={() => window.innerWidth < 768 && toggleSidebar()}
                                        className={({ isActive }) => cn(
                                            "flex items-center px-4 py-2.5 text-sm font-bold rounded-2xl transition-all mb-1 font-outfit",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-800/50 hover:text-white"
                                        )}
                                    >
                                        <subItem.icon className="mr-3 h-5 w-5" />
                                        {subItem.name}
                                    </NavLink>
                                ))}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                                className={({ isActive }) => cn(
                                    "flex items-center px-4 py-2.5 text-sm font-bold rounded-2xl transition-all font-outfit",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-white"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </NavLink>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={logoutHandler}
                    className="flex items-center w-full px-4 py-2.5 text-sm font-bold rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all font-outfit"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
