const asyncHandler = require('express-async-handler');
const Payment = require('../../models/paymentModel');
const Invoice = require('../../models/invoiceModel');
const FinancialTransaction = require('../../models/financialTransactionModel');

// @desc    Refund a payment
// @route   POST /api/finance/payments/:id/refund
// @access  Private/Admin
const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('invoice');
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.isRefunded) {
    res.status(400);
    throw new Error('Payment already refunded');
  }

  payment.status = 'Refunded';
  payment.isRefunded = true;
  await payment.save();

  // Update Invoice
  const invoice = payment.invoice;
  invoice.paidAmount -= payment.amount;
  if (invoice.paidAmount <= 0) {
    invoice.paymentStatus = 'Unpaid';
  } else {
    invoice.paymentStatus = 'Partially Paid';
  }
  await invoice.save();

  // Record Financial Transaction (as an expense or negative income)
  await FinancialTransaction.create({
    type: 'Expense',
    category: 'Refund',
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    referenceModel: 'Payment',
    referenceId: payment._id,
    description: `Refund for payment ${payment._id} on invoice ${invoice.invoiceNumber}`,
  });

  res.json({ message: 'Payment refunded successfully', payment });
});

// @desc    Generate Payment Link (Mock implementation for now)
// @route   POST /api/finance/invoices/:id/payment-link
// @access  Private/Admin
const generatePaymentLink = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // In a real scenario, integrate with Stripe Checkout API here
  const mockLink = `https://checkout.stripe.com/pay/${invoice.invoiceNumber}_${Date.now()}`;
  invoice.paymentLink = mockLink;
  await invoice.save();

  res.json({ paymentLink: mockLink });
});

// @desc    Simulate Stripe Webhook (Successful payment)
// @route   POST /api/finance/payments/simulate-webhook/:invoiceNumber
// @access  Public
const simulatePaymentWebhook = asyncHandler(async (req, res) => {
  const { invoiceNumber } = req.params;
  const invoice = await Invoice.findOne({ invoiceNumber });

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  if (invoice.paymentStatus === 'Paid') {
    return res.json({ message: 'Invoice already paid', invoice });
  }

  const amountToPay = invoice.finalAmount - invoice.paidAmount;

  // Create payment record
  const payment = await Payment.create({
    invoice: invoice._id,
    amount: amountToPay,
    paymentDate: new Date(),
    paymentMethod: 'Card',
    transactionId: `TXN-STRIPE-${Date.now()}`,
    notes: 'Simulated Stripe Payment Webhook'
  });

  // Update Invoice
  invoice.paidAmount = invoice.finalAmount;
  invoice.paymentStatus = 'Paid';
  await invoice.save();

  // Create financial transaction record
  await FinancialTransaction.create({
    type: 'Income',
    category: 'Sales',
    amount: amountToPay,
    paymentMethod: 'Card',
    referenceModel: 'Payment',
    referenceId: payment._id,
    description: `Stripe online payment for invoice ${invoice.invoiceNumber}`
  });

  res.json({ message: 'Payment simulated successfully', invoice, payment });
});

module.exports = {
  refundPayment,
  generatePaymentLink,
  simulatePaymentWebhook
};
