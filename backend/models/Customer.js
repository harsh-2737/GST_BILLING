const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema(
    {
        customerid: {
            type: Number,
            required: [true, "Customer ID is required"],
            unique: true,
            min: [1, "Customer ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "Customer ID must be an integer"
            }
        },
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
            minlength: [2, "Customer name must be at least 2 characters"],
            maxlength: [100, "Customer name cannot exceed 100 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            maxlength: [100, "Password cannot exceed 100 characters"]
        },
        phone_no: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
            match: [
                /^[6-9]\d{9}$/,
                "Phone number must be a valid 10-digit Indian mobile number"
            ]
        }
    },
    {
        collection: "Customer",
        timestamps: true
    }
);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;