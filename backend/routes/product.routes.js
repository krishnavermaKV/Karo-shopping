
const express = require("express");
const router = express.Router();

const {
    addProduct,
    increaseStock,
    getProducts,
    getProductById,
    updateProduct,
    getStockHistory
} = require("../controllers/product.controller");

const { verifyAdmin } = require("../middleware/auth.middleware");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post("/", verifyAdmin, addProduct);
router.patch("/:id/stock", verifyAdmin, increaseStock);
router.put("/:id", verifyAdmin, updateProduct);
router.get("/:id/history", verifyAdmin, getStockHistory);

module.exports = router;
