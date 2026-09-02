const Invoice = require("../models/Invoice");

class InvoiceRepository {
    // Create a new invoice
    async create(invoiceData) {
        try {
            const invoice = new Invoice(invoiceData);
            return await invoice.save();
        } catch (error) {
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }

    // Get invoice by ID
    async getById(invoiceId) {
        try {
            return await Invoice.findOne({ invoiceid: invoiceId })
                .populate("customerid")
                .populate("userid")
                .populate("paymentid")
                .populate("items.productid");
        } catch (error) {
            throw new Error(`Error fetching invoice: ${error.message}`);
        }
    }

    // Get all invoices
    async getAll() {
        try {
            return await Invoice.find()
                .populate("customerid")
                .populate("userid")
                .populate("paymentid")
                .populate("items.productid");
        } catch (error) {
            throw new Error(`Error fetching invoices: ${error.message}`);
        }
    }

    // Get invoices by customer ID
    async getByCustomerId(customerId) {
        try {
            return await Invoice.find({ customerid: customerId })
                .populate("customerid")
                .populate("userid")
                .populate("paymentid")
                .populate("items.productid");
        } catch (error) {
            throw new Error(`Error fetching invoices for customer: ${error.message}`);
        }
    }

    // Update invoice
    async update(invoiceId, updateData) {
        try {
            return await Invoice.findOneAndUpdate(
                { invoiceid: invoiceId },
                updateData,
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating invoice: ${error.message}`);
        }
    }

    // Delete invoice
    async delete(invoiceId) {
        try {
            return await Invoice.findOneAndDelete({ invoiceid: invoiceId });
        } catch (error) {
            throw new Error(`Error deleting invoice: ${error.message}`);
        }
    }
}

module.exports = new InvoiceRepository();
