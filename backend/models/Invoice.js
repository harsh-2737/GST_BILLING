const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        invoiceid: {
            type: Number,
            required: [true, "Invoice ID is required"],
            unique: true,
            min: [1, "Invoice ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "Invoice ID must be an integer"
            }
        },

        customer: {
            customerid: {
                type: Number,
                required: [true, "Customer ID is required"],
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
                trim: true,
                lowercase: true,
                match: [
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    "Please enter a valid customer email"
                ]
            },

            phone_no: {
                type: String,
                trim: true,
                match: [
                    /^[6-9]\d{9}$/,
                    "Customer phone number must be a valid 10-digit Indian number"
                ]
            }
        },

        user: {
            userid: {
                type: Number,
                required: [true, "User ID is required"],
                min: [1, "User ID must be greater than 0"],
                validate: {
                    validator: Number.isInteger,
                    message: "User ID must be an integer"
                }
            },

            name: {
                type: String,
                required: [true, "User name is required"],
                trim: true,
                minlength: [2, "User name must be at least 2 characters"],
                maxlength: [100, "User name cannot exceed 100 characters"]
            },

            email: {
                type: String,
                trim: true,
                lowercase: true,
                match: [
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    "Please enter a valid user email"
                ]
            }
        },

        invoicedate: {
            type: Date,
            required: [true, "Invoice date is required"],
            default: Date.now
        },

        items: {
            type: [
                {
                    productid: {
                        type: Number,
                        required: [true, "Product ID is required"],
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
                        min: [0, "Product quantity cannot be negative"],
                        validate: {
                            validator: Number.isInteger,
                            message: "Product quantity must be a whole number"
                        }
                    },

                    buyitem: {
                        type: Number,
                        required: [true, "Buy item quantity is required"],
                        min: [1, "Buy item quantity must be at least 1"],
                        validate: {
                            validator: Number.isInteger,
                            message: "Buy item quantity must be a whole number"
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
                }
            ],

            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Invoice must contain at least one product"
            }
        },

        totalamount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount cannot be negative"]
        },

        payment: {
            paymentid: {
                type: Number,
                min: [1, "Payment ID must be greater than 0"],
                validate: {
                    validator: Number.isInteger,
                    message: "Payment ID must be an integer"
                }
            },

            paymentamount: {
                type: Number,
                min: [0, "Payment amount cannot be negative"]
            },

            paymentstatus: {
                type: String,
                enum: {
                    values: ["Pending", "Paid", "Failed", "Refunded"],
                    message: "Invalid payment status"
                }
            },

            paymentdate: {
                type: Date
            },

            paymentmode: {
                type: String,
                enum: {
                    values: ["Cash", "UPI", "Card", "Bank Transfer"],
                    message: "Invalid payment mode"
                }
            }
        },

        status: {
            type: String,
            enum: {
                values: ["Draft", "Sent", "Paid", "Overdue"],
                message: "Invalid invoice status"
            },
            default: "Draft"
        }
    },
    {
        collection: "Invoice",
        timestamps: true
    }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;

