const Customer = require("../models/Customer");
const Counter = require("../models/Counter");

const normalizeOptionalGSTIN = (gstin) => {
    if (gstin === undefined || gstin === null) return undefined;
    const trimmed = String(gstin).trim();
    return trimmed ? trimmed.toUpperCase() : undefined;
};

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
            !customerData.phone_no
        ) {
            throw new Error("Missing required fields");
        }

        const existingEmail = await Customer.findOne({
            email: customerData.email,
            ownerid: Number(customerData.ownerid)
        });

        if (existingEmail) {
            throw new Error("Email already exists");
        }

        const existingPhone = await Customer.findOne({
            phone_no: customerData.phone_no,
            ownerid: Number(customerData.ownerid)
        });

        if (existingPhone) {
            throw new Error("Phone number already exists");
        }

        const customerid = await getNextCustomerId();

        const customer = await Customer.create({
            customerid: customerid,
            ownerid: Number(customerData.ownerid),
            name: customerData.name,
            email: customerData.email,
            phone_no: customerData.phone_no,
            gstin: normalizeOptionalGSTIN(customerData.gstin),
            address: customerData.address
        });

        return customer.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error creating customer: " + error.message
        );

    }

};


const getAllCustomers = async (ownerid) => {

    try {

        const customers = await Customer.find({ ownerid: Number(ownerid) });

        return customers;

    }
    catch (error) {

        throw new Error(
            "Error retrieving customers: " + error.message
        );

    }

};


const getCustomerById = async (id, ownerid) => {

    try {

        const customer = await Customer.findOne({
            customerid: Number(id),
            ownerid: Number(ownerid)
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


const updateCustomer = async (id, updateData, ownerid) => {

    try {

        const customer = await Customer.findOne({
            customerid: Number(id),
            ownerid: Number(ownerid)
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
                customerid: { $ne: customer.customerid },
                ownerid: Number(ownerid)
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
                customerid: { $ne: customer.customerid },
                ownerid: Number(ownerid)
            });

            if (existingPhone) {

                throw new Error("Phone number already exists");

            }

            customer.phone_no = updateData.phone_no;

        }

        if (updateData.gstin !== undefined) {

            customer.gstin = normalizeOptionalGSTIN(updateData.gstin);

        }

        if (updateData.address !== undefined) {

            customer.address = updateData.address;

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


const deleteCustomer = async (id, ownerid) => {

    try {

        const customer = await Customer.findOneAndDelete({
            customerid: Number(id),
            ownerid: Number(ownerid)
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