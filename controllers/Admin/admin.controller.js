import Product from "../../models/product.model.js";
import User from "../../models/user.model.js"

export const handleUpdateUserStatus = async(req,res) => {
    try {
        const {userId} = req.body;

        const userData = await User.findById(userId)


        if(!userData){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const userStatus  = userData.isActive

        console.log("Current Status of User", userStatus)

        const updatedUserData = await User.findByIdAndUpdate(userId,
            {$set:{isActive:!userStatus}} ,
            {new:true}
        );

        console.log(updatedUserData);

        res.status(200).json({
            success:true,
            updatedUserData,
            message:"user status updated successfully"
        
        })
        
    } catch (error) {
        console.log('ERROR WHILE UPDATING USER STATUS')
        res.status(500).json({message:"error while updating user status"})        
    }
}


