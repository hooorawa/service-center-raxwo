const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    barcode: {
      type: String,
      sparse: true,
    },
    category: {
      type: String, // Updated to string for enterprise flexibility
      required: true,
    },
    unit: {
      type: String,
      default: 'pcs',
    },
    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    stockLevel: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 5,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    batchNumber: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Discontinued'],
      default: 'Active',
    },
    trackBatch: {
      type: Boolean,
      default: false,
    },
    hasSerialNumbers: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
