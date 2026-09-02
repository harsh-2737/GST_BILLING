const mongoose = require("mongoose")
const paymentschema = new mongoose.Schema(
    {
        paymentid:
        {
            type:Number,
            required:true
        },
        invoiceid:
        {
            type:String,
            required:true,
            ref:"Invoice"
        },
        paymentstatus:
        {
            type:String
        },
        paymentdate:
        {
            type:Date,
            required:true
        },
        paymentmode:
        {
            type:String,
            required:true
        },
        paymentamount:
        {
            type:Number,
            required:true
        }
    },
    {
        collection:"Payment"
    }
);

const Payment = mongoose.model("Payment",paymentschema);
module.exports= Payment;