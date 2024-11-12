import Category from "../../models/category.model.js";


export const handleFetchActiveCategory = async(req,res ,next) => {

  const userId = req.id

    try {

        const categories = await Category.find({deleted:false , status: true})
        if (!categories) {
            return res
              .status(500)
              .json({ success: false, message: "Failed to fetch categories" });
          }

        console.log("Fetched categories:", categories); 

        res.status(200).json({message:"categories fetched successfully",categories})
        
    } catch (error) {
        console.log(error,"error while fetching category")
        next(error)
        
    }
}