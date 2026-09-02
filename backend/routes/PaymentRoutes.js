const express = require("express");
const router = express.Router();
const { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } = require("../controllers/PaymentController");

router.post("/create", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/update/:id", updatePayment);
router.delete("/delete/:id", deletePayment);

module.exports = router;