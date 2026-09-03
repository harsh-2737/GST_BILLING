const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userid: {
            type: Number,
            required: [true, "User ID is required"],
            unique: true,
            min: [1, "User ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "User ID must be an integer"
            }
        },

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
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
            trim: true,
            match: [
                /^[6-9]\d{9}$/,
                "Phone number must be a valid 10-digit Indian mobile number"
            ]
        },

        role: {
            type: String,
            enum: {
                values: ["Admin", "User"],
                message: "Role must be Admin or User"
            },
            default: "User"
        }
    },
    {
        collection: "User",
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;