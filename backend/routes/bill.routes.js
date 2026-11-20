
const express = require("express");
const router = express.Router();

const {
    createBill,
    getAllBills,
    getBillById
} = require("../controllers/bill.controller");

const { verifyAdmin } = require("../middleware/auth.middleware");

router.post("/", verifyAdmin, createBill);
router.get("/", verifyAdmin, getAllBills);
router.get("/:id", verifyAdmin, getBillById);

module.exports = router;
