import React from 'react';
import { Bell, Search, User, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 mr-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 w-96">
                    <Search className="h-4 w-4 text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Global search..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-slate-400 text-slate-900 dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-6 font-outfit">
                <button className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors relative p-2">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        console.log('Theme toggle button clicked');
                        toggleTheme();
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <div className="flex items-center space-x-3 border-l pl-4 md:pl-6 border-slate-200 dark:border-slate-800">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Admin User</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Super Admin</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
