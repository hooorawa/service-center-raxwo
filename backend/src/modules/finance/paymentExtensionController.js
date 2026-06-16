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

module.exports = {
  refundPayment,
  generatePaymentLink,
};
