import Category from "../../models/category.model.js"


export const handleFetchCategories = async(req,res) => {
    try {
        const categories = await Category.find({deleted:false});
        console.log("Fetched categories:", categories); 

        res.status(200).json({message:"categories fetched successfully",categories})
        
    } catch (error) {

        console.log(error,"ERROR WHILE FETCHING CATEGORIES")
        return res.status(500).json({message:"error while fetchig categories"})
        
    }
}

//Add category to db
export const handleaddCategory = async (req,res) => {

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
        return res.status(500).json({message:"error while ADDING CATEGORY"})
        
    }
}

export const handleUpdateCategory = async (req, res) => {
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

        let isUpdated = false;

        // Update the title if it's provided and different from the current title
        if (category.categoryName && category.categoryName !== categoryData.categoryName) {
            categoryData.categoryName = category.categoryName;
            isUpdated = true;
        }

        // Update the description if it's provided and different from the current description
        if (category.description && category.description !== categoryData.description) {
            categoryData.description = category.description;
            isUpdated = true;
        }

        // Save changes if any fields were updated
        if (isUpdated) {
            await categoryData.save();
        }

        console.log("After saving changes => ", categoryData);

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            categoryData
        });

    } catch (error) {
        console.error("Error while editing category:", error);
        return res.status(500).json({
            success: false,
            message: "Error while updating category"
        });
    }
};

//PATCH /api/v1/admin/
export const handleupdateCategoryStatus = async(req,res) => {
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
        console.log(error,"Error")
        return res.status(500).json({message:"ERROR WHILE UPDATING CATEGORY STATUS" })
        
    }
}

export const handleSoftDeleteCategory  = async(req,res) => {

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



}