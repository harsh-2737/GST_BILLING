const express = require("express");
const router = express.Router();
const { createInvoice, getAllInvoices, getInvoiceById, getInvoicesByCustomer, updateInvoice, deleteInvoice } = require("../controllers/InvoiceController");

router.post("/create", createInvoice);
router.get("/", getAllInvoices);
router.get("/customer/:customerId", getInvoicesByCustomer);
router.get("/:id", getInvoiceById);
router.put("/update/:id", updateInvoice);
router.delete("/delete/:id", deleteInvoice);

module.exports = router;
