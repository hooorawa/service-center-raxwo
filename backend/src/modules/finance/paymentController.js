const asyncHandler = require('express-async-handler');
const Appointment = require('../../models/appointmentModel');
const PaymentTransaction = require('../../models/paymentTransactionModel');
const CashRegister = require('../../models/cashRegisterModel');
const CashTransaction = require('../../models/cashTransactionModel');
const CashReceipt = require('../../models/cashReceiptModel');
const FinancialTransaction = require('../../models/financialTransactionModel');
const mongoose = require('mongoose');


// @desc    Process a split or partial payment
// @route   POST /api/finance/payments/transactions
// @access  Private/Admin
const recordPayment = asyncHandler(async (req, res) => {
  const { appointmentId, amount, paymentMethod, transactionId, bankSlip, notes } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) throw new Error('Appointment not found');

    // Create the transaction record
    const transaction = await PaymentTransaction.create([{
      appointment: appointmentId,
      customer: appointment.customer,
      amount,
      paymentMethod,
      transactionId,
      bankSlip,
      notes,
      status: 'Completed'
    }], { session });

    // Update appointment paid amount and balance
    appointment.billing.paidAmount += Number(amount);
    appointment.billing.balance = appointment.billing.grandTotal - appointment.billing.paidAmount;

    // Auto-update status if fully paid
    if (appointment.billing.balance <= 0) {
      if (appointment.status === 'Completed') {
        appointment.status = 'Delivered';
      }
    }

    await appointment.save({ session });

    // --- CASH REGISTER INTEGRATION ---
    if (paymentMethod === 'Cash') {
      const { registerId } = req.body;
      if (!registerId) {
        throw new Error('Cash Register selection is required for cash payments');
      }

      const register = await CashRegister.findById(registerId).session(session);
      if (!register || register.status === 'Closed') {
        throw new Error('Cash Register is not found or is closed');
      }

      // Create Cash Transaction
      const cashTxn = await CashTransaction.create([{
        transactionNumber: `TXN-${Date.now()}`,
        invoiceId: appointment.billing.invoiceId || undefined, // Assuming invoiceId might be there
        appointmentId: appointment._id,
        customerId: appointment.customer,
        amount: Number(amount),
        paymentType: 'Cash',
        transactionType: 'Customer Payment',
        registerId: register._id,
        receivedBy: req.user._id,
        remarks: notes || `Payment for appointment ${appointment._id}`,
      }], { session });

      // Create Cash Receipt Record
      await CashReceipt.create([{
        receiptNumber: `RCP-${Date.now()}`,
        transactionId: cashTxn[0]._id,
        invoiceId: appointment.billing.invoiceId || undefined,
        appointmentId: appointment._id,
      }], { session });

      // Update Register Balance
      register.currentBalance += Number(amount);
      await register.save({ session });
    }

    // --- ACCOUNTING INTEGRATION ---
    await FinancialTransaction.create([{
      type: 'Income',
      category: 'Service',
      amount: Number(amount),
      paymentMethod,
      referenceModel: 'Appointment',
      referenceId: appointment._id,
      description: `Payment for appointment ${appointment._id}. Method: ${paymentMethod}`,
      processedBy: req.user._id,
      status: 'Completed'
    }], { session });

    await session.commitTransaction();

    res.status(201).json(transaction[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
});

// @desc    Get payment history for an appointment
// @route   GET /api/finance/payments/transactions/:appointmentId
// @access  Private/Admin
const getAppointmentTransactions = asyncHandler(async (req, res) => {
  const transactions = await PaymentTransaction.find({ appointment: req.params.appointmentId });
  res.json(transactions);
});

module.exports = {
  recordPayment,
  getAppointmentTransactions,
};
