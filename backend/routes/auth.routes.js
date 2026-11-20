
const express = require("express");
const router = express.Router();

const {
    login,
    getMe
} = require("../controllers/auth.controller");

const { verifyAdmin } = require("../middleware/auth.middleware");

router.post("/login", login);
router.get("/me", verifyAdmin, getMe);

module.exports = router;
