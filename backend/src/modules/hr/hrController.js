const asyncHandler = require('express-async-handler');
const Employee = require('../../models/employeeModel');
const Attendance = require('../../models/attendanceModel');
const LeaveRequest = require('../../models/leaveModel');
const EmployeeLoan = require('../../models/loanModel');
const AttendancePolicy = require('../../models/attendancePolicyModel');
const LeavePolicy = require('../../models/leavePolicyModel');
const SalaryAdvance = require('../../models/salaryAdvanceModel');

// @desc    Register a new employee
// @route   POST /api/employees
// @access  Private/Admin
const registerEmployee = asyncHandler(async (req, res) => {
  const { 
    name, email, phone, department, designation, salary, 
    employmentType, contractType, joiningDate, bankDetails, taxInformation 
  } = req.body;

  const employeeExists = await Employee.findOne({ phone });

  if (employeeExists) {
    res.status(400);
    throw new Error('Employee with this phone number already exists');
  }

  const employee = await Employee.create({
    name,
    email,
    phone,
    department,
    designation,
    salary,
    employmentType,
    contractType,
    joiningDate,
    bankDetails,
    taxInformation
  });

  res.status(201).json(employee);
});

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({});
  res.json(employees);
});

// @desc    Update employee
// @route   PUT /api/hr/:id
// @access  Private/Admin
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.phone = req.body.phone || employee.phone;
    employee.department = req.body.department || employee.department;
    employee.designation = req.body.designation || employee.designation;
    employee.salary = req.body.salary || employee.salary;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// @desc    Delete employee
// @route   DELETE /api/hr/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (employee) {
    await employee.deleteOne();
    res.json({ message: 'Employee removed' });
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// Attendance Controllers
// @desc    Record attendance
// @route   POST /api/hr/attendance
// @access  Private/Admin
const recordAttendance = asyncHandler(async (req, res) => {
  const { employeeId, status, checkIn, checkOut, date } = req.body;

  const attendance = await Attendance.create({
    employee: employeeId,
    date,
    status,
    checkIn,
    checkOut,
  });

  res.status(201).json(attendance);
});

// @desc    Get attendance records
// @route   GET /api/hr/attendance
// @access  Private/Admin
const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({}).populate('employee', 'name department');
  res.json(attendance);
});

// Leave Controllers
// @desc    Get leave requests
// @route   GET /api/hr/leave
// @access  Private/Admin
const getLeaveRequests = asyncHandler(async (req, res) => {
  const leaves = await LeaveRequest.find({}).populate('employee', 'name department');
  res.json(leaves);
});

// @desc    Update leave status
// @route   PUT /api/hr/leave/:id
// @access  Private/Admin
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const leave = await LeaveRequest.findById(req.params.id);

  if (leave) {
    leave.status = status;
    leave.approvedBy = req.admin ? req.admin._id : null;
    const updatedLeave = await leave.save();
    res.json(updatedLeave);
  } else {
    res.status(404);
    throw new Error('Leave request not found');
  }
});

// Loan Controllers
// @desc    Get all employee loans
// @route   GET /api/hr/loans
// @access  Private/Admin
const getLoans = asyncHandler(async (req, res) => {
  const loans = await EmployeeLoan.find({}).populate('employee', 'name department');
  res.json(loans);
});

// @desc    Create a loan request
// @route   POST /api/hr/loans
// @access  Private/Admin
const createLoan = asyncHandler(async (req, res) => {
  const { employee, amount, reason, installmentAmount } = req.body;
  const loan = await EmployeeLoan.create({
    employee,
    amount,
    reason,
    installmentAmount,
  });
  res.status(201).json(loan);
});

// Attendance Policy Controllers
const getAttendancePolicies = asyncHandler(async (req, res) => {
  const policies = await AttendancePolicy.find({});
  res.json(policies);
});

const createAttendancePolicy = asyncHandler(async (req, res) => {
  const policy = await AttendancePolicy.create(req.body);
  res.status(201).json(policy);
});

// Leave Policy Controllers
const getLeavePolicies = asyncHandler(async (req, res) => {
  const policies = await LeavePolicy.find({});
  res.json(policies);
});

const createLeavePolicy = asyncHandler(async (req, res) => {
  const policy = await LeavePolicy.create(req.body);
  res.status(201).json(policy);
});

// Salary Advance Controllers
const getSalaryAdvances = asyncHandler(async (req, res) => {
  const advances = await SalaryAdvance.find({}).populate('employee', 'name department');
  res.json(advances);
});

const createSalaryAdvance = asyncHandler(async (req, res) => {
  const advance = await SalaryAdvance.create(req.body);
  res.status(201).json(advance);
});

const updateAdvanceStatus = asyncHandler(async (req, res) => {
  const advance = await SalaryAdvance.findById(req.params.id);
  if (advance) {
    advance.status = req.body.status;
    advance.approvedBy = req.admin ? req.admin._id : null;
    const updated = await advance.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Advance record not found');
  }
});

module.exports = {
  registerEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  recordAttendance,
  getAttendance,
  getLeaveRequests,
  updateLeaveStatus,
  getLoans,
  createLoan,
  getAttendancePolicies,
  createAttendancePolicy,
  getLeavePolicies,
  createLeavePolicy,
  getSalaryAdvances,
  createSalaryAdvance,
  updateAdvanceStatus,
};
