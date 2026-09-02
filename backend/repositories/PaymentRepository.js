const Payment = require("../models/Payment");

const createPayment = async (paymentData) => {
    try {
        if (
            !paymentData.paymentid ||
            !paymentData.paymentmode ||
            !paymentData.paymentamount ||
            !paymentData.paymentdate 
            // !paymentData.invoiceid
        ) {
            throw new Error("Missing required fields");
        }

        const payment = await Payment.insertOne({
            paymentid: paymentData.paymentid,
            paymentmode: paymentData.paymentmode,
            paymentamount: paymentData.paymentamount,
            paymentdate: paymentData.paymentdate
            // invoiceid: paymentData.invoiceid
        });

        return payment.toJSON();

    } catch (error) {
        throw new Error("Error creating Payment: " + error.message);
    }
};


const getAllPayments = async () => {
    try {
        const paymentList = await Payment.find();
        return paymentList;

    } catch (error) {
        throw new Error("Error fetching Payment records: " + error.message);
    }
};


const getPaymentById = async (id) => {
    try {
        const paymentRecord = await Payment.findOne({ paymentid: id });

        if (!paymentRecord) {
            throw new Error("Payment record not found");
        }

        return paymentRecord;

    } catch (error) {
        throw new Error(
            "Error retrieving Payment record: " + error.message
        );
    }
};


const updatePayment = async (id, paymentData) => {
    try {
        const payment = await getPaymentById(id);

        if (paymentData.paymentid) {
            payment.paymentid = paymentData.paymentid;
        }

        if (paymentData.paymentmode) {
            payment.paymentmode = paymentData.paymentmode;
        }

        if (paymentData.paymentamount) {
            payment.paymentamount = paymentData.paymentamount;
        }

        if (paymentData.paymentdate) {
            payment.paymentdate = paymentData.paymentdate;
        }

        // if (paymentData.invoiceid) {
        //     payment.invoiceid = paymentData.invoiceid;
        // }

        await payment.save();

        return payment.toJSON();

    } catch (error) {
        throw new Error(
            "Error updating Payment record: " + error.message
        );
    }
};


const deletePayment = async (id) => {
    try {
        const payment = await getPaymentById(id);

        if (!payment) {
            throw new Error("Payment record not found");
        }

        await Payment.deleteOne({ paymentid: id });

        return {
            message: "Payment record deleted successfully"
        };

    } catch (error) {
        throw new Error(
            "Error deleting Payment record: " + error.message
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