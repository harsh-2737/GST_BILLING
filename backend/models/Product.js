const mongoose = require("mongoose")
const productSchema = new mongoose.Schema(
    {
        productid:
        {
            type:Number,
            required: true,
            unique: true
        },

        productname:{
            type:String,
            required: true
        },
        quantity:
        {
            type:Number,
            required: true
        },
        price:
        {
            type:Number,
            required:true
        },
        hsncode:
        {
            type:String,
            required:true
        },
        gstid:
        {
            type:String,
            required:true,
            ref:"GST"
        }
    },
    {
        collection: "Product"
    }

);

const Product = mongoose.model("product",productSchema)
module.exports=Product;
