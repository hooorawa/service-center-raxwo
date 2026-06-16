import React from 'react';
import {
    Wrench,
    AlertTriangle,
    Users,
    Banknote,
    Car,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Building2,
    MessageSquare,
    Calculator,
    Package,
    Coins
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useGetStatsQuery, useGetRevenueChartQuery } from '../slices/dashboardApiSlice';
import { useGetRegistersQuery } from '../slices/cashApiSlice';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn'; // Assuming cn utility exists in utils/cn or similar. 

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`text-xs font-black px-2 py-1 rounded-lg flex items-center ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'}`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {trendValue}%
                </span>
            )}
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter italic">
            {typeof value === 'number' && !title.includes('Count') ? `Rs. ${value.toLocaleString()}` : value}
        </p>
    </motion.div>
);

const Dashboard = () => {
    const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
    const { data: chartData, isLoading: chartLoading } = useGetRevenueChartQuery();
    const { data: registers } = useGetRegistersQuery();

    const totalCashInHand = registers?.reduce((sum, reg) => sum + (reg.currentBalance || 0), 0) || 0;

    if (statsLoading || chartLoading) {
        return (
            <div className="space-y-8 animate-pulse p-8">
                <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Operations Command</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">Real-time enterprise metrics & service intelligence</p>
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button className="px-4 py-2 text-xs font-black uppercase bg-primary text-white rounded-xl shadow-lg shadow-primary/20">Overview</button>
                    <button className="px-4 py-2 text-xs font-black uppercase text-slate-500 hover:text-primary transition-colors">Financials</button>
                </div>
            </motion.div>

            {/* Financial Intelligence */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Financial Intelligence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Gross Revenue"
                        value={stats?.revenue}
                        icon={Banknote}
                        color="bg-primary"
                        trend="up"
                        trendValue={stats?.growthRate || 12}
                        delay={0.1}
                    />
                    <StatCard
                        title="Net Profit"
                        value={stats?.netProfit}
                        icon={Calculator}
                        color="bg-emerald-500"
                        delay={0.2}
                    />
                    <StatCard
                        title="Accounts Receivable"
                        value={stats?.outstandingBalance}
                        icon={AlertTriangle}
                        color="bg-orange-500"
                        delay={0.3}
                    />
                    <StatCard
                        title="Inventory Valuation"
                        value={stats?.inventoryValue}
                        icon={Package}
                        color="bg-violet-500"
                        delay={0.4}
                    />
                </div>
            </section>

            {/* Liquidity metrics */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Liquidity & Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Bank Liquidity" value={stats?.bankBalance} icon={Building2} color="bg-indigo-500" delay={0.5} />
                    <StatCard title="Cash in Hand" value={totalCashInHand} icon={Coins} color="bg-emerald-600" delay={0.6} />
                    <StatCard title="Petty Cash" value={stats?.pettyCashBalance} icon={Wallet} color="bg-slate-700" delay={0.7} />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Revenue Trajectory</h3>
                        <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 2 }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Status Breakdown */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic">Service Load</h3>
                    <div className="space-y-5">
                        {['Received', 'Diagnosing', 'Repairing', 'Ready', 'Delivered'].map(status => (
                            <div key={status}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{status}</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{stats?.statusBreakdown?.[status] || 0}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((stats?.statusBreakdown?.[status] || 0) / (stats?.activeRepairs || 1)) * 100}%` }}
                                        transition={{ duration: 1.5 }}
                                        className={cn(
                                            "h-full rounded-full",
                                            status === 'Delivered' ? "bg-emerald-500" :
                                                status === 'Ready' ? "bg-blue-500" :
                                                    status === 'Repairing' ? "bg-amber-500" : "bg-slate-400"
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Staff Today</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">{stats?.attendanceToday || 0} Members</p>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Repairs Table-style */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Flow monitoring</h3>
                        <button onClick={() => window.location.href = '/job-cards'} className="text-[10px] font-black text-primary uppercase border-b-2 border-primary/20 hover:border-primary transition-all">Full Board</button>
                    </div>
                    <div className="space-y-4">
                        {stats?.recentActivities?.map((activity, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 + (index * 0.1) }}
                                key={activity._id}
                                className="flex items-center space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all"
                            >
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase italic">{activity.vehicle?.registrationNumber}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Customer: {activity.customer?.name}</p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic">{activity.status}</p>
                                </div>
                                <div className={`h-2.5 w-2.5 rounded-full ${activity.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Alerts & Critical Metrics */}
                <div className="space-y-6">
                    <div className="bg-orange-500 p-8 rounded-[40px] text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl"
                        />
                        <div className="flex items-center space-x-3 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Supply Alert</span>
                        </div>
                        <h4 className="text-3xl font-black italic tracking-tighter mb-1">{stats?.lowStock || 0} SKUs</h4>
                        <p className="text-xs font-bold opacity-80 mb-6 uppercase">Items below reorder critical level</p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Restock Engine</button>
                    </div>

                    <div className="bg-violet-600 p-8 rounded-[40px] text-white shadow-2xl shadow-violet-500/20">
                        <div className="flex items-center space-x-3 mb-2">
                            <MessageSquare className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Engagement</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xl font-black italic tracking-tighter">{stats?.commStats?.smsSent || 0}</p>
                                <p className="text-[9px] font-black uppercase opacity-60">SMS Broadcasts</p>
                            </div>
                            <div>
                                <p className="text-xl font-black italic tracking-tighter">{stats?.commStats?.emailSent || 0}</p>
                                <p className="text-[9px] font-black uppercase opacity-60">Engine Alerts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
