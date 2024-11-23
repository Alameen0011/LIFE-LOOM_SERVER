import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value cannot be negetive"],
      max: [100, "Discount value cannot exceed 100"],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amout cannot be negetive"],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, "maximum discount amount cannot be negetive"],
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, "usage limit must be at least 1 if specified"],
    },
    usersApplied: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        usedCount: {
          type: Number,
          default: 0,
          min: [0, "Used count cannot be negative"], // Ensures a user can't use more than allowed
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (userId, cartTotal) {
  const now = new Date();

  //i am going to check if the coupon is expired
  if (this.expiryDate < now) {
    console.log(expiryDate,"expiry Date")
    return { isValid: false, reason: "coupon has expired" };
  }

  // i am goint to check if usage limit reached
  if (this.usageLimit !== null && this.usersApplied.length >= this.usageLimit) {
    console.log("insider useage limit chekcing")
    return {
      isValid: false,
      reason: "This coupon has reached its usage limit",
    };
  }

  // i am going to check whether the user has already used the coupon
  const user = this.usersApplied.find(
    (user) => user.user.toString() === userId.toString()
  );
  if (user && user.usedCount >= 1) {
    return { isValid: false, reason: "you have already used this coupon" };
  }

  if (cartTotal < this.minPurchaseAmount) {
    return {
      isValid: false,
      reason: `Minimum purchase amount is ₹${this.minPurchaseAmount}`,
    };
  }

  console.log("success:True")

  return { isValid: true };
};


// we are going to write a method like we have to increase the coupon apply when user use the coupon right ---?

couponSchema.methods.markAsUsed = async function(userId) {
     const userIndex  = this.usersApplied.findIndex(user => user.user.toString() === userId.toString())

    //here findindex return -1 because there would be no user Id mathcing so in the array it will not be there in that case----

    if(userIndex === -1){
        this.usersApplied.push({user: userId, usedCount: 1 });
    }else {
        // and in success case like user has already used the coupon the coupn will be 1 and it fail the validation and it would not be -1
        return {isValid: false, reason:"you have already used this coupon"};
    }

    return this.save();



}


const Coupon = mongoose.model("Coupon",couponSchema);

export default Coupon

