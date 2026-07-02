const asyncHandler = require('express-async-handler');
const Quotation = require('../../models/quotationModel');
const Invoice = require('../../models/invoiceModel');
const Payment = require('../../models/paymentModel');
const FinancialTransaction = require('../../models/financialTransactionModel');

const { sendEmail, sendSMS } = require('../notifications/notificationService');
const BankAccount = require('../../models/bankAccountModel');
const PettyCashFund = require('../../models/pettyCashFundModel');
const PettyCashTransaction = require('../../models/pettyCashTransactionModel');
const Expense = require('../../models/expenseModel');
const JobCard = require('../../models/jobCardModel');

// @desc    Generate a quotation
// @route   POST /api/finance/quotations
// @access  Private/Admin
const generateQuotation = asyncHandler(async (req, res) => {
  const { customer, vehicle, items, laborCharges, totalAmount, expiryDate } = req.body;
  const quotation = await Quotation.create({ customer, vehicle, items, laborCharges, totalAmount, expiryDate });
  res.status(201).json(quotation);
});

// @desc    Get all quotations
// @route   GET /api/finance/quotations
// @access  Private/Admin
const getQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find({}).populate('customer', 'name phone').populate('vehicle', 'registrationNumber model');
  res.json(quotations);
});

// @desc    Delete quotation
// @route   DELETE /api/finance/quotations/:id
// @access  Private/Admin
const deleteQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (quotation) {
    await quotation.deleteOne();
    res.json({ message: 'Quotation removed' });
  } else {
    res.status(404);
    throw new Error('Quotation not found');
  }
});

// @desc    Generate an invoice
// @route   POST /api/finance/invoices
// @access  Private/Admin
const generateInvoice = asyncHandler(async (req, res) => {
  console.log('Generating invoice with data:', req.body);
  try {
    const { customer, vehicle, jobCard, items, laborCharges, totalAmount, tax, discount, finalAmount } = req.body;
    
    // Generate automatic invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoice = await Invoice.create({ 
      invoiceNumber,
      customer, 
      vehicle, 
      jobCard: jobCard || undefined, 
      items: items || [], 
      laborCharges: laborCharges || 0, 
      totalAmount, 
      tax: tax || 0, 
      discount: discount || 0, 
      finalAmount 
    });
    
    // Automatically deduct spare parts stock from inventory
    if (items && items.length > 0) {
      const Product = require('../../models/productModel');
      for (const item of items) {
        if (item.product && item.quantity > 0) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockLevel: -Number(item.quantity) }
          });
        }
      }
    }

    if (jobCard) {
      await JobCard.findByIdAndUpdate(jobCard, { status: 'Ready' });
    }
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice Generation Error:', error);
    res.status(400); 
    throw new Error(error.message);
  }
});

// @desc    Get all invoices
// @route   GET /api/finance/invoices
// @access  Private/Admin
const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({}).populate('customer', 'name phone').populate('vehicle', 'registrationNumber model');
  res.json(invoices);
});

// @desc    Update invoice status
// @route   PUT /api/finance/invoices/:id
// @access  Private/Admin
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (invoice) {
    invoice.paymentStatus = req.body.paymentStatus || invoice.paymentStatus;
    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

// @desc    Delete invoice
// @route   DELETE /api/finance/invoices/:id
// @access  Private/Admin
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (invoice) {
    await invoice.deleteOne();
    res.json({ message: 'Invoice removed' });
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

// @desc    Record a payment
// @route   POST /api/finance/payments
// @access  Private/Admin
const recordPayment = asyncHandler(async (req, res) => {
  const { invoice, amount, paymentMethod, transactionId, notes } = req.body;
  const payment = await Payment.create({ 
    invoice, 
    amount: Number(amount), 
    paymentDate: req.body.paymentDate || Date.now(),
    paymentMethod, 
    transactionId, 
    notes 
  });
  const inv = await Invoice.findById(invoice);
  if (inv) {
    inv.paidAmount += Number(amount);
    if (inv.paidAmount >= inv.finalAmount) {
      inv.paymentStatus = 'Paid';
    } else {
      inv.paymentStatus = 'Partially Paid';
    }
    await inv.save();
  }
  res.status(201).json(payment);
});

// @desc    Get all payments
// @route   GET /api/finance/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({}).populate({ path: 'invoice', populate: { path: 'customer', select: 'name' } });
  res.json(payments);
});

// @desc    Delete payment record
// @route   DELETE /api/finance/payments/:id
// @access  Private/Admin
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (payment) {
    // Optionally reverse invoice paidAmount here if needed
    await payment.deleteOne();
    res.json({ message: 'Payment record removed' });
  } else {
    res.status(404);
    throw new Error('Payment record not found');
  }
});

