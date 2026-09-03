
const InvoiceRepository = require("../repositories/InvoiceRepository");

exports.createInvoice = async (req, res) => {
    try {
        const result =
            await InvoiceRepository.createInvoice(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: result
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice =
            await InvoiceRepository.getInvoiceById(
                req.params.id
            );

        res.status(200).json({
            success: true,
            data: invoice
        });

    } catch (error) {
        if (
            error.message.includes(
                "Invoice not found"
            )
        ) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const invoices =
            await InvoiceRepository.getAllInvoices();

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

exports.getInvoicesByCustomer = async (req, res) => {
    try {
        const invoices =
            await InvoiceRepository.getInvoicesByCustomer(
                req.params.customerId
            );

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

exports.updateInvoice = async (req, res) => {
    try {
        const result =
            await InvoiceRepository.updateInvoice(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: result
        });

    } catch (error) {
        if (
            error.message.includes(
                "Invoice not found"
            )
        ) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const result =
            await InvoiceRepository.deleteInvoice(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        if (
            error.message.includes(
                "Invoice not found"
            )
        ) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
