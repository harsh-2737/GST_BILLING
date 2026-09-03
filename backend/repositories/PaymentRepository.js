const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const Counter = require("../models/Counter");

const getNextPaymentId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "paymentid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};

const createPayment = async (paymentData) => {
    try {
        if (
            paymentData.invoiceid === undefined ||
            !paymentData.paymentmode ||
            paymentData.paymentamount === undefined
        ) {
            throw new Error(
                "Missing required fields"
            );
        }

        const invoice =
            await Invoice.findOne({
                invoiceid:
                    Number(paymentData.invoiceid)
            });

        if (!invoice) {
            throw new Error(
                "Invoice not found"
            );
        }

        if (
            invoice.payment &&
            invoice.payment.paymentid !== undefined
        ) {
            throw new Error(
                "Payment already exists for this invoice"
            );
        }

        const paymentid =
            await getNextPaymentId();

        const payment =
            await Payment.create({

                paymentid:
                    paymentid,

                invoiceid:
                    Number(paymentData.invoiceid),

                paymentstatus:
                    paymentData.paymentstatus ||
                    "Pending",

                paymentmode:
                    paymentData.paymentmode,

                paymentamount:
                    paymentData.paymentamount,

                paymentdate:
                    paymentData.paymentdate ||
                    Date.now()
            });

        invoice.payment = {

            paymentid:
                payment.paymentid,

            paymentamount:
                payment.paymentamount,

            paymentstatus:
                payment.paymentstatus,

            paymentdate:
                payment.paymentdate,

            paymentmode:
                payment.paymentmode
        };

        if (
            payment.paymentstatus ===
            "Paid"
        ) {
            invoice.status = "Paid";
        }

        await invoice.save();

        return payment.toJSON();

    }
    catch (error) {
        throw new Error(
            "Error creating Payment: " +
            error.message
        );
    }
};

const getAllPayments = async () => {
    try {
        const paymentList =
            await Payment.find();

        return paymentList;

    }
    catch (error) {
        throw new Error(
            "Error fetching Payment records: " +
            error.message
        );
    }
};

const getPaymentById = async (id) => {
    try {
        const paymentRecord =
            await Payment.findOne({
                paymentid: Number(id)
            });

        if (!paymentRecord) {
            throw new Error(
                "Payment record not found"
            );
        }

        return paymentRecord;

    }
    catch (error) {
        throw new Error(
            "Error retrieving Payment record: " +
            error.message
        );
    }
};

const updatePayment = async (id, paymentData) => {
    try {
        const payment =
            await Payment.findOne({
                paymentid: Number(id)
            });

        if (!payment) {
            throw new Error(
                "Payment record not found"
            );
        }

        const oldInvoiceId =
            payment.invoiceid;

        if (
            paymentData.paymentmode !==
            undefined
        ) {
            payment.paymentmode =
                paymentData.paymentmode;
        }

        if (
            paymentData.paymentamount !==
            undefined
        ) {
            payment.paymentamount =
                paymentData.paymentamount;
        }

        if (
            paymentData.paymentdate !==
            undefined
        ) {
            payment.paymentdate =
                paymentData.paymentdate;
        }

        if (
            paymentData.paymentstatus !==
            undefined
        ) {
            payment.paymentstatus =
                paymentData.paymentstatus;
        }

        if (
            paymentData.invoiceid !==
            undefined
        ) {
            const newInvoice =
                await Invoice.findOne({
                    invoiceid:
                        Number(paymentData.invoiceid)
                });

            if (!newInvoice) {
                throw new Error(
                    "Invoice not found"
                );
            }

            if (
                newInvoice.payment &&
                newInvoice.payment.paymentid !==
                    payment.paymentid
            ) {
                throw new Error(
                    "Payment already exists for this invoice"
                );
            }

            payment.invoiceid =
                Number(paymentData.invoiceid);
        }

        await payment.save();

        if (
            paymentData.invoiceid !==
                undefined &&
            oldInvoiceId !==
                payment.invoiceid
        ) {
            const oldInvoice =
                await Invoice.findOne({
                    invoiceid: oldInvoiceId
                });

            if (oldInvoice) {
                if (
                    oldInvoice.payment &&
                    oldInvoice.payment.paymentid ===
                        payment.paymentid
                ) {
                    oldInvoice.payment =
                        undefined;

                    if (
                        oldInvoice.status ===
                        "Paid"
                    ) {
                        oldInvoice.status =
                            "Draft";
                    }

                    await oldInvoice.save();
                }
            }
        }

        const invoice =
            await Invoice.findOne({
                invoiceid:
                    payment.invoiceid
            });

        if (invoice) {

            invoice.payment = {

                paymentid:
                    payment.paymentid,

                paymentamount:
                    payment.paymentamount,

                paymentstatus:
                    payment.paymentstatus,

                paymentdate:
                    payment.paymentdate,

                paymentmode:
                    payment.paymentmode
            };

            if (
                payment.paymentstatus ===
                "Paid"
            ) {
                invoice.status = "Paid";
            }
            else if (
                payment.paymentstatus ===
                    "Pending" ||
                payment.paymentstatus ===
                    "Failed"
            ) {
                invoice.status = "Draft";
            }
            else if (
                payment.paymentstatus ===
                "Refunded"
            ) {
                invoice.status = "Overdue";
            }

            await invoice.save();
        }

        return payment.toJSON();

    }
    catch (error) {
        throw new Error(
            "Error updating Payment record: " +
            error.message
        );
    }
};

const deletePayment = async (id) => {
    try {
        const payment =
            await Payment.findOne({
                paymentid: Number(id)
            });

        if (!payment) {
            throw new Error(
                "Payment record not found"
            );
        }

        const invoice =
            await Invoice.findOne({
                invoiceid:
                    payment.invoiceid
            });

        if (invoice) {
            if (
                invoice.payment &&
                invoice.payment.paymentid ===
                    payment.paymentid
            ) {
                invoice.payment =
                    undefined;

                if (
                    invoice.status ===
                    "Paid"
                ) {
                    invoice.status =
                        "Draft";
                }

                await invoice.save();
            }
        }

        await Payment.deleteOne({
            paymentid: Number(id)
        });

        return {
            message:
                "Payment record deleted successfully"
        };

    }
    catch (error) {
        throw new Error(
            "Error deleting Payment record: " +
            error.message
        );
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment
};