const CustomerRepository = require("../repositories/CustomerRepository");

const createCustomer = async (req, res) => {
    try {
        const customer = await CustomerRepository.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerRepository.getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerRepository.getCustomerById(req.params.id);
        res.status(200).json(customer);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customer = await CustomerRepository.updateCustomer(req.params.id, req.body);
        res.status(200).json(customer);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const result = await CustomerRepository.deleteCustomer(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};