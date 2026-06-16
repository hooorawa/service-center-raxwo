const asyncHandler = require('express-async-handler');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const Supplier = require('../../models/supplierModel');
const Purchase = require('../../models/purchaseModel');
const InventoryMovement = require('../../models/inventoryMovementModel');

// @desc    Add a product
// @route   POST /api/inventory/products
// @access  Private/Admin
const addProduct = asyncHandler(async (req, res) => {
  const { name, sku, barcode, category, sellingPrice, costPrice, stockLevel, reorderLevel, unit, supplier, batchNumber, expiryDate } = req.body;

  const productExists = await Product.findOne({ sku });

  if (productExists) {
    res.status(400);
    throw new Error('Product with this SKU already exists');
  }

  const product = await Product.create({
    name,
    sku,
    barcode,
    category,
    sellingPrice,
    costPrice,
    stockLevel,
    reorderLevel,
    unit,
    supplier,
    batchNumber,
    expiryDate
  });

  res.status(201).json(product);
});

// @desc    Get all products
// @route   GET /api/inventory/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate('supplier', 'name')
    .sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Update product
// @route   PUT /api/inventory/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.sku = req.body.sku || product.sku;
    product.barcode = req.body.barcode || product.barcode;
    product.category = req.body.category || product.category;
    product.sellingPrice = req.body.sellingPrice !== undefined ? req.body.sellingPrice : product.sellingPrice;
    product.costPrice = req.body.costPrice !== undefined ? req.body.costPrice : product.costPrice;
    product.stockLevel = req.body.stockLevel !== undefined ? req.body.stockLevel : product.stockLevel;
    product.reorderLevel = req.body.reorderLevel !== undefined ? req.body.reorderLevel : product.reorderLevel;
    product.unit = req.body.unit || product.unit;
    product.supplier = req.body.supplier || product.supplier;
    product.batchNumber = req.body.batchNumber || product.batchNumber;
    product.expiryDate = req.body.expiryDate || product.expiryDate;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get inventory movements
// @route   GET /api/inventory/movements/:productId
// @access  Private/Admin
const getInventoryMovements = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const filter = productId ? { product: productId } : {};
  const movements = await InventoryMovement.find(filter)
    .populate('product', 'name sku')
    .sort({ createdAt: -1 });
  res.json(movements);
});

// @desc    Delete product
// @route   DELETE /api/inventory/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product stock (Manual adjustment)
// @route   PUT /api/inventory/products/:id/stock
// @access  Private/Admin
const updateStock = asyncHandler(async (req, res) => {
  const { stockLevel } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.stockLevel = stockLevel;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// Supplier Controllers
// @desc    Add a supplier
// @route   POST /api/inventory/suppliers
// @access  Private/Admin
const addSupplier = asyncHandler(async (req, res) => {
  const { name, contactPerson, phone, email, address } = req.body;
  const supplier = await Supplier.create({
    name,
    contactPerson,
    phone,
    email,
    address,
  });
  res.status(201).json(supplier);
});

// @desc    Get all suppliers
// @route   GET /api/inventory/suppliers
// @access  Private/Admin
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({});
  res.json(suppliers);
});

// @desc    Update supplier
// @route   PUT /api/inventory/suppliers/:id
// @access  Private/Admin
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (supplier) {
    supplier.name = req.body.name || supplier.name;
    supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.email = req.body.email || supplier.email;
    supplier.address = req.body.address || supplier.address;
    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Delete supplier
// @route   DELETE /api/inventory/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (supplier) {
    await supplier.deleteOne();
    res.json({ message: 'Supplier removed' });
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// Purchase Controllers
// @desc    Create a purchase order
// @route   POST /api/inventory/purchases
// @access  Private/Admin
const createPurchase = asyncHandler(async (req, res) => {
  const { supplier, items, totalAmount } = req.body;
  const purchase = await Purchase.create({
    supplier,
    items,
    totalAmount,
  });

  // Increment stock levels for products in the purchase order
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stockLevel += item.quantity;
      await product.save();
    }
  }

  res.status(201).json(purchase);
});

// @desc    Get all purchase orders
// @route   GET /api/inventory/purchases
// @access  Private/Admin
const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({}).populate('supplier', 'name').populate('items.product', 'name');
  res.json(purchases);
});

// @desc    Delete purchase order
// @route   DELETE /api/inventory/purchases/:id
// @access  Private/Admin
const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (purchase) {
    await purchase.deleteOne();
    res.json({ message: 'Purchase record removed' });
  } else {
    res.status(404);
    throw new Error('Purchase record not found');
  }
});

// Category Controllers
// @desc    Add a category
// @route   POST /api/inventory/categories
// @access  Private/Admin
const addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json(category);
});

// @desc    Get all categories
// @route   GET /api/inventory/categories
// @access  Private/Admin
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

// @desc    Run Procurement Audit & Generate Auto-POs
// @route   POST /api/inventory/procurement/audit
// @access  Private/Admin
const runProcurementAudit = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stockLevel', '$reorderLevel'] },
    status: 'Active'
  });

  if (lowStockProducts.length === 0) {
    return res.json({ message: 'No low stock items found. Procurement not required.', poCount: 0 });
  }

  // Group by supplier
  const supplierGroups = {};
  lowStockProducts.forEach(product => {
    if (product.supplier) {
      if (!supplierGroups[product.supplier]) {
        supplierGroups[product.supplier] = [];
      }
      supplierGroups[product.supplier].push(product);
    }
  });

  const generatedPOs = [];
  for (const supplierId in supplierGroups) {
    const products = supplierGroups[supplierId];
    const items = products.map(p => ({
      product: p._id,
      quantity: (p.reorderLevel * 2) - p.stockLevel, // Reorder enough to get to 2x reorder level
      costPrice: p.costPrice
    }));

    const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);

    const po = await Purchase.create({
      supplier: supplierId,
      items,
      totalAmount,
      status: 'Ordered',
      isAutoGenerated: true
    });
    generatedPOs.push(po);
  }

  res.json({ 
    message: `Procurement audit complete. ${generatedPOs.length} Auto-POs generated.`, 
    poCount: generatedPOs.length,
    pos: generatedPOs 
  });
});

module.exports = {

  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  createPurchase,
  getPurchases,
  deletePurchase,
  addCategory,
  getCategories,
  getInventoryMovements,
  runProcurementAudit,
};

