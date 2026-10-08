const CustomerRepository = require("../repositories/CustomerRepository");

const createCustomer = async (req, res) => {
    if (!req.body.address) {
        return res.status(400).json({
            message: "Customer address is required",
            error: "Customer address is required"
        });
    }

    try {
        const customer = await CustomerRepository.createCustomer({
            ...req.body,
            ownerid: req.user.userid
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({
            message: error.message,
            error: error.message
        });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerRepository.getAllCustomers(req.user.userid);
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({
            message: error.message,
            error: error.message
        });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerRepository.getCustomerById(req.params.id, req.user.userid);
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
                error: "Customer not found"
            });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(404).json({
            message: error.message,
            error: error.message
        });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customer = await CustomerRepository.updateCustomer(
            req.params.id,
            req.body,
            req.user.userid
        );

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
                error: "Customer not found"
            });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(404).json({
            message: error.message,
            error: error.message
        });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const result = await CustomerRepository.deleteCustomer(req.params.id, req.user.userid);
        if (!result) {
            return res.status(404).json({
                message: "Customer not found",
                error: "Customer not found"
            });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message,
            error: error.message
        });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};