const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceid: {
        type: String,
        required: true,
        unique: true
    },
    customerid: {
        type: String,
        required: true,
        ref: "Customer"
    },
    userid: {
        type: String,
        required: true,
        ref: "User"
    },
    paymentid: {
        type: String,
        ref: "Payment"
    },
    invoicedate: {
        type: Date,
        required: true,
        default: Date.now
    },
    totalamount: {
        type: Number,
        required: true
    },
    items: [
        {
            productid: {
                type: Number,
                required: true,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    status: {
        type: String,
        enum: ["Draft", "Sent", "Paid", "Overdue"],
        default: "Draft"
    }
}, {
    collection: "Invoice"
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