// Bank Account Controllers
const getBankAccounts = asyncHandler(async (req, res) => {
  const accounts = await BankAccount.find({});
  res.json(accounts);
});

const createBankAccount = asyncHandler(async (req, res) => {
  const account = await BankAccount.create(req.body);
  res.status(201).json(account);
});

// Petty Cash Controllers
const getPettyCashFunds = asyncHandler(async (req, res) => {
  const funds = await PettyCashFund.find({});
  res.json(funds);
});

const createPettyCashFund = asyncHandler(async (req, res) => {
  const fund = await PettyCashFund.create(req.body);
  res.status(201).json(fund);
});

const getPettyCashTransactions = asyncHandler(async (req, res) => {
  const transactions = await PettyCashTransaction.find({ fund: req.params.fundId }).populate('requestedBy', 'name');
  res.json(transactions);
});

const recordPettyCashTransaction = asyncHandler(async (req, res) => {
    const { fund, type, amount, category, description, requestedBy } = req.body;
    const fundDoc = await PettyCashFund.findById(fund);
    
    if (!fundDoc) {
        res.status(404);
        throw new Error('Petty cash fund not found');
    }

    const transaction = await PettyCashTransaction.create({
        fund, type, amount, category, description, requestedBy, status: 'Completed'
    });

    // Update fund balance
    if (type === 'Top-up') {
        fundDoc.currentBalance += amount;
    } else {
        fundDoc.currentBalance -= amount;
    }
    await fundDoc.save();

    res.status(201).json(transaction);
});

// Centralized Transaction Controllers
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await FinancialTransaction.find({}).sort({ date: -1 });
  res.json(transactions);
});

// Expense Management
const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({});
    res.json(expenses);
});

const createExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.create(req.body);
    
    // Create financial transaction
    await FinancialTransaction.create({
        type: 'Expense',
        category: expense.category,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
        referenceModel: 'Expense',
        referenceId: expense._id,
        description: expense.description
    });

    res.status(201).json(expense);
});

// @desc    Send invoice via Email
// @route   POST /api/finance/invoices/:id/send-email
const sendInvoiceEmail = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('customer');
    if (!invoice) throw new Error('Invoice not found');

    const subject = `Invoice ${invoice.invoiceNumber} from Repair ERP`;
    const html = `<h3>Hi ${invoice.customer.name},</h3><p>Your invoice for ${invoice.finalAmount} is ready.</p>`;
    
    await sendEmail(invoice.customer.email, subject, 'Your invoice is ready', html);
    res.json({ message: 'Email sent successfully' });
});

// @desc    Send invoice via SMS
// @route   POST /api/finance/invoices/:id/send-sms
const sendInvoiceSMS = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('customer');
    if (!invoice) throw new Error('Invoice not found');

    const message = `Hi ${invoice.customer.name}, your invoice ${invoice.invoiceNumber} for Rs.${invoice.finalAmount} is ready. Thank you!`;
    
    await sendSMS(invoice.customer.phone, message, 'Invoice', invoice._id);
    res.json({ message: 'SMS sent successfully' });
});

// @desc    Get Customer Financial Statement
// @route   GET /api/finance/statement/:customerId
// @access  Private/Admin
const getCustomerStatement = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  
  const invoices = await Invoice.find({ customer: customerId });
  const payments = await Payment.find({}).populate({
    path: 'invoice',
    match: { customer: customerId }
  });

  // Filter payments that actually belong to this customer (since we populated filtered)
  const customerPayments = payments.filter(p => p.invoice !== null);

  // Combine and sort
  const statement = [
    ...invoices.map(i => ({
      date: i.createdAt,
      type: 'Invoice',
      reference: i.invoiceNumber,
      debit: i.finalAmount,
      credit: 0,
      description: `Service Invoice #${i.invoiceNumber}`,
    })),
    ...customerPayments.map(p => ({
      date: p.paymentDate,
      type: 'Payment',
      reference: p.transactionId || 'CASH',
      debit: 0,
      credit: p.amount,
      description: `Payment Received via ${p.paymentMethod}`,
    }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate Running Balance
  let runningBalance = 0;
  const statementWithBalance = statement.map(entry => {
    runningBalance += (entry.debit - entry.credit);
    return { ...entry, balance: runningBalance };
  });

  res.json(statementWithBalance);
});

module.exports = {

  generateQuotation,
  getQuotations,
  deleteQuotation,
  getInvoices,
  generateInvoice,
  updateInvoice,
  deleteInvoice,
  getPayments,
  recordPayment,
  deletePayment,
  getBankAccounts,
  createBankAccount,
  getPettyCashFunds,
  createPettyCashFund,
  getPettyCashTransactions,
  recordPettyCashTransaction,
  getTransactions,
  getExpenses,
  createExpense,
  sendInvoiceEmail,
  sendInvoiceSMS,
  getCustomerStatement,
};
