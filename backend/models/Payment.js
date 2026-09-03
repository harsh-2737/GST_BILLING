const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        paymentid: {
            type: Number,
            required: [true, "Payment ID is required"],
            unique: true,
            min: [1, "Payment ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "Payment ID must be an integer"
            }
        },

        invoiceid: {
            type: Number,
            required: [true, "Invoice ID is required"],
            min: [1, "Invoice ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "Invoice ID must be an integer"
            }
        },

        paymentstatus: {
            type: String,
            required: [true, "Payment status is required"],
            enum: {
                values: ["Pending", "Paid", "Failed", "Refunded"],
                message: "Invalid payment status"
            },
            default: "Pending"
        },

        paymentdate: {
            type: Date,
            required: [true, "Payment date is required"],
            default: Date.now
        },

        paymentmode: {
            type: String,
            required: [true, "Payment mode is required"],
            enum: {
                values: ["Cash", "UPI", "Card", "Bank Transfer"],
                message: "Invalid payment mode"
            },
            trim: true
        },

        paymentamount: {
            type: Number,
            required: [true, "Payment amount is required"],
            min: [0, "Payment amount cannot be negative"]
        }
    },
    {
        collection: "Payment",
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;