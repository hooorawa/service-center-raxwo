const asyncHandler = require('express-async-handler');
const Payroll = require('../../models/payrollModel');
const PayrollItem = require('../../models/payrollItemModel');
const Employee = require('../../models/employeeModel');
const EmployeeLoan = require('../../models/loanModel');
const SalaryAdvance = require('../../models/salaryAdvanceModel');
const Attendance = require('../../models/attendanceModel');
const LeaveRequest = require('../../models/leaveModel');

// @desc    Process payroll for a month
// @route   POST /api/payroll/process
// @access  Private/Admin
const processPayroll = asyncHandler(async (req, res) => {
  const { month, year } = req.body;

  // Check if payroll already exists for this period
  const existingPayroll = await Payroll.findOne({ month, year });
  if (existingPayroll && existingPayroll.status !== 'Draft') {
    res.status(400);
    throw new Error('Payroll for this period has already been processed/paid');
  }

  const payroll = existingPayroll || await Payroll.create({ month, year });
  
  // Clear existing items for this payroll if any (for re-processing)
  await PayrollItem.deleteMany({ payroll: payroll._id });

  const employees = await Employee.find({ status: 'Active' });
  
  let totalEarnings = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  for (const emp of employees) {
    const basicSalary = emp.salary;
    
    // Calculate Attendance Deductions (Late, Early, Half-Day)
    // Placeholder logic - typically needs mapping to AttendancePolicy
    const lates = await Attendance.countDocuments({ 
        employee: emp._id, 
        status: 'Late',
        date: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) }
    });
    const lateDeduction = lates * 100; // Example flat penalty

    // Calculate No-Pay Leaves
    const unpaids = await LeaveRequest.find({
        employee: emp._id,
        leaveType: 'Unpaid',
        status: 'Approved',
        startDate: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) }
    });
    const noPayDays = unpaids.reduce((acc, l) => {
        const diff = (l.endDate - l.startDate) / (1000 * 60 * 60 * 24) + 1;
        return acc + diff;
    }, 0);
    const noPayDeduction = Math.round((basicSalary / 30) * noPayDays);

    // Calculate Loan Installments
    const activeLoan = await EmployeeLoan.findOne({ employee: emp._id, status: 'Approved' });
    const loanInstallment = activeLoan ? activeLoan.installmentAmount : 0;

    // Calculate Salary Advances for the recovery month
    const advance = await SalaryAdvance.findOne({ 
        employee: emp._id, 
        status: 'Approved',
        recoveryMonth: month,
        recoveryYear: year
    });
    const advanceDeduction = advance ? advance.amount : 0;

    // OT Calculation (Placeholder)
    const otAttendance = await Attendance.find({
        employee: emp._id,
        overtimeHours: { $gt: 0 },
        date: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) }
    });
    const otHours = otAttendance.reduce((acc, a) => acc + a.overtimeHours, 0);
    const otAmount = otHours * (basicSalary / 160) * 1.5; // Example 160h/month, 1.5x rate

    const earnings = {
        allowances: 0,
        overtime: Math.round(otAmount),
        bonuses: 0,
        incentives: 0
    };

    const deductions = {
        loans: loanInstallment,
        advances: advanceDeduction,
        lateAttendance: lateDeduction,
        noPayLeave: noPayDeduction,
        tax: 0,
        epfEmployee: Math.round(basicSalary * 0.08) // Example 8%
    };

    const totalEmpEarnings = basicSalary + earnings.overtime + earnings.allowances + earnings.bonuses + earnings.incentives;
    const totalEmpDeductions = deductions.loans + deductions.advances + deductions.lateAttendance + deductions.noPayLeave + deductions.tax + deductions.epfEmployee;
    const netSalary = totalEmpEarnings - totalEmpDeductions;

    await PayrollItem.create({
        payroll: payroll._id,
        employee: emp._id,
        basicSalary,
        earnings,
        deductions,
        totalEarnings: totalEmpEarnings,
        totalDeductions: totalEmpDeductions,
        netSalary,
        employerContributions: {
            epfEmployer: Math.round(basicSalary * 0.12),
            etfEmployer: Math.round(basicSalary * 0.03)
        }
    });

    // Update loan totalPaid if installment applies
    if (activeLoan && activeLoan.status === 'Approved') {
        activeLoan.totalPaid += loanInstallment;
        if (activeLoan.totalPaid >= activeLoan.amount) activeLoan.status = 'Paid';
        await activeLoan.save();
    }

    // Update advance status if recovered
    if (advance) {
        advance.status = 'Recovered';
        await advance.save();
    }

    totalEarnings += totalEmpEarnings;
    totalDeductions += totalEmpDeductions;
    totalNet += netSalary;
  }

  payroll.totalEarnings = totalEarnings;
  payroll.totalDeductions = totalDeductions;
  payroll.totalNetSalary = totalNet;
  payroll.status = 'Processed';
  await payroll.save();

  res.json({ message: 'Payroll processed successfully', payroll });
});

// @desc    Get payroll items for a specific payroll
// @route   GET /api/payroll/:id
// @access  Private/Admin
const getPayrollItems = asyncHandler(async (req, res) => {
    const items = await PayrollItem.find({ payroll: req.params.id }).populate('employee', 'name department designation');
    res.json(items);
});

// @desc    Get all payroll history
// @route   GET /api/payroll
// @access  Private/Admin
const getPayrollHistory = asyncHandler(async (req, res) => {
    const history = await Payroll.find({}).sort({ year: -1, month: -1 });
    res.json(history);
});

module.exports = {
  processPayroll,
  getPayrollItems,
  getPayrollHistory,
};
