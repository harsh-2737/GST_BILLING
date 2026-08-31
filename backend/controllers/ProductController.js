const ProductRepository = require('../repositories/ProductRepository');
const createProduct = async (req,res)=>
{
    try
    {
        const product= await ProductRepository.createProduct(req.body);
        res.status(201).json(product);
    }
    catch(error)
    {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllProducts = async (req,res)=> {
    try{
        const products = await ProductRepository.getAllProducts();
        res.status(200).json(products);
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
};

const getProductById = async (req,res)=>{
    try{
        const product = await ProductRepository.getProductById(req.params.id);
    res.status(200).json(product);
    }
    catch(error){
        res.status(404).json({error:error.message});
    }
};

const updateProduct = async (req,res)=>
{
    try{
        const product= await ProductRepository.updateProduct(req.params.id,req.body);
        res.status(200).json(product);
    }
    catch(error){
        res.status(404).json({error : error.mesaage});
    }
};

const deleteProduct = async (req,res)=>
{
    try{
        const product =  await ProductRepository.deleteProduct(req.params.id);
        res.status(200).json(product);
    }
    catch(error){
        res.status(404).json({error : error.message});
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};