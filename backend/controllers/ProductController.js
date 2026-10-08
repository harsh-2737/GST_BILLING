const ProductRepository = require("../repositories/ProductRepository");

const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            ownerid: req.user.userid,
            gst: {
                ...req.body.gst,
                gsttype: "CGST+SGST",
                gstin: req.user.gstin || req.body.gst?.gstin
            }
        };

        const product = await ProductRepository.createProduct(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message,
            error: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await ProductRepository.getAllProducts(req.user.userid);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await ProductRepository.getProductById(req.params.id, req.user.userid);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: "Product not found"
            });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({
            message: error.message,
            error: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            ownerid: req.user.userid,
            ...(req.body.gst && {
                gst: {
                    ...req.body.gst,
                    gsttype: "CGST+SGST",
                    gstin: req.user.gstin
                }
            })
        };

        const product = await ProductRepository.updateProduct(
            req.params.id,
            productData,
            req.user.userid
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message,
            error: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await ProductRepository.deleteProduct(req.params.id, req.user.userid);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: "Product not found"
            });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message,
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};