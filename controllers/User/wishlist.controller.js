import Wishlist from "../../models/wishlist.model.js";

export const handleAddToWishlist = async (req, res, next) => {

 
  const userId = req.id;
  console.log(userId,"++++++++++user id")
  const {productId} = req.body;
  console.log(productId,userId)
  try {

    if(!productId){
      return 
    }



    let wishlist = await Wishlist.findOne({ userId });

    console.log(wishlist)
    console.log(productId,"======product id")

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();

    res.status(201).json({
      success: true,
      message: "Added to wishlist successFully",
      wishlist
    });
  } catch (error) {
    console.log("error while adding to whishList");
    next(error);
  }
};


export const handleRemoveWishlist = async (req, res, next) => {
  const userId = req.id;
  const { productId } = req.body; // productId is a string

  console.log(req.body);
  console.log(userId, productId);
  console.log("inside remove wishlist item part");

  try {
    const wishlist = await Wishlist.findOne({ userId });

    console.log(wishlist, "wishlist item");

    if (wishlist) {
      // Filter out the matching productId
      wishlist.products = wishlist.products.filter(
        (id) => id && id.toString() !== productId
      );

      const hostWishlist = await wishlist.save();
      res.status(200).json({
        success: true,
        message: "Removed from wishlist successfully",
        hostWishlist,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }
  } catch (error) {
    console.log(error, "Error while deleting wishlist");
    next(error);
  }
};

export const handleFetchWishlist = async (req,res,next) => {
  const userId = req.id
  try {

    const wishlist = await Wishlist.findOne({userId}).populate('products')

    if(!wishlist){
      return res.status(400).json({
        success:false,
        message:"wishlist not found"
      })
    }

    return res.status(200).json({
      success:true,
      message:"wishList fetched successfully",
      wishlist
    })

    
  } catch (error) {
    console.log(error,"error while fetcing wishlist")
    next(error)
  }
}