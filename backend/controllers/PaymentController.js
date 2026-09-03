const PaymentRepository = require('../repositories/PaymentRepository');

const createPayment = async (req,res) =>

{

    try

    {

        const payment= await PaymentRepository.createPayment(req.body);

        res.status(201).json(payment);

    }

    catch(error)

    {

        res.status(400).json({

            message: error.message

        });

    }

};

const getAllPayments = async (req,res)=> {

    try{

        const payments = await PaymentRepository.getAllPayments();

        res.status(200).json(payments);

    }

    catch(error){

        res.status(500).json({error: error.message});

    }

};

const getPaymentById = async (req,res)=>{

    try{

        const payment = await PaymentRepository.getPaymentById(req.params.id);

        if (!payment) {

            return res.status(404).json({
                error: "Payment not found"
            });

        }

        res.status(200).json(payment);

    }

    catch(error){

        res.status(404).json({error:error.message});

    }

};

const updatePayment = async (req,res) =>

{

    try{

        const payment= await PaymentRepository.updatePayment(
            req.params.id,
            req.body
        );

        if (!payment) {

            return res.status(404).json({
                error: "Payment not found"
            });

        }

        res.status(200).json(payment);

    }

    catch(error){

        res.status(400).json({error : error.message});

    }

};

const deletePayment = async (req,res) =>

{

    try{

        const payment = await PaymentRepository.deletePayment(req.params.id);

        if (!payment) {

            return res.status(404).json({
                error: "Payment not found"
            });

        }

        res.status(200).json(payment);

    }

    catch(error){

        res.status(400).json({error : error.message});

    }

};

module.exports = {

    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment

};