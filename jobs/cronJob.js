import cron from "node-cron"
import Coupon from "../models/coupon.model.js"


const updateExpiredCoupons = async () => {
    const now = new Date()

    try {
        const result = await Coupon.updateMany(
            {expiryDate:{$lt : now} , status:{$ne: "expired"} },
            {status:"expired"}
        )

        console.log(result,"coupon status is changed to expired")
        
    } catch (error) {
        console.log(error,"error while updating coupon status using cron job")
        
    }
};


cron.schedule("0 0 * * *", async() => {
    console.log("running cron job to check expired coupons.------")
    await updateExpiredCoupons();
})

