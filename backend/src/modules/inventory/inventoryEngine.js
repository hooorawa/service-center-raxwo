const Product = require('../../models/productModel');
const InventoryMovement = require('../../models/inventoryMovementModel');
const mongoose = require('mongoose');

/**
 * Inventory Engine for Automotive ERP
 * Handles atomic stock updates and movement logging.
 */

const deductStock = async (productId, quantity, type, referenceId, user = null, notes = '') => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Product not found');
    
    if (product.stockLevel < quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockLevel}, Requested: ${quantity}`);
    }

    const beforeStock = product.stockLevel;
    product.stockLevel -= quantity;
    const afterStock = product.stockLevel;
    
    await product.save({ session });

    await InventoryMovement.create([{
      product: productId,
      type,
      quantity,
      beforeStock,
      afterStock,
      referenceId,
      user,
      notes
    }], { session });

    await session.commitTransaction();
    return product;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const addStock = async (productId, quantity, type, referenceId, user = null, notes = '') => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Product not found');
    
    const beforeStock = product.stockLevel;
    product.stockLevel += quantity;
    const afterStock = product.stockLevel;
    
    await product.save({ session });

    await InventoryMovement.create([{
      product: productId,
      type,
      quantity,
      beforeStock,
      afterStock,
      referenceId,
      user,
      notes
    }], { session });

    await session.commitTransaction();
    return product;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  deductStock,
  addStock
};
