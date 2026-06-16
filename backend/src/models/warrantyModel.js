const mongoose = require('mongoose');

const warrantyClaimSchema = mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    claimType: {
      type: String, // Description of part or service under warranty
      required: true,
    },
    claimDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const WarrantyClaim = mongoose.model('WarrantyClaim', warrantyClaimSchema);

module.exports = WarrantyClaim;
