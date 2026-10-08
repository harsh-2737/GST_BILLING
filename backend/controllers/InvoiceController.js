const InvoiceRepository = require("../repositories/InvoiceRepository");

exports.createInvoice = async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            user: {
                userid: req.user.userid,
                name: req.user.name,
                email: req.user.email
            }
        };

        const result = await InvoiceRepository.createInvoice(invoiceData);

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.getInvoiceById(
            req.params.id,
            req.user.userid
        );

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        if (error.message.includes("Invoice not found")) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
                error: "Invoice not found"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await InvoiceRepository.getAllInvoices(
            req.user.userid
        );

        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

exports.getInvoicesByCustomer = async (req, res) => {
    try {
        const invoices = await InvoiceRepository.getInvoicesByCustomer(
            req.params.customerId,
            req.user.userid
        );

        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            user: {
                userid: req.user.userid,
                name: req.user.name,
                email: req.user.email
            }
        };

        const result = await InvoiceRepository.updateInvoice(
            req.params.id,
            updateData,
            req.user.userid
        );

        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: result
        });
    } catch (error) {
        if (error.message.includes("Invoice not found")) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
                error: "Invoice not found"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const result = await InvoiceRepository.deleteInvoice(
            req.params.id,
            req.user.userid
        );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error.message.includes("Invoice not found")) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
                error: "Invoice not found"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};
