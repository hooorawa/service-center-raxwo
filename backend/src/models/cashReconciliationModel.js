const mongoose = require('mongoose');

const cashReconciliationSchema = mongoose.Schema(
  {
    registerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashRegister',
      required: true,
    },
    shiftOpenedAt: Date,
    shiftClosedAt: Date,
    openingBalance: Number,
    totalCashPayments: Number,
    totalCashIn: Number,
    totalCashOut: Number,
    totalRefunds: Number,
    expectedBalance: Number,
    actualBalance: Number,
    variance: Number,
    status: {
      type: String,
      enum: ['Balanced', 'Shortage', 'Excess'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const CashReconciliation = mongoose.model('CashReconciliation', cashReconciliationSchema);

module.exports = CashReconciliation;
