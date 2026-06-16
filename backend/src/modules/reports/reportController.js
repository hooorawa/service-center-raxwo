const asyncHandler = require('express-async-handler');
const Invoice = require('../../models/invoiceModel');
const Customer = require('../../models/customerModel');
const Vehicle = require('../../models/vehicleModel');
const Product = require('../../models/productModel');
const JobCard = require('../../models/jobCardModel');
const Payment = require('../../models/paymentModel');
const Expense = require('../../models/expenseModel');
const ExcelJS = require('exceljs');
const Payroll = require('../../models/payrollModel');
const PayrollItem = require('../../models/payrollItemModel');
const FinancialTransaction = require('../../models/financialTransactionModel');
const PettyCashTransaction = require('../../models/pettyCashTransactionModel');
const BankAccount = require('../../models/bankAccountModel');
const CashTransaction = require('../../models/cashTransactionModel');
const CashReconciliation = require('../../models/cashReconciliationModel');
const CashRegister = require('../../models/cashRegisterModel');
const CashReceipt = require('../../models/cashReceiptModel');
const PDFDocument = require('pdfkit');
const Appointment = require('../../models/appointmentModel');
const Inspection = require('../../models/inspectionModel');




// @desc    Download Invoice PDF
// @route   GET /api/reports/invoice/:id/pdf
// @access  Private/Admin
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer')
    .populate('vehicle');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const doc = new PDFDocument();
  let filename = `Invoice_${invoice.invoiceNumber}.pdf`;
  
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.text(`INVOICE: ${invoice.invoiceNumber}`, { align: 'center', size: 20 });
  doc.moveDown();
  doc.text(`Customer: ${invoice.customer.name}`);
  doc.text(`Vehicle: ${invoice.vehicle.registrationNumber} (${invoice.vehicle.make} ${invoice.vehicle.model})`);
  doc.moveDown();
  doc.text('Items:', { underline: true });
  
  invoice.items.forEach(item => {
    doc.text(`${item.description} - ${item.quantity} x ${item.unitPrice} = ${item.total}`);
  });

  doc.moveDown();
  doc.text(`Labor Charges: ${invoice.laborCharges}`);
  doc.text(`Tax: ${invoice.tax}`);
  doc.text(`Discount: ${invoice.discount}`);
  doc.text(`Total Amount: ${invoice.totalAmount}`, { bold: true });

  doc.end();
  doc.pipe(res);
});

