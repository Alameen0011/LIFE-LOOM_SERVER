import Address from "../../models/address.model.js";
import Cart from "../../models/cart.model.js";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import User from "../../models/user.model.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";


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
      user: userObj,
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
    console.log(id, "id from user auth");

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

export const handleDeleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    console.log(addressId, "address Id");

    const deletedAddress = await Address.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address successfully deleted",
      deletedAddress,
    });
  } catch (error) {
    console.log("error while deleting address");
    next(error);
  }
};

// cart management controllers

export const handleAddToCart = async (req, res, next) => {
  const userId = req.id;
  const { productId, size, price, image, productName } = req.body;
  const quantity = 1; 


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

    console.log(userId,"user id while fetching cart")

    const cartData = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      populate: {
        path: "offer",
        model: "offer",
      },
    }).lean();

    console.log(cartData);

   const cart = {
    ...cartData,
    items:cartData.items.map((item) => {
      return {
        ...item,
        price:Math.round(
          item.price - ((item.price * (item.productId.offer?.offerPercentage ? item.productId.offer.offerPercentage : 1) ) /100 ) 
        )
      }
     })
   }

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

export const handleInvoiceDownload = async (req, res) => {
  try {
    console.log(req.params, "req.params");
    console.log(req.query, "req.query");
    const { orderId } = req.query;

    const orderData = await Order.findById(orderId)
      .populate("user")
      .populate("items.product");

    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: "order Data not found",
      });
    }

    console.log(orderData, "====orderData");
    const pdf = new jsPDF();

    
    pdf.text("Invoice", 10, 10);

    
    pdf.setFontSize(12);
    pdf.text(
      `Customer Name: ${orderData.user.firstName} ${orderData.user.lastName}`,
      10,
      20
    );
    pdf.text(`Email: ${orderData.user.email}`, 10, 25);
    pdf.text(`Phone: ${orderData.user.phone}`, 10, 30);

    
    pdf.text("Shipping Address:", 10, 40);
    pdf.text(`${orderData.shippingDetails.address}`, 10, 45);
    pdf.text(
      `${orderData.shippingDetails.city}, ${orderData.shippingDetails.district}`,
      10,
      50
    );
    pdf.text(
      `${orderData.shippingDetails.state}, ${orderData.shippingDetails.pincode}`,
      10,
      55
    );
    pdf.text(`Address Name: ${orderData.shippingDetails.addressName}`, 10, 60);

    
    pdf.text(`Order ID: ${orderData._id}`, 10, 70);
    pdf.text(
      `Invoice Date: ${new Date(orderData.createdAt).toLocaleDateString()}`,
      10,
      75
    );


    const itemsTableData = orderData.items.map((item) => [
      item.product ? item.product.productName : "Unknown Product",
      item.size,
      item.quantity,
      item.price.toFixed(2),
      (item.price * item.quantity).toFixed(2),
    ]);

    pdf.autoTable({
      startY: 80,
      head: [["Product", "Size", "Quantity", "Unit Price", "Total"]],
      body: itemsTableData,
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fontSize: 11,
        halign: "center",
      },
      bodyStyles: {
        valign: "middle",
        halign: "center",
      },
      margin: { left: 10 },
    });

    
    pdf.text(
      `Subtotal: ₹${orderData.totalAmount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 10
    );
    pdf.text(
      `Discount: -₹${orderData.discount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 15
    );
    pdf.text(
      `Saved Amount: ₹${orderData.savedAmount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 20
    );
    pdf.text(
      `Total Amount: ₹${orderData.finalTotalAfterDiscount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 25
    );
    pdf.text(
      `Payment Method: ${orderData.paymentDetails.method}`,
      10,
      pdf.lastAutoTable.finalY + 30
    );
    pdf.text(
      `Payment Status: ${orderData.paymentDetails.status}`,
      10,
      pdf.lastAutoTable.finalY + 35
    );

    
    const pdfData = pdf.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Invoice.pdf");
    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.log(error, "error while invoice downloading");
  }
};
