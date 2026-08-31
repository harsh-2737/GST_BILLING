const Product = require("../models/Product");

const createProduct = async (productdata)=>
{
    try{
        if(!productdata.productname || !productdata.quantity || !productdata.price || !productdata.hsncode)
        {
            throw new Error("Missing Required fields");
        }
        const product = await Product.insertOne({
            productid: productdata.productid,
            productname: productdata.productname,
            price: productdata.price,
            hsncode: productdata.hsncode,
            quantity: productdata.quantity
        });
        return product.toJSON();
    }
    catch(error)
    {
        throw new Error("Error creating product: " + error.message);
    }
};

const getAllProducts = async ()=>
{
    try{
        const products = await Product.find();
        return products;
    }
    catch(error){
        throw new Error("Error retrieving products: " + error.message);
    }
};

const getProductById = async (id)=>
{
    try{
        const product = Product.findOne({productid : id});
        if(!product)
        {
            throw new Error("Product not found");
        }
        return product;
    }
    catch(error)
    {
        throw new Error("Error retrieving product: " + error.message);
    }
};

const updateProduct = async (id,updateData) => {
    try{
        const product = await getProductById(id);
                if (!product)
                {
                    throw new Error("Product not found");
                }
                if(updateData.productid)
                {
                    product.productid = updateData.productid;
                }
                if(updateData.productname)
                {
                    product.productname = updateData.productname;
                }
                if(updateData.price)
                {
                    product.price = updateData.price;
                }
                if(updateData.quantity)
                {
                    product.quantity = updateData.quantity;
                }
                if(updateData.hsncode)
                {
                    product.hsncode = updateData.hsncode;
                }
        
                await product.save();
                return product.toJSON();
            }
            catch (error){
                throw new Error("Error updating product: " + error.message);
            }
};
        
const deleteProduct = async (id) => {
            try{
                const product = await getProductById(id); 
                if (!product) {
                    throw new Error("Product not found");
                }
                await Product.deleteOne({ productid: id });
                return { message: "Product deleted successfully" };
            }
            catch (error){
                throw new Error("Error deleting product: " + error.message);
            }
};
        
module.exports = {
            createProduct,
            getAllProducts,
            getProductById,
            updateProduct,
            deleteProduct
};