const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productid: {
            type: Number,
            required: [true, "Product ID is required"],
            unique: true,
            min: [1, "Product ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "Product ID must be an integer"
            }
        },

        productname: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters"],
            maxlength: [150, "Product name cannot exceed 150 characters"]
        },

        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
            min: [0, "Quantity cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Product quantity must be a whole number"
            }
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Product price cannot be negative"]
        },

        hsncode: {
            type: String,
            required: [true, "HSN code is required"],
            trim: true,
            match: [
                /^\d{4,8}$/,
                "HSN code must contain 4 to 8 digits"
            ]
        },

        gst: {
            gstid: {
                type: Number,
                required: [true, "GST ID is required"],
                min: [1, "GST ID must be greater than 0"],
                validate: {
                    validator: Number.isInteger,
                    message: "GST ID must be an integer"
                }
            },

            gsttype: {
                type: String,
                required: [true, "GST type is required"],
                trim: true,
                enum: {
                    values: ["CGST", "SGST", "IGST"],
                    message: "GST type must be CGST, SGST or IGST"
                }
            },

            gstrate: {
                type: Number,
                required: [true, "GST rate is required"],
                min: [0, "GST rate cannot be negative"],
                max: [100, "GST rate cannot exceed 100"]
            },

            gstin: {
                type: String,
                required: [true, "GSTIN is required"],
                trim: true,
                uppercase: true,
                minlength: [15, "GSTIN must be exactly 15 characters"],
                maxlength: [15, "GSTIN must be exactly 15 characters"],
                match: [
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
                    "Please enter a valid GSTIN"
                ]
            }
        }
    },
    {
        collection: "Product",
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;