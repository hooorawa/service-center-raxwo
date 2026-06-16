const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vin: {
      type: String,
      unique: true,
      sparse: true,
    },
    engineNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Other'],
      default: 'Petrol',
    },
    color: {
      type: String,
    },
    mileage: {
      type: Number,
      default: 0,
    },
    documents: [
      {
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
