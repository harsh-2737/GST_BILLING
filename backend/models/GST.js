const moongose = require("mongoose");

const gstSchema = new moongose.Schema({
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
const GST = moongose.model("GST", gstSchema);
 module.exports=GST;