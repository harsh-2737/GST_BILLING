const express = require("express");
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } = require("../controllers/CustomerController");

router.post("/create", createCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/update/:id", updateCustomer);
router.delete("/delete/:id", deleteCustomer);

module.exports = router;