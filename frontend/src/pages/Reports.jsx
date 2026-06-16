import React from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Users,
    Package,
    Coins
} from 'lucide-react';

import { useGetStatsQuery, useGetRevenueChartQuery } from '../slices/dashboardApiSlice';

const ReportCard = ({ title, description, icon: Icon, onExport }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-2xl bg-primary/5 dark:bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            <button
                onClick={onExport}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary rounded-xl transition-colors"
            >
                <Download className="h-5 w-5" />
            </button>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">{description}</p>
        <button
            onClick={onExport}
            className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors shadow-none hover:shadow-sm"
        >
            Generate Report
        </button>
    </div>
);

const Reports = () => {
    const { data: stats } = useGetStatsQuery();

    const handleExport = (type) => {
        const routes = {
            customers: '/api/reports/customers/excel',
            inventory: '/api/reports/inventory/excel',
            revenue: '/api/reports/finance/revenue/excel',
            productivity: '/api/reports/hr/productivity/excel',
            workshop: '/api/reports/service/workshop/excel',
            expenses: '/api/reports/finance/expenses/excel',
            cash: '/api/reports/finance/cash/excel',
        };

        if (routes[type]) {
            window.open(routes[type], '_blank');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytical Reports</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Extract deep insights from your service center operations.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        This Month
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard
                    title="Revenue Summary"
                    description="Detailed breakdown of income, taxes, and discounts across all paid invoices."
                    icon={TrendingUp}
                    onExport={() => handleExport('revenue')}
                />
                <ReportCard
                    title="Inventory & Stock"
                    description="Full export of spare parts, SKU mapping, and current stock valuations."
                    icon={Package}
                    onExport={() => handleExport('inventory')}
                />
                <ReportCard
                    title="Customer CRM Data"
                    description="Complete list of registered clients, contact details, and their service history."
                    icon={Users}
                    onExport={() => handleExport('customers')}
                />
                <ReportCard
                    title="Staff Productivity"
                    description="Analysis of job cards completed per technician and attendance trends."
                    icon={BarChart3}
                    onExport={() => handleExport('productivity')}
                />
                <ReportCard
                    title="Service Workshop"
                    description="Log of all repairs, average repair times, and status distributions."
                    icon={FileText}
                    onExport={() => handleExport('workshop')}
                />
                <ReportCard
                    title="Expense Tracking"
                    description="Summary of parts procurement costs and HR payroll expenditures."
                    icon={PieChart}
                    onExport={() => handleExport('expenses')}
                />
                <ReportCard
                    title="Cash & Reconciliation"
                    description="Audit trail of cash transactions, drawer movements, and shift variances."
                    icon={Coins}
                    onExport={() => handleExport('cash')}
                />
            </div>

        </div>
    );
};

export default Reports;
