const Customer = require("../models/Customer");
const Counter = require("../models/Counter");

const getNextCustomerId = async () => {

    const counter = await Counter.findOneAndUpdate(
        { _id: "customerid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};


const createCustomer = async (customerData) => {

    try {

        if (
            !customerData.name ||
            !customerData.email ||
            !customerData.password ||
            !customerData.phone_no
        ) {
            throw new Error("Missing required fields");
        }

        const existingEmail = await Customer.findOne({
            email: customerData.email
        });

        if (existingEmail) {
            throw new Error("Email already exists");
        }

        const existingPhone = await Customer.findOne({
            phone_no: customerData.phone_no
        });

        if (existingPhone) {
            throw new Error("Phone number already exists");
        }

        const customerid = await getNextCustomerId();

        const customer = await Customer.create({
            customerid: customerid,
            name: customerData.name,
            email: customerData.email,
            password: customerData.password,
            phone_no: customerData.phone_no
        });

        return customer.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error creating customer: " + error.message
        );

    }

};


const getAllCustomers = async () => {

    try {

        const customers = await Customer.find();

        return customers;

    }
    catch (error) {

        throw new Error(
            "Error retrieving customers: " + error.message
        );

    }

};


const getCustomerById = async (id) => {

    try {

        const customer = await Customer.findOne({
            customerid: Number(id)
        });

        if (!customer) {

            throw new Error("Customer not found");

        }

        return customer;

    }
    catch (error) {

        throw new Error(
            "Error retrieving customer: " + error.message
        );

    }

};


const updateCustomer = async (id, updateData) => {

    try {

        const customer = await Customer.findOne({
            customerid: Number(id)
        });

        if (!customer) {

            throw new Error("Customer not found");

        }

        if (updateData.name !== undefined) {

            customer.name = updateData.name;

        }

        if (updateData.email !== undefined) {

            const existingEmail = await Customer.findOne({
                email: updateData.email,
                customerid: { $ne: customer.customerid }
            });

            if (existingEmail) {

                throw new Error("Email already exists");

            }

            customer.email = updateData.email;

        }

        if (updateData.password !== undefined) {

            customer.password = updateData.password;

        }

        if (updateData.phone_no !== undefined) {

            const existingPhone = await Customer.findOne({
                phone_no: updateData.phone_no,
                customerid: { $ne: customer.customerid }
            });

            if (existingPhone) {

                throw new Error("Phone number already exists");

            }

            customer.phone_no = updateData.phone_no;

        }

        await customer.save();

        return customer.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error updating customer: " + error.message
        );

    }

};


const deleteCustomer = async (id) => {

    try {

        const customer = await Customer.findOneAndDelete({
            customerid: Number(id)
        });

        if (!customer) {

            throw new Error("Customer not found");

        }

        return {
            message: "Customer deleted successfully"
        };

    }
    catch (error) {

        throw new Error(
            "Error deleting customer: " + error.message
        );

    }

};


module.exports = {

    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer

};