import Category from "../../models/category.model.js"


export const handleFetchCategories = async(req,res,next) => {
    try {

        console.log(req.query,"query passed  from client ")

        const page = parseInt(req.query.page) || 1;

        const limit = parseInt(req.query.limit) || 4;

        console.log(page, limit, "page,limit");


        const skip = (page - 1) * limit;


        const totalCategoryCount = await Category.countDocuments();

        console.log(totalCategoryCount,"total category count");

        const totalPages = Math.ceil(totalCategoryCount/limit)

        console.log(totalPages,"total pages ")



        const categories = await Category.find({deleted:false}).skip(skip).limit(limit);
        if (!categories) {
            return res
              .status(500)
              .json({ success: false, message: "Failed to fetch categories" });
          }

        console.log("Fetched categories:", categories); 

        res.status(200).json({message:"categories fetched successfully",categories,page,totalPages})
        
    } catch (error) {

        console.log(error,"ERROR WHILE FETCHING CATEGORIES")
        next(error)
        
    }
}

//Add category to db
export const handleaddCategory = async (req,res,next) => {

    try {
         const {categoryName,description } = req.body

         const iscategoryExists = await Category.findOne({ categoryName:categoryName })

         if(iscategoryExists){
            return res.status(409).json({message:"Category already exists"})
         }

         const category = new Category({
            categoryName:categoryName,
            description:description
         })

        const categoryData =  await category.save()

        if(!categoryData){
            return res.status(400).json({message:"Category adding failed"})
        }

        res.status(201).json({message:"Category added SuccessFully"})


        
    } catch (error) {
        console.log(error,"ERROR WHILE ADDING CATEGORY")
        next(error)
        
    }
}

export const handleUpdateCategory = async (req, res,next) => {
    try {
        const category = req.body;

        console.log(category, "category with updated category data");

        // Validate category data
        if (!category || !category._id) {
            return res.status(400).json({
                success: false,
                message: "Invalid data: category ID is required."
            });
        }

        // Fetch the existing category
        const categoryData = await Category.findById(category._id);
        if (!categoryData) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        //edge case suppose if he edit the category and the name was already there you can't add multiple same name category
        const existingCategory = await Category.findOne({
            categoryName: category.categoryName,
            _id: { $ne: category._id } 
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists."
            });
        }


        const existDescription = await Category.findOne({
            description:category.description,
            _id:{$ne:category._id}
        })
        if (existDescription) {
            return res.status(400).json({
                success: false,
                message: "Category description already exists."
            });
        }

   
        let isUpdated = false;

        console.log(category,"category")
        console.log(categoryData,"categoryData fetched from db")

        // Update the title if it's provided and different from the current title
        if (category.categoryName && category.categoryName !== categoryData.categoryName) {
            categoryData.categoryName = category.categoryName;
            isUpdated = true;
        }else{
            return res.status(400).json({
                success:false,
                message:"category name already exist"
            })
        }

        // Update the description if it's provided and different from the current description
        if (category.description && category.description !== categoryData.description) {
            categoryData.description = category.description;
            isUpdated = true;
        }else{
            return res.status(400).json({
                success:false,
                message:"category description alreay exist"
            })
        }

        // Save changes if any fields were updated
        if (isUpdated) {
            await categoryData.save();
        }

        console.log("After saving changes => ", categoryData);

        return res.status(200).json({
            success: true,
            message: "Category blocked successfully",
            categoryData
        });

    } catch (error) {
        console.error("Error while editing category:", error);
        next(error)
    }
};

//PATCH /api/v1/admin/
export const handleupdateCategoryStatus = async(req,res,next) => {
    try {

        const {categoryId} = req.body

        const categoryData = await Category.findById(categoryId)

        console.log(categoryData)

        const categoryStatus  = categoryData.status

        console.log("Current Status of User", categoryStatus)

        const updatedCategoryStatus = await Category.findByIdAndUpdate(categoryId,
            {$set:{status:!categoryStatus}} ,
            {new:true}
        );

    

        res.json({success:true, message:"Category data updated successFully",updatedCategoryStatus})





        
    } catch (error) {
        console.log(error,"Error while updating category status")
        next(error)
        
    }
}

export const handleSoftDeleteCategory  = async(req,res,next) => {

    try {
        const categoryId = req.params.id

        console.log(categoryId,"cateogyr id")
    
        if(!categoryId){
            return res.status(400).json({message:"category id not got with req param"})
        }
    
        const category = await Category.findByIdAndUpdate(categoryId,{deleted:true},{new:true})
    
    
        if(!category){
            return res.status(404).json({
                success:false,
                message:"category not found"
    
            })
        }
    
        res.status(200).json({
            success:true,
            message:"category soft deleted successfully",
            category
        })
        
    } catch (error) {
        console.log("error while deleting category",error)
        next(error)
        
    }





}