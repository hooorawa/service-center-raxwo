const mongoose = require('mongoose');

const jobCardSchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    status: {
      type: String,
      default: 'Waiting',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    bayNumber: {
      type: String,
    },
    technician: {

      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    inspectionResults: {
      type: String,
    },
    tasks: [
      {
        description: String,
        status: {
          type: String,
          enum: ['Pending', 'Completed'],
          default: 'Pending',
        },
      },
    ],
    partsUsed: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        price: Number,
      },
    ],
    estimatedCompletion: {
      type: Date,
    },
    inspectionResults: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
    },

  },
  {
    timestamps: true,
  }
);

const JobCard = mongoose.model('JobCard', jobCardSchema);

module.exports = JobCard;
