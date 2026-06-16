const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    serviceCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
