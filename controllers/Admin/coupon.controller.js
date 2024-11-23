import Coupon from "../../models/coupon.model.js";

export const handleCreateCoupon = async (req, res, next) => {
  console.log(req.body);
  try {
    const {
      code,
      description,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
    } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "code , discount value, expiry date are required",
      });
    }

    const couponExist = await Coupon.findOne({ code });

    if (couponExist) {
      return res.status(409).json({
        success: false,
        message: "coupon Already exists",
      });
    }
    console.log("--------------expiryDate",expiryDate)

    const expiry = new Date(expiryDate);

    console.log(expiry,"-----------expiry converted from iso to date")

    const coupon = await Coupon.create({
      code,
      description,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      expiryDate: expiry,
      usageLimit,
    });

    console.log(coupon.expiryDate); 

    res.status(200).json({
      success: true,
      message: "coupon created successFully",
      coupon,
    });
  } catch (error) {
    console.log(error, "error while creating coupon");
    next(error);
  }
};


export const handleDeleteCoupon = async(req,res) => {
    console.log(req.params)
    try {
        const Id = req.params.id   

        console.log(Id)

        const deletedCoupon = await Coupon.findByIdAndDelete(Id)
        if(!deletedCoupon){
            return res.status(404).json({
                success:false,
                message:"cannot found coupon"
            })
        }

        res.status(200).json({
            success:true,
            message:"coupon deleted SuccessFully",
            deletedCoupon
        })
        
    } catch (error) {
        console.log(error,"error while deleting coupon")
        next(error)
    }
}

export const handleFetchAllCoupon = async (req,res) => {
    try {

        const coupons = await Coupon.find()

        if(!coupons){
            return res.status(404).json({
                success:false,
                message:"coupons not found"

            })
        }

        res.status(200).json({
            success:true,
            message:"coupons fetched successFully",
            coupons
        })
        
    } catch (error) {
        console.log(error,"error while fetching coupons")
    }
}