const Customer = require("../models/Customer");

const createCustomer = async (customerData) => {
    try{

        if(!customerData.customerid || !customerData.name || !customerData.email || !customerData.password || !customerData.phone_no)
        {
            throw new Error("Missing required fields");
        }
        const customer = await Customer.insertOne({
            customerid: customerData.customerid,
            name: customerData.name,
            email: customerData.email,
            password: customerData.password,
            phone_no: customerData.phone_no
        }); 
        return customer.toJSON();
    }
    catch (error){
        throw new Error("Error creating customer: " + error.message);
    }
};

const getAllCustomers = async () => {
    try{
        const customers = await Customer.find();
        return customers;
    }
    catch (error){
        throw new Error("Error retrieving customers: " + error.message);
    }
};

const getCustomerById = async (id) => {
    try{
        const customer1 =await Customer.findOne({ customerid: id });
        if (!customer1) {
            throw new Error("Customer not found");
        }   
    return customer1;
    }
    catch (error){
        throw new Error("Error retrieving customer: " + error.message);     
    }
};

const updateCustomer = async (id, updateData) =>
{
    try{
        const customer = await getCustomerById(id);
        if (!customer)
        {
            throw new Error("Customer not found");
        }
        if(updateData.customerid)
        {
            customer.customerid = updateData.customerid;
        }
        if(updateData.name)
        {
            customer.name = updateData.name;
        }
        if(updateData.email)
        {
            customer.email = updateData.email;
        }
        if(updateData.password)
        {
            customer.password = updateData.password;
        }
        if(updateData.phone_no)
        {
            customer.phone_no = updateData.phone_no;
        }

        await customer.save();
        return customer.toJSON();
    }
    catch (error){
        throw new Error("Error updating customer: " + error.message);
    }
};

const deleteCustomer = async (id) => {
    try{
        const customer = await getCustomerById(id); 
        if (!customer) {
            throw new Error("Customer not found");
        }
        await Customer.deleteOne({ customerid: id });
        return { message: "Customer deleted successfully" };
    }
    catch (error){
        throw new Error("Error deleting customer: " + error.message);
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};