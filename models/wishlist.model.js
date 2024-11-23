import mongoose from "mongoose";


const wishListSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    products:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'product'
        }
    ]
},{timestamps:true})


const Wishlist = mongoose.model("wishlist",wishListSchema)
export default Wishlist