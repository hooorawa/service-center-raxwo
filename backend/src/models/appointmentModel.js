const mongoose = require('mongoose');

const appointmentServiceSchema = mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const appointmentPartSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  batchNumber: String,
});

const appointmentSchema = mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    mileage: {
      type: Number,
    },
    fuelLevel: {
      type: String, // e.g., 'E', '1/4', '1/2', '3/4', 'F'
    },
    bayNumber: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {

      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Scheduled',
        'Waiting',
        'Assigned',
        'In Service',
        'Waiting Parts',
        'Quality Check',
        'Ready For Delivery',
        'Delivered',
        'Cancelled'
      ],

      default: 'Pending',
    },
    services: [appointmentServiceSchema],
    parts: [appointmentPartSchema],
    billing: {
      serviceTotal: { type: Number, default: 0 },
      partsTotal: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    notes: {
      type: String,
    },
    diagnostics: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate appointment number if not present
appointmentSchema.pre('save', async function () {
  if (!this.appointmentNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentNumber = `SVC-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
