import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'product',
    required: true,
  },
  size: {
    type: String,
    required: true, //selected Size of the product
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number, //price of the selected product  --//offer price all thing was inclued here
    required: true,
  },
  image: {
    type: String, //URL of the product Image -for cart display this is user selected product storing purpose //image and product name can be populated
  },
  productName: {
    type: String, //name of the product for display purpose in cart
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    items: [cartItemSchema], //Array of cart Items
    totalPrice: { type: Number, default: 0 }, // Total price of items in the cart
    totalItems: { type: Number, default: 0 }, // Total number of items in the cart (e.g., sum of all item quantities)
  },
  { timestamps: true }
);

cartSchema.pre("save",function(next){
    if(!this.isModified("items")){
        //if the array of items in cart doesn't change skip the calculation of total price and total quantity
        return next();
    }

    // i don't know , here we have to calculate the total price and total items i think this is for order summay and all!

    this.totalPrice = this.items.reduce((acc,item) => acc + item.price * item.quantity,0);
    this.totalItems = this.items.reduce((acc,item) => acc + item.quantity,0);

    next();

})




const Cart = mongoose.model("cart", cartSchema);

export default Cart;
