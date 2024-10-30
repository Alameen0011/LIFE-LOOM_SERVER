import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },

  },{timestamps:true});

const Address = mongoose.model('Address',addressSchema)

export default Address