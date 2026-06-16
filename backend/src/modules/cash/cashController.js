const asyncHandler = require('express-async-handler');
const CashRegister = require('../../models/cashRegisterModel');
const CashTransaction = require('../../models/cashTransactionModel');
const CashReconciliation = require('../../models/cashReconciliationModel');
const CashAdjustment = require('../../models/cashAdjustmentModel');
const CashRefund = require('../../models/cashRefundModel');
const CashReceipt = require('../../models/cashReceiptModel');
const FinancialTransaction = require('../../models/financialTransactionModel');

// @desc    Create a new cash register
// @route   POST /api/cash/registers
// @access  Private/Admin
const createRegister = asyncHandler(async (req, res) => {
  const { registerName, location, branch } = req.body;
  const registerExists = await CashRegister.findOne({ registerName });

  if (registerExists) {
    res.status(400);
    throw new Error('Register already exists');
  }

  const register = await CashRegister.create({
    registerName,
    location,
    branch: branch || 'Main',
  });

  res.status(201).json(register);
});

// @desc    Get all cash registers
// @route   GET /api/cash/registers
// @access  Private/Admin
const getRegisters = asyncHandler(async (req, res) => {
  const registers = await CashRegister.find({});
  res.json(registers);
});

// @desc    Open a cash register (Start Shift)
// @route   POST /api/cash/registers/:id/open
// @access  Private/Admin
const openRegister = asyncHandler(async (req, res) => {
  const { openingBalance } = req.body;
  const register = await CashRegister.findById(req.params.id);

  if (!register) {
    res.status(404);
    throw new Error('Register not found');
  }

  if (register.status === 'Open') {
    res.status(400);
    throw new Error('Register is already open');
  }

  register.status = 'Open';
  register.openedBy = req.user._id;
  register.openedAt = Date.now();
  register.openingBalance = openingBalance;
  register.currentBalance = openingBalance;
  register.expectedBalance = openingBalance;
  register.actualBalance = 0;
  register.variance = 0;

  await register.save();

  // Record opening transaction
  await CashTransaction.create({
    transactionNumber: `TXN-OPEN-${Date.now()}`,
    registerId: register._id,
    amount: openingBalance,
    transactionType: 'Opening Balance',
    receivedBy: req.user._id,
    remarks: 'Shift opened',
  });

  // Create Financial Transaction (Accounting)
  await FinancialTransaction.create({
    type: 'Income',
    category: 'Cash Register Opening',
    amount: openingBalance,
    paymentMethod: 'Cash',
    referenceModel: 'CashRegister',
    referenceId: register._id,
    description: `Register shift opened for ${register.registerName}`,
    status: 'Completed',
    processedBy: req.user._id,
  });

  res.json(register);

});

// @desc    Close a cash register (End Shift & Reconciliation)
// @route   POST /api/cash/registers/:id/close
// @access  Private/Admin
const closeRegister = asyncHandler(async (req, res) => {
  const { actualBalance, notes } = req.body;
  const register = await CashRegister.findById(req.params.id);

  if (!register || register.status === 'Closed') {
    res.status(400);
    throw new Error('Register is not open or not found');
  }

  const expectedBalance = register.currentBalance;
  const variance = actualBalance - expectedBalance;
  
  let reconStatus = 'Balanced';
  if (variance < 0) reconStatus = 'Shortage';
  if (variance > 0) reconStatus = 'Excess';

  // Create Reconciliation record
  const reconciliation = await CashReconciliation.create({
    registerId: register._id,
    shiftOpenedAt: register.openedAt,
    shiftClosedAt: Date.now(),
    openingBalance: register.openingBalance,
    expectedBalance,
    actualBalance,
    variance,
    status: reconStatus,
    performedBy: req.user._id,
    notes,
  });

  // Update register status
  register.status = 'Closed';
  register.closedBy = req.user._id;
  register.closedAt = Date.now();
  register.actualBalance = actualBalance;
  register.variance = variance;
  // Reset for next shift? Usually we keep currentBalance as actual if it stays in drawer, 
  // but here we'll reset to 0 or actual.
  // For production, maybe actualBalance is what's left in drawer.
  await register.save();

  // Record closing transaction
  await CashTransaction.create({
    transactionNumber: `TXN-CLOSE-${Date.now()}`,
    registerId: register._id,
    amount: actualBalance,
    transactionType: 'Closing Balance',
    receivedBy: req.user._id,
    remarks: `Shift closed. Variance: ${variance}`,
  });

  // Create Financial Transaction for Variance (if any)
  if (variance !== 0) {
    await FinancialTransaction.create({
      type: variance > 0 ? 'Income' : 'Expense',
      category: 'Cash Variance',
      amount: Math.abs(variance),
      paymentMethod: 'Cash',
      referenceModel: 'CashReconciliation',
      referenceId: reconciliation._id,
      description: `Cash variance for ${register.registerName} at shift close. Status: ${reconStatus}`,
      status: 'Completed',
      processedBy: req.user._id,
    });
  }

  res.json({ register, reconciliation });

});

// @desc    Add cash adjustment (Cash In/Out/Adjustment)
// @route   POST /api/cash/registers/:id/adjust
// @access  Private/Admin
const addAdjustment = asyncHandler(async (req, res) => {
  const { type, amount, reason } = req.body;
  const register = await CashRegister.findById(req.params.id);

  if (!register || register.status === 'Closed') {
    res.status(400);
    throw new Error('Register must be open to add adjustments');
  }

  const transaction = await CashTransaction.create({
    transactionNumber: `TXN-ADJ-${Date.now()}`,
    registerId: register._id,
    amount,
    transactionType: type === 'Add' ? 'Cash In' : 'Cash Out',
    receivedBy: req.user._id,
    remarks: reason,
  });

  await CashAdjustment.create({
    registerId: register._id,
    type,
    amount,
    reason,
    adjustedBy: req.user._id,
    transactionId: transaction._id,
  });

  // Create Financial Transaction (Accounting)
  await FinancialTransaction.create({
    type: type === 'Add' ? 'Income' : 'Expense',
    category: 'Cash Adjustment',
    amount,
    paymentMethod: 'Cash',
    referenceModel: 'CashAdjustment',
    referenceId: transaction._id, // Linking to the transaction
    description: `Manual cash adjustment: ${reason}`,
    status: 'Completed',
    processedBy: req.user._id,
  });

  // Update register balance

  if (type === 'Add') {
    register.currentBalance += amount;
  } else {
    register.currentBalance -= amount;
  }
  await register.save();

  res.status(201).json(transaction);
});

// @desc    Get transactions for a register
// @route   GET /api/cash/registers/:id/transactions
// @access  Private/Admin
const getRegisterTransactions = asyncHandler(async (req, res) => {
  const transactions = await CashTransaction.find({ registerId: req.params.id })
    .populate('receivedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(transactions);
});

module.exports = {
  createRegister,
  getRegisters,
  openRegister,
  closeRegister,
  addAdjustment,
  getRegisterTransactions,
};
