const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    Role: {
        type: String,
        enum: ["Admin", "User"],
        default: "User"
    }
}, {
    collection: "User"
});

const User = mongoose.model("User", userSchema);

module.exports = User;