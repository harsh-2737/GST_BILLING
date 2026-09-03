const GSTRepository = require('../repositories/GSTRepository');

const createGST = async (req, res) => {

    try {

        const gst = await GSTRepository.createGST(req.body);

        res.status(201).json(gst);

    }
    catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const getAllGST = async (req, res) => {

    try {

        const gstList = await GSTRepository.getAllGST();

        res.status(200).json(gstList);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getGSTById = async (req, res) => {

    try {

        const gstRecord = await GSTRepository.getGSTById(req.params.id);

        if (!gstRecord) {

            return res.status(404).json({
                message: "GST record not found"
            });

        }

        res.status(200).json(gstRecord);

    }
    catch (error) {

        res.status(404).json({
            message: error.message
        });

    }

};

const updateGST = async (req, res) => {

    try {

        const gst = await GSTRepository.updateGST(req.params.id, req.body);

        if (!gst) {

            return res.status(404).json({
                message: "GST record not found"
            });

        }

        res.status(200).json(gst);

    }
    catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const deleteGST = async (req, res) => {

    try {

        const gst = await GSTRepository.deleteGST(req.params.id);

        if (!gst) {

            return res.status(404).json({
                message: "GST record not found"
            });

        }

        res.status(200).json(gst);

    }
    catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {

    createGST,
    getAllGST,
    getGSTById,
    updateGST,
    deleteGST

};