import bcryptjs from "bcryptjs";
import Address from "../../models/address.model.js";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";

export const handleGetUserProfile = async (req, res, next) => {
  try {
    const id = req.id;

    const user = await User.findById(id).select("-password");

    console.log(user);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user does not exist",
      });
    }

    res.status(200).json({
      success: true,
      message: "fetched single user successfully",
      user,
    });
  } catch (error) {
    console.log("Error while getting user");
    next(error);
  }
};

export const handleUpdateUserProfile = async (req, res, next) => {
  try {
    const id = req.id;
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "cannot find user to update",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated SuccessFully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("ERROR WHILE UPDATING USER PROFILE:", error);
    next(error);
  }
};

//------------Reset Password --------------//

export const handleResetPassword = async (req, res, next) => {
  try {
    const userId = req.id;

    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log(currentPassword, "current Password");
    console.log(newPassword, "new Password");
    console.log(confirmPassword, "confirm Password");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);

    console.log(isMatch, "is it match..?");

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "current password is incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password do not  match",
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "password updated successfully",
      user:userObj,
    });
  } catch (error) {
    console.log("error while reseting password", error);
    next(error);
  }
};

//Address management controllers
export const handleAddAddress = async (req, res, next) => {
  try {
    console.log("inside handleAddress");
    const id = req.id;
    const { state, district, city, address, pincode, addressName, isDefault } =
      req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: id, isDefault: true },
        { isDefault: false }
      );
    }

    const newAddress = await new Address({
      user: id,
      state,
      district,
      city,
      address,
      pincode,
      addressName,
      isDefault: isDefault || false,
    }).save();

    res.status(201).json({
      success: true,
      message: "Address added successFully",
      address: newAddress,
    });
  } catch (error) {
    console.log("error while adding address", error);
    next(error);
  }
};

export const handleFetchAllAddress = async (req, res, next) => {
  try {
    const id = req.id;

    const Addresses = await Address.find({ user: id }).populate("user");

    console.log(Addresses, "all addresses fetched");

    if (!Addresses) {
      return res.status(404).json({
        success: false,
        message: "no Address found",
      });
    }

    res.status(200).json({
      success: true,
      message: "addresses fetched successFully",
      addresses: Addresses,
    });
  } catch (error) {
    console.error("Error while fetching address", error);
    next(error);
  }
};

export const handleFetchSingleAddress = async (req, res, next) => {
  try {
    const AddressId = req.params.id;

    const singleAddress = await Address.findById(AddressId);

    if (!singleAddress) {
      return res.status(404).json({
        success: false,
        message: "address not fouund",
      });
    }

    res.status(200).json({
      success: true,
      message: "fetched single address successFully",
      address: singleAddress,
    });
  } catch (error) {
    console.log("Error while fetching single address");
    next(error);
  }
};

export const handleUpdateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    const { state, district, city, address, pincode, addressName, isDefault } =
      req.body;

    //controller level validation or use library controller level validtion like joi or express validator

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { state, district, city, address, pincode, addressName, isDefault },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.log("Error while updating address ");
    next(error);
  }
};


export const handleDeleteAddress = async(req,res,next) => {
  try {

    const addressId = req.params.id

    console.log(addressId,"address Id")

    const deletedAddress = await Address.findByIdAndDelete(addressId)

    if(!deletedAddress){
      return res.status(404).json({
        success:false,
        message:"Address not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Address successfully deleted",
      deletedAddress,
    });
    
  } catch (error) {
    console.log("error while deleting address")
    next(error)
  }
}

// cart management controllers

export const handleAddToCart = async (req, res, next) => {
  const userId = req.id;
  const { productId, size, price, image, productName } = req.body;
  const quantity = 1; // Default quantity set to 1

  //add validatgion here

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      //logic for operations

      const itemIndex = cart.items.findIndex(
        (item) => item.productId == productId && item.size == size
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          size,
          quantity,
          price,
          image,
          productName,
        });
      }
    } else {
      cart = new Cart({
        userId,
        items: [{ productId, size, price, image, productName }],
      });
    }

    await cart.save();

    res.status(201).json({
      success: true,
      message: "cart created successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    next(error);
  }
};

export const handleFetchingCart = async (req, res, next) => {
  try {
    const userId = req.id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    console.log(cart);

    if (cart) {
      res.status(200).json({
        success: true,
        message: "cart fetched successFully",
        cart,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "cart not found",
      });
    }
  } catch (error) {
    console.log("Error whiel fetching cart");
    next(error);
  }
};


export const handleDeleteCart = async (req, res, next) => {
  const userId = req.id;
  const { productId } = req.body;

  console.log(productId, "product id from req body");

  try {
    //first we have to find the cart inorder to remove the item user dont want

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(400).json({
        success: false,
        message: "cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId == productId
    );

    if (itemIndex == -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const handleUpdateCartQuantity = async (req, res, next) => {
  const userId = req.id;

  const { productId, newQuantity, size: selectedSize } = req.body;

  console.log(productId, "product id");
  console.log(newQuantity, "quantity");
  console.log(selectedSize, "size");

  try {
    const product = await Product.findById(productId);

    console.log(product, "product fetched");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }
    if (!product.sizes || product.sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product sizes are not available",
      });
    }

    // Check stock for the selected size
    const sizeStock = product.sizes.find((item) => item.size === selectedSize);

    console.log(sizeStock, "size stock ");

    if (!sizeStock) {
      return res.status(400).json({
        success: false,
        message: "Selected size not available",
      });
    }

    //checking stock availability
    if (newQuantity > sizeStock.stock) {
      return res.status(400).json({
        success: false,
        message: "not enough stock available",
      });
    }

    //check max limit per person
    const maxPerUser = product.maxPerUser || product.totalStock;

    if (newQuantity > maxPerUser) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more than ${maxPerUser} units`,
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId == productId && item.size === selectedSize
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      return res.status(400).json({ message: "Item not in cart" });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "cart updated successFully",
      cart,
    });
  } catch (error) {
    console.log("error while updating the quantity");
    next(error);
  }
};
