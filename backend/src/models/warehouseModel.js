const mongoose = require('mongoose');

const warehouseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
    },
    manager: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
