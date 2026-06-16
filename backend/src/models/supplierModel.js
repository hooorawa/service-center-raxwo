const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
