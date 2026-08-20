const GST = require("../models/GST");

const createGST = async (gstData) => {
    try {
        if (!gstData.gstid || !gstData.gstrate || !gstData.gsttype || !gstData.gstin) {
            throw new Error("Missing required fields");
        }
        const gst = await GST.insertOne({
            gstid: gstData.gstid,
            gstrate: gstData.gstrate,
            gsttype: gstData.gsttype,
            gstin: gstData.gstin    
        });
        return gst.toJSON();
        }
           
    catch (error) {
        throw new Error("Error creating GST: " + error.message);
        }
};

const getAllGST = async () => {
    try {
        const gstList = await GST.find();
        return gstList;
    } catch (error) {
        throw new Error("Error fetching GST records: " + error.message);
    }
};

const getGSTById = async (id) => {
    try {
        const gstRecord = await GST.findOne({ gstid: id });
        if (!gstRecord) {
            throw new Error("GST record not found");
        }
        return gstRecord;
    }
    catch (error) {
        throw new Error("Error retrieving GST record: " + error.message);
    }
};

const updateGST = async (id, gstData) => {
    try {
        const gst = await getGSTById(id);

        if (!gst) {
            throw new Error("GST record not found");
        }

        if (gstData.gstid) {
            gst.gstid = gstData.gstid;
        }

        if (gstData.gstrate) {
            gst.gstrate = gstData.gstrate;
        }

        if (gstData.gsttype) {
            gst.gsttype = gstData.gsttype;
        }

        if (gstData.gstin) {
            gst.gstin = gstData.gstin;
        }

        await gst.save();

        return gst.toJSON();
    }
    catch (error) {
        throw new Error("Error updating GST record: " + error.message);
    }
};
const deleteGST = async (id) => {
    try {
        const gst = await getGSTById(id);
        if (!gst) {
            throw new Error("GST record not found");
        }
        await GST.deleteOne({ gstid: id });
        return { message: "GST record deleted successfully" };
        }
    catch (error) {
        throw new Error("Error deleting GST record: " + error.message);
        }
};

module.exports = { 
    createGST, 
    getAllGST, 
    getGSTById, 
    updateGST, 
    deleteGST 
};