
// desc => for listing products in PLP

import Category from "../../models/category.model.js";
import Product from "../../models/product.model.js";

// GET /api/v1/user/getProducts
export const handleGetProducts = async( req,res) => {
    try {
  
      //Fetch all products with populated Category 
      const products = await Product.find({deleted:false,status:true}).populate('category')
  
  
      //Fetching all categoreis 
      const category = await Category.find({status:true,deleted:false})
      if (!category) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to fetch categories" });
      }

      console.log(category,"active categories")
    
  
      //checking if product exists
     if(!products.length){
      return res.status(200).json({
        success:true,
        message:"No products found",
        category
      })
     }
  
     //if everything was succesfull
    return  res.status(200).json({
      success:true,
      products,
      category
     })
  
  
      
    } catch (error) {
      console.log(error,"error on products")
      res.status(500).json({message:"Internal server error"})
      
    }
  }


  export const handleSingleProduct = async(req,res) => {
    try {

      const productId = req.params.id

      console.log(productId,"product id from params")

      if(!productId){
          return res.status(400).json({message:"Invalid id , cannot find product"})
      }

      const product = await Product.findById(productId).populate('category')

      console.log(product,"product fetfched with the help of id param")

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
          
      }

      //handling both fetching sigle product and related products

      const relatedProducts = await Product.find({
        category:product.category,
        _id:{$ne:product._id} ,
      }).limit(4) 







      res.status(200).json({message:"product and related products fetched successfully",product,relatedProducts})



      
  } catch (error) {

      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });


      
  }

  }

