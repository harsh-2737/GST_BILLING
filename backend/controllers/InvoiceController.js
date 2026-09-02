const InvoiceRepository = require("../repositories/InvoiceRepository");

// Create a new invoice
exports.createInvoice = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.create(req.body);
        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.getById(req.params.id);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }
        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await InvoiceRepository.getAll();
        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get invoices by customer ID
exports.getInvoicesByCustomer = async (req, res) => {
    try {
        const invoices = await InvoiceRepository.getByCustomerId(req.params.customerId);
        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.update(req.params.id, req.body);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: invoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.delete(req.params.id);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Invoice deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
