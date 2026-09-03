const Product = require("../models/Product");
const GST = require("../models/GST");
const Counter = require("../models/Counter");

const getNextProductId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "productid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};

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

const getOrCreateGST = async (gstData) => {
    if (!gstData) {
        throw new Error("GST details are required");
    }

    if (
        gstData.gstin === undefined ||
        !gstData.gsttype ||
        gstData.gstrate === undefined
    ) {
        throw new Error("Missing GST fields");
    }

    let gst = null;

    if (gstData.gstid !== undefined) {
        gst = await GST.findOne({
            gstid: Number(gstData.gstid)
        });
    }

    if (!gst) {
        gst = await GST.findOne({
            gstin: gstData.gstin
        });
    }

    if (gst) {
        return gst;
    }

    const gstid = await getNextGSTId();

    gst = await GST.create({
        gstid: gstid,
        gsttype: gstData.gsttype,
        gstrate: gstData.gstrate,
        gstin: gstData.gstin
    });

    return gst;
};

const createProduct = async (productdata) => {
    try {
        if (
            !productdata.productname ||
            productdata.quantity === undefined ||
            productdata.price === undefined ||
            !productdata.hsncode ||
            !productdata.gst
        ) {
            throw new Error("Missing Required fields");
        }

        const gst = await getOrCreateGST(productdata.gst);

        const productid = await getNextProductId();

        const product = await Product.create({
            productid: productid,

            productname: productdata.productname,

            price: productdata.price,

            hsncode: productdata.hsncode,

            quantity: productdata.quantity,

            gst: {
                gstid: gst.gstid,
                gsttype: gst.gsttype,
                gstrate: gst.gstrate,
                gstin: gst.gstin
            }
        });

        return product.toJSON();

    }
    catch (error) {
        throw new Error(
            "Error creating product: " + error.message
        );
    }
};

const getAllProducts = async () => {
    try {
        const products = await Product.find();

        return products;

    }
    catch (error) {
        throw new Error(
            "Error retrieving products: " + error.message
        );
    }
};

const getProductById = async (id) => {
    try {
        const product = await Product.findOne({
            productid: Number(id)
        });

        if (!product) {
            throw new Error("Product not found");
        }

        return product;

    }
    catch (error) {
        throw new Error(
            "Error retrieving product: " + error.message
        );
    }
};

const updateProduct = async (id, updateData) => {
    try {
        const product = await Product.findOne({
            productid: Number(id)
        });

        if (!product) {
            throw new Error("Product not found");
        }

        if (updateData.productname !== undefined) {
            product.productname =
                updateData.productname;
        }

        if (updateData.price !== undefined) {
            product.price =
                updateData.price;
        }

        if (updateData.quantity !== undefined) {
            product.quantity =
                updateData.quantity;
        }

        if (updateData.hsncode !== undefined) {
            product.hsncode =
                updateData.hsncode;
        }

        if (updateData.gst !== undefined) {
            const gst = await getOrCreateGST(
                updateData.gst
            );

            product.gst = {
                gstid: gst.gstid,
                gsttype: gst.gsttype,
                gstrate: gst.gstrate,
                gstin: gst.gstin
            };
        }

        await product.save();

        return product.toJSON();

    }
    catch (error) {
        throw new Error(
            "Error updating product: " + error.message
        );
    }
};

const deleteProduct = async (id) => {
    try {
        const product = await Product.findOneAndDelete({
            productid: Number(id)
        });

        if (!product) {
            throw new Error("Product not found");
        }

        return {
            message: "Product deleted successfully"
        };

    }
    catch (error) {
        throw new Error(
            "Error deleting product: " + error.message
        );
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};