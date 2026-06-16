const mongoose = require('mongoose');

const pettyCashFundSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Main Petty Cash',
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    branch: {
      type: String,
      default: 'Main',
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const PettyCashFund = mongoose.model('PettyCashFund', pettyCashFundSchema);

module.exports = PettyCashFund;
