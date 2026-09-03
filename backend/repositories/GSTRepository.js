const GST = require("../models/GST");
const Counter = require("../models/Counter");

const getNextGSTId = async () => {

    const counter = await Counter.findOneAndUpdate(
        { _id: "gstid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};


const createGST = async (gstData) => {

    try {

        if (
            gstData.gstrate === undefined ||
            !gstData.gsttype ||
            !gstData.gstin
        ) {
            throw new Error("Missing required fields");
        }

        const existingGSTIN = await GST.findOne({
            gstin: gstData.gstin
        });

        if (existingGSTIN) {
            throw new Error("GSTIN already exists");
        }

        const gstid = await getNextGSTId();

        const gst = await GST.create({
            gstid: gstid,
            gstrate: gstData.gstrate,
            gsttype: gstData.gsttype,
            gstin: gstData.gstin
        });

        return gst.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error creating GST: " + error.message
        );

    }

};


const getAllGST = async () => {

    try {

        const gstList = await GST.find();

        return gstList;

    }
    catch (error) {

        throw new Error(
            "Error fetching GST records: " + error.message
        );

    }

};


const getGSTById = async (id) => {

    try {

        const gstRecord = await GST.findOne({
            gstid: Number(id)
        });

        if (!gstRecord) {

            throw new Error("GST record not found");

        }

        return gstRecord;

    }
    catch (error) {

        throw new Error(
            "Error retrieving GST record: " + error.message
        );

    }

};


const updateGST = async (id, gstData) => {

    try {

        const gst = await GST.findOne({
            gstid: Number(id)
        });

        if (!gst) {

            throw new Error("GST record not found");

        }

        if (gstData.gstrate !== undefined) {

            gst.gstrate = gstData.gstrate;

        }

        if (gstData.gsttype !== undefined) {

            gst.gsttype = gstData.gsttype;

        }

        if (gstData.gstin !== undefined) {

            const existingGSTIN = await GST.findOne({
                gstin: gstData.gstin,
                gstid: { $ne: gst.gstid }
            });

            if (existingGSTIN) {

                throw new Error("GSTIN already exists");

            }

            gst.gstin = gstData.gstin;

        }

        await gst.save();

        return gst.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error updating GST record: " + error.message
        );

    }

};


const deleteGST = async (id) => {

    try {

        const gst = await GST.findOneAndDelete({
            gstid: Number(id)
        });

        if (!gst) {

            throw new Error("GST record not found");

        }

        return {
            message: "GST record deleted successfully"
        };

    }
    catch (error) {

        throw new Error(
            "Error deleting GST record: " + error.message
        );

    }

};


module.exports = {

    createGST,
    getAllGST,
    getGSTById,
    updateGST,
    deleteGST

};