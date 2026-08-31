const mongoose = require("mongoose");

const gstSchema = new mongoose.Schema({
    gstid: {
        type: String,
        required: true,
        unique: true
    },
    gstrate: {
        type: Number,
        required: true
    },
    gsttype: {
        type: String,
        enum: ["CGST", "SGST", "IGST"],
        required: true
    },
    gstin: {
        type: String,
        required: true,
        unique: true,
        minlength: 15,
        maxlength: 15
    }},
    {
    collection: "GST"
    });
const GST = mongoose.model("GST", gstSchema);
 module.exports=GST;