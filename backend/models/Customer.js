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
        ownerid: {
            type: Number,
            index: true
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
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },
        password: {
            type: String,
            minlength: [6, "Password must be at least 6 characters"],
            maxlength: [100, "Password cannot exceed 100 characters"],
            select: false
        },
        phone_no: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [
                /^[6-9]\d{9}$/,
                "Phone number must be a valid 10-digit Indian mobile number"
            ]
        },
        gstin: {
            type: String,
            trim: true,
            uppercase: true,
            validate: {
                validator: function(v) {
                    return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v);
                },
                message: "Please enter a valid 15-character GSTIN"
            }
        },
        address: {
            type: String,
            trim: true,
            minlength: [5, "Address must be at least 5 characters"],
            maxlength: [300, "Address cannot exceed 300 characters"]
        }
    },
    {
        collection: "Customer",
        timestamps: true,
        toJSON: {
            transform(_document, value) {
                delete value.password;
                return value;
            }
        }
    }
);

customerSchema.index({ ownerid: 1, email: 1 }, { unique: true });
customerSchema.index({ ownerid: 1, phone_no: 1 }, { unique: true });
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;