// @desc    Export Customers Excel
// @route   GET /api/reports/customers/excel
// @access  Private/Admin
const exportCustomersExcel = asyncHandler(async (req, res) => {
  const customers = await Customer.find({});
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customers');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Address', key: 'address', width: 50 },
  ];

  customers.forEach(customer => {
    worksheet.addRow({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'customers.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export Inventory Excel
// @route   GET /api/reports/inventory/excel
// @access  Private/Admin
const exportInventoryExcel = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category', 'name').populate('supplier', 'name');
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventory');

  worksheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Stock Level', key: 'stockLevel', width: 15 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Supplier', key: 'supplier', width: 30 },
  ];

  products.forEach(product => {
    worksheet.addRow({
      sku: product.sku,
      name: product.name,
      category: product.category?.name || 'N/A',
      stockLevel: product.stockLevel,
      price: product.price,
      supplier: product.supplier?.name || 'N/A'
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'inventory.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export Revenue Excel
// @route   GET /api/reports/finance/revenue/excel
// @access  Private/Admin
const exportRevenueExcel = asyncHandler(async (req, res) => {
  const payments = await Payment.find({}).populate({ path: 'invoice', populate: { path: 'customer', select: 'name' } });
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Revenue');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Customer', key: 'customer', width: 30 },
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Payment Method', key: 'method', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
  ];

  payments.forEach(p => {
    worksheet.addRow({
      date: p.paymentDate ? p.paymentDate.toISOString().split('T')[0] : 'N/A',
      customer: p.invoice?.customer?.name || 'N/A',
      invoiceNumber: p.invoice?.invoiceNumber || 'N/A',
      method: p.paymentMethod,
      amount: p.amount
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'revenue_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export Staff Productivity Excel
// @route   GET /api/reports/hr/productivity/excel
// @access  Private/Admin
const exportProductivityExcel = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ department: 'Technical' });
  const jobCards = await JobCard.find({ status: 'Delivered' });
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Staff Productivity');

  worksheet.columns = [
    { header: 'Staff Name', key: 'name', width: 30 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Jobs Completed', key: 'jobsCompleted', width: 15 },
  ];

  employees.forEach(emp => {
    const completedCount = jobCards.filter(jc => jc.technician && jc.technician.toString() === emp._id.toString()).length;
    worksheet.addRow({
      name: emp.name,
      designation: emp.designation,
      jobsCompleted: completedCount
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'staff_productivity.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export Service Workshop Excel
// @route   GET /api/reports/service/workshop/excel
// @access  Private/Admin
const exportWorkshopExcel = asyncHandler(async (req, res) => {
  const jobCards = await JobCard.find({}).populate('customer', 'name').populate('vehicle', 'registrationNumber');
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Workshop Activity');

  worksheet.columns = [
    { header: 'Job Card ID', key: 'id', width: 25 },
    { header: 'Customer', key: 'customer', width: 30 },
    { header: 'Vehicle', key: 'vehicle', width: 20 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  jobCards.forEach(jc => {
    worksheet.addRow({
      id: jc._id.toString(),
      customer: jc.customer?.name || 'N/A',
      vehicle: jc.vehicle?.registrationNumber || 'N/A',
      status: jc.status,
      createdAt: jc.createdAt.toISOString().split('T')[0]
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'workshop_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export Expenses Excel
// @route   GET /api/reports/finance/expenses/excel
// @access  Private/Admin
const exportExpensesExcel = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({});
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Payment Method', key: 'method', width: 20 },
  ];

  expenses.forEach(exp => {
    worksheet.addRow({
      date: exp.date.toISOString().split('T')[0],
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      method: exp.paymentMethod
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'expenses_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export Payroll Excel
// @route   GET /api/reports/payroll/:id/excel
const exportPayrollExcel = asyncHandler(async (req, res) => {
    const items = await PayrollItem.find({ payroll: req.params.id }).populate('employee');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Export');

    worksheet.columns = [
        { header: 'Employee', key: 'name', width: 25 },
        { header: 'Basic Salary', key: 'basic', width: 15 },
        { header: 'OT', key: 'ot', width: 10 },
        { header: 'Earnings', key: 'earnings', width: 15 },
        { header: 'Deductions', key: 'deductions', width: 15 },
        { header: 'Net Salary', key: 'net', width: 15 },
    ];

    items.forEach(item => {
        worksheet.addRow({
            name: item.employee.name,
            basic: item.basicSalary,
            ot: item.earnings.overtime,
            earnings: item.totalEarnings,
            deductions: item.totalDeductions,
            net: item.netSalary
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_${req.params.id}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
});

// @desc    Export Financial Transactions Excel
const exportTransactionsExcel = asyncHandler(async (req, res) => {
    const transactions = await FinancialTransaction.find({}).sort({ date: -1 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Description', key: 'desc', width: 30 },
    ];

    transactions.forEach(t => {
        worksheet.addRow({
            date: t.date.toISOString().split('T')[0],
            type: t.type,
            category: t.category,
            amount: t.amount,
            method: t.paymentMethod,
            desc: t.description
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial_transactions.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

// @desc    Export Cash Reports Excel (Transactions & Reconciliations)
// @route   GET /api/reports/finance/cash/excel
// @access  Private/Admin
const exportCashReportsExcel = asyncHandler(async (req, res) => {
    const transactions = await CashTransaction.find({}).populate('registerId', 'registerName').populate('receivedBy', 'name');
    const reconciliations = await CashReconciliation.find({}).populate('registerId', 'registerName').populate('performedBy', 'name');
    
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Transactions
    const txSheet = workbook.addWorksheet('Cash Transactions');
    txSheet.columns = [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'TXN Number', key: 'txn', width: 20 },
        { header: 'Register', key: 'register', width: 20 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Handled By', key: 'by', width: 20 },
        { header: 'Remarks', key: 'remarks', width: 40 },
    ];

    transactions.forEach(t => {
        txSheet.addRow({
            date: t.createdAt.toISOString(),
            txn: t.transactionNumber,
            register: t.registerId?.registerName || 'N/A',
            type: t.transactionType,
            amount: t.amount,
            by: t.receivedBy?.name || 'N/A',
            remarks: t.remarks
        });
    });

    // Sheet 2: Reconciliations
    const reconSheet = workbook.addWorksheet('Shift Reconciliations');
    reconSheet.columns = [
        { header: 'Close Date', key: 'date', width: 20 },
        { header: 'Register', key: 'register', width: 20 },
        { header: 'Opening Bal', key: 'opening', width: 15 },
        { header: 'Expected Bal', key: 'expected', width: 15 },
        { header: 'Actual Bal', key: 'actual', width: 15 },
        { header: 'Variance', key: 'variance', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Performed By', key: 'by', width: 20 },
    ];

    reconciliations.forEach(r => {
        reconSheet.addRow({
            date: r.shiftClosedAt?.toISOString() || 'N/A',
            register: r.registerId?.registerName || 'N/A',
            opening: r.openingBalance,
            expected: r.expectedBalance,
            actual: r.actualBalance,
            variance: r.variance,
            status: r.status,
            by: r.performedBy?.name || 'N/A'
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=cash_management_report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

// @desc    Download Cash Receipt PDF
// @route   GET /api/reports/cash/receipt/:id/pdf
// @access  Private/Admin
const downloadCashReceiptPDF = asyncHandler(async (req, res) => {
    const receipt = await CashReceipt.findById(req.params.id)
        .populate({
            path: 'transactionId',
            populate: [
                { path: 'customerId', select: 'name' },
                { path: 'receivedBy', select: 'name' },
                { path: 'registerId', select: 'registerName' }
            ]
        });

    if (!receipt) {
        res.status(404);
        throw new Error('Receipt not found');
    }

    const appointment = await Appointment.findById(receipt.appointmentId || receipt.transactionId?.appointmentId)
        .populate('customer')
        .populate('vehicle');

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Receipt_${receipt.receiptNumber}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    // Header
    doc.fontSize(20).text('CASH PAYMENT RECEIPT', { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(10).text('REPAIR ERP SERVICE CENTER', { align: 'center' });
    doc.text('Automotive Excellence | Workshop Management', { align: 'center' });
    doc.moveDown(2);

    // Receipt Info
    doc.fontSize(12).text(`Receipt No: ${receipt.receiptNumber}`, { bold: true });
    doc.text(`Date & Time: ${receipt.createdAt.toLocaleString()}`);
    doc.moveDown();

    // Customer & Vehicle Info
    doc.fontSize(10).text('BILL TO:', { underline: true });
    doc.text(`Customer: ${appointment?.customer?.name || receipt.transactionId?.customerId?.name || 'N/A'}`);
    doc.text(`Vehicle: ${appointment?.vehicle?.registrationNumber || 'N/A'} (${appointment?.vehicle?.make} ${appointment?.vehicle?.model})`);
    doc.text(`Appointment: ${appointment?.appointmentNumber || 'N/A'}`);
    doc.moveDown();

    // Payment Details
    doc.fontSize(10).text('PAYMENT DETAILS:', { underline: true });
    doc.text(`Amount Paid: Rs. ${receipt.transactionId?.amount?.toLocaleString()}`, { bold: true });
    doc.text(`Payment Method: ${receipt.transactionId?.paymentType} (via ${receipt.transactionId?.registerId?.registerName})`);
    doc.text(`Cashier: ${receipt.transactionId?.receivedBy?.name}`);
    doc.moveDown();

    // Services & Parts (Summary)
    if (appointment) {
        doc.text('Summary of Works:', { underline: true });
        appointment.services?.forEach(s => doc.text(`- ${s.name} (Rs. ${s.price})`));
        appointment.parts?.forEach(p => doc.text(`- ${p.name} (Rs. ${p.price} x ${p.quantity})`));
        doc.moveDown();
    }

    // Footer
    doc.moveDown(5);
    doc.fontSize(8).text('This is a computer-generated receipt and does not require a physical signature.', { align: 'center', color: 'grey' });
    doc.text('Thank you for choosing our service!', { align: 'center' });

    doc.end();
    doc.pipe(res);
});

// @desc    Download Inspection PDF
// @route   GET /api/reports/inspection/:id/pdf
// @access  Private/Admin
const downloadInspectionPDF = asyncHandler(async (req, res) => {
    const inspection = await Inspection.findById(req.params.id)
        .populate({
            path: 'jobCard',
            populate: [{ path: 'customer' }, { path: 'vehicle' }]
        });

    if (!inspection) {
        res.status(404);
        throw new Error('Inspection not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Inspection_${inspection._id}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    // Header
    doc.rect(0, 0, 612, 100).fill('#0ea5e9'); // Success/Blue header
    doc.fillColor('white').fontSize(24).text('VEHICLE HEALTH REPORT', 0, 40, { align: 'center', bold: true });
    doc.moveDown(3);

    // Metadata
    doc.fillColor('black').fontSize(10);
    doc.text(`Report Date: ${inspection.createdAt.toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(14).text('CUSTOMER & VEHICLE DETAILS', { underline: true });
    doc.fontSize(10).text(`Customer: ${inspection.jobCard?.customer?.name}`);
    doc.text(`Vehicle: ${inspection.jobCard?.vehicle?.registrationNumber} (${inspection.jobCard?.vehicle?.make} ${inspection.jobCard?.vehicle?.model})`);
    doc.moveDown(2);

    // Categories
    const categories = [
        { id: 'engine', label: 'Engine & Transmission' },
        { id: 'battery', label: 'Battery & Electrical' },
        { id: 'brakes', label: 'Braking System' },
        { id: 'tires', label: 'Tires & Wheels' },
        { id: 'fluids', label: 'Fluids & Filters' },
    ];

    categories.forEach(cat => {
        const items = inspection.categories[cat.id];
        if (items && items.length > 0) {
            doc.fontSize(12).rect(doc.x, doc.y, 512, 20).fill('#f1f5f9');
            doc.fillColor('#475569').text(cat.label.toUpperCase(), doc.x + 5, doc.y + 5);
            doc.fillColor('black').moveDown(1.2);

            items.forEach(item => {
                const statusColor = item.status === 'Green' ? '#10b981' : item.status === 'Yellow' ? '#f59e0b' : '#ef4444';
                doc.fontSize(10).text(`${item.name}: `, { continued: true });
                doc.fillColor(statusColor).text(item.status.toUpperCase(), { continued: true });
                doc.fillColor('black').text(` - ${item.notes || 'No issues noted'}`);
            });
            doc.moveDown();
        }
    });

    doc.moveDown();
    doc.fontSize(12).text('SUMMARY & RECOMMENDATIONS', { underline: true });
    doc.fontSize(10).text(inspection.overallSummary || 'Vehicle appears to be in good operating condition based on selected checks.');

    doc.end();
    doc.pipe(res);
});

module.exports = {

  downloadInvoicePDF,
  exportCustomersExcel,
  exportInventoryExcel,
  exportRevenueExcel,
  exportProductivityExcel,
  exportWorkshopExcel,
  exportExpensesExcel,
  exportPayrollExcel,
  exportTransactionsExcel,
  exportCashReportsExcel,
  downloadCashReceiptPDF,
  downloadInspectionPDF,
};



