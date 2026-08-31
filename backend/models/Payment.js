const mongoose = require("mongoose")
const paymentschema = new mongoose.Schema(
    {
        paymentid:
        {
            type:number,
            required:true
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
            type:number,
            required:true
        }
    },
    {
        collection:"Payment"
    }
);

const Payment = mongoose.model("Payment",paymentschema);
module.exports= Payment;