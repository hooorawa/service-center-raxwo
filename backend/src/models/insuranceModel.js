const mongoose = require('mongoose');

const insurancePolicySchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    policyNumber: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    coverageDetails: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Cancelled'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const InsurancePolicy = mongoose.model('InsurancePolicy', insurancePolicySchema);

module.exports = InsurancePolicy;
