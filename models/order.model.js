import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        price: { type: Number, required: true },
        size:{type:String,required:true},
        quantity: { type: Number, required: true },
    
        status:{
          type: String,
          enum: ["Processing", "Shipped", "Delivered", "Cancelled"], // Define valid status values
          default: "Processing" // Default status for each item
        }
      },
    ],
    shippingDetails: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true }, // Add district to match address schema
        state: { type: String, required: true },   // Add state to match address schema
        pincode: { type: String, required: true, match: /^[0-9]{6}$/ }, // Match pincode regex
        addressName: { type: String, required: true }, // Include addressName for better context
        phone: { type: String }, // Consider validating or formatting
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["cod", "Credit Card", "PayPal"],
        required: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
      },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);


const Order = mongoose.model('order',orderSchema)
export default Order