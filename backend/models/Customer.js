const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerid: {
        type: String,
        required: true,
        unique: true
    },
    
        name: {
            type: String,
            requried:true,
        },
        email: { 
            type: String,
            required:true,
            unique:true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password:
        {
            type: String,
            required:true,
        },
        phone_no:
        {
            type: String,
            unique:true,
            required:true,
        }},
        {
            Collection: "Customer"
        });
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
