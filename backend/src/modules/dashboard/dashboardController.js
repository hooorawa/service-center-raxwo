const asyncHandler = require('express-async-handler');
const Invoice = require('../../models/invoiceModel');
const JobCard = require('../../models/jobCardModel');
const Product = require('../../models/productModel');
const Attendance = require('../../models/attendanceModel');
const Customer = require('../../models/customerModel');
const Expense = require('../../models/expenseModel');
const Payroll = require('../../models/payrollModel');
const EmployeeLoan = require('../../models/loanModel');
const BankAccount = require('../../models/bankAccountModel');
const PettyCashFund = require('../../models/pettyCashFundModel');
const SMSLog = require('../../models/smsLogModel');
const EmailLog = require('../../models/emailLogModel');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Revenue Summary
  const totalRevenue = await Invoice.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  // Expenses Summary
  const totalExpenses = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const revenueVal = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
  const expenseVal = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
  const netProfit = revenueVal - expenseVal;

  // Active Repairs
  const activeRepairs = await JobCard.countDocuments({
    status: { $in: ['Received', 'Diagnosing', 'Waiting Parts', 'Repairing'] },
  });

  // Low Stock Items
  const lowStock = await Product.countDocuments({
    $expr: { $lte: ['$stockLevel', '$reorderLevel'] },
  });

  // Today's Attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceToday = await Attendance.countDocuments({
    date: { $gte: today },
    status: 'Present',
  });

  // Total Customers
  const totalCustomers = await Customer.countDocuments();

  // Pending Loans
  const pendingLoans = await EmployeeLoan.countDocuments({ status: 'Approved' });

  // Bank Balances
  const bankBalances = await BankAccount.aggregate([
    { $group: { _id: null, total: { $sum: '$currentBalance' } } },
  ]);

  // Petty Cash Balance
  const pettyCash = await PettyCashFund.aggregate([
    { $group: { _id: null, total: { $sum: '$currentBalance' } } },
  ]);

  // Communication Statistics
  const smsSent = await SMSLog.countDocuments({ status: 'Sent' });
  const emailSent = await EmailLog.countDocuments({ status: 'Sent' });

  // Inventory Valuation (Sum of price * stockLevel)
  const inventoryValuation = await Product.aggregate([
    { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stockLevel'] } } } },
  ]);

  // Accounts Receivable (Outstanding balance from invoices)
  const accountsReceivable = await Invoice.aggregate([
    { $match: { paymentStatus: { $in: ['Unpaid', 'Partially Paid'] } } },
    { $group: { _id: null, total: { $sum: { $subtract: ['$finalAmount', '$paidAmount'] } } } },
  ]);

  // Monthly Growth (This month vs Last month)
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);
  lastMonth.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const lastMonthRevenue = await Invoice.aggregate([
    { $match: { paymentStatus: 'Paid', createdAt: { $gte: lastMonth, $lt: thisMonthStart } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const thisMonthRevenue = await Invoice.aggregate([
    { $match: { paymentStatus: 'Paid', createdAt: { $gte: thisMonthStart } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const lmRev = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
  const tmRev = thisMonthRevenue.length > 0 ? thisMonthRevenue[0].total : 0;
  const growthRate = lmRev === 0 ? 100 : ((tmRev - lmRev) / lmRev) * 100;

  // Detailed Status Breakdowns
  const statusCounts = await JobCard.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Recent Activities (Last 5 job cards)
  const recentActivities = await JobCard.find({})
    .populate('customer', 'name')
    .populate('vehicle', 'registrationNumber make model')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    revenue: revenueVal,
    expenses: expenseVal,
    netProfit,
    inventoryValue: inventoryValuation.length > 0 ? inventoryValuation[0].total : 0,
    outstandingBalance: accountsReceivable.length > 0 ? accountsReceivable[0].total : 0,
    growthRate: Math.round(growthRate),
    activeRepairs,
    lowStock,
    attendanceToday,
    totalCustomers,
    pendingLoans,
    bankBalance: bankBalances.length > 0 ? bankBalances[0].total : 0,
    pettyCashBalance: pettyCash.length > 0 ? pettyCash[0].total : 0,
    statusBreakdown: statusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    payrollSummary: await Payroll.findOne({}).sort({ year: -1, month: -1 }),
    commStats: { smsSent, emailSent },
    recentActivities,
  });
});

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue-chart
// @access  Private/Admin
const getRevenueChart = asyncHandler(async (req, res) => {
  const chartData = await Invoice.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const formattedData = chartData.map((item) => ({
    month: months[item._id - 1],
    revenue: item.revenue,
  }));

  res.json(formattedData);
});

module.exports = {
  getDashboardStats,
  getRevenueChart,
};
