const mongoose = require('mongoose');

const stockItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    serialNumber: {
      type: String,
      sparse: true,
    },
    batchNumber: {
      type: String,
      sparse: true,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Damaged', 'Sold', 'Transferred'],
      default: 'Available',
    },
    costAtPurchase: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const StockItem = mongoose.model('StockItem', stockItemSchema);

module.exports = StockItem;
