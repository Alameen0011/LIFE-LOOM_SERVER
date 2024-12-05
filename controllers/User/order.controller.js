import Cart from "../../models/cart.model.js";
import Coupon from "../../models/coupon.model.js";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import Wallet from "../../models/wallet.js";

export const handlePlaceOrder = async (req, res, next) => {
  const userId = req.id;
  const {
    items,
    shippingDetails,
    paymentDetails,
    totalAmount,
    finalTotal,
    discount,
    coupon,
  } = req.body;

  try {
    if (!items || !shippingDetails || !paymentDetails || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log(
      finalTotal,
      "==finaltotal",
      coupon,
      "==coupon",
      totalAmount,
      "total =======",
      discount,
      "=====discount"
    );

    if(totalAmount > 1000){
      //cod is not available 
      if(paymentDetails.method === "cod"){
        return res.status(400).json({
          success:false,
          message:"pleasee choose Online payment method"
        })
      } 
    }

    for (const item of items) {
      const { product: productId, quantity, size: realSize } = item;

      console.log(
        `Checking stock for Product: ${productId}, Size: ${realSize}, Quantity: ${quantity}`
      );

      const product = await Product.findOne({ _id: productId });

      console.log(product, "product, for checking stock vaiblility");

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${productId} not found`,
        });
      }

      const matchSize = product.sizes.find((size) => size.size === realSize);
      console.log(matchSize, "finded the matching size document");
      if (!matchSize) {
        return res.status(400).json({
          success: false,
          message: `Size ${realSize} not available for product ${productId}`,
        });
      }

      const sizeStock = matchSize.stock;

      console.log(sizeStock, "stock for tracking");

      if (sizeStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for size ${realSize} `,
        });
      }
    }

    async function calculateSavings(items, totalAmount) {
      const populatedItems = await Promise.all(
        items.map(async (item) => {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Product with ID ${item.product} not found`);
          }

          return {
            ...item,
            actualPrice: product.price,
          };
        })
      );

      const totalOriginalPrice = populatedItems.reduce((sum, item) => {
        return sum + item.actualPrice * item.quantity;
      }, 0);

      const savings = totalOriginalPrice - totalAmount;

      const roundedTotalOriginalPrice = totalOriginalPrice.toFixed(2);
      const roundedSavings = savings.toFixed(2);

      console.log(savings, "=====savings");
      console.log(totalOriginalPrice, "========original price");

      return {
        totalOriginalPrice: parseFloat(roundedTotalOriginalPrice),
        savings: parseFloat(roundedSavings),
      };
    }

    const { totalOriginalPrice, savings } = await calculateSavings(
      items,
      totalAmount
    );

    const newOrder = new Order({
      user: userId,
      items,
      shippingDetails,
      paymentDetails,
      totalAmount,
      savedAmount: savings,
      actualAmount: totalOriginalPrice,
      coupon,
      discount,
      finalTotalAfterDiscount: finalTotal,
      status: "Processing",
    });

    const savedOrder = await newOrder.save();
    console.log(savedOrder, "saved order look size");

    await Promise.all(
      items.map(async (item) => {
        const { product: productId, quantity, size } = item;

        console.log(
          `Updating product: ${productId}, Size: ${size}, Quantity: ${quantity}`
        );

        try {
          const result = await Product.findOneAndUpdate(
            { _id: productId, "sizes.size": size },
            { $inc: { "sizes.$.stock": -quantity } },
            { new: true }
          );

          if (!result) {
            console.log(
              `No product found for ID: ${productId} or size: ${size}`
            );
          } else {
            console.log(
              `Updated stock for ${productId} - New size stock:`,
              result.sizes
            );
          }
        } catch (error) {
          console.error(`Error updating product ${productId}:`, error);
        }
      })
    );

    res.status(201).json({
      success: true,
      message: "order placed successFully",
      savedOrder,
    });
  } catch (error) {
    console.error(error, "error while placing order");
    next(error);
  }
};

export const handleFetchOrder = async (req, res, next) => {
  const userId = req.id;

  const { page = 1, limit = 4 } = req.query;

  console.log(page,limit,"page, limit")

  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments({ user: userId });

  const totalPages = Math.ceil(totalOrders / limit);
  console.log(totalPages, "totoal pages");

  try {
    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .skip(skip)
      .limit(limit)
      .sort({createdAt:-1});

    console.log(orders, "order");

    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "orders fetched successFully",
      orders,
      page,
      totalPages,
    });
  } catch (error) {
    console.log(error, "Error while fetching order");
    next(error);
  }
};

export const handleGetSingleOrder = async (req, res, next) => {
  try {
    console.log(req.params.id, "req.params");

    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("user").populate({
      path: "items.product",
      model: "product",
    });

    const orderData = order.items.map((item) => {});

    // console.log(orderData,"===OrderData")

    console.log(order, "order");

    res.status(200).json({
      message: "successfully  fetched single order",
      order,
    });
  } catch (error) {
    console.log("error while fething single order details", error);
    next(error);
  }
};

export const handleCancelOrder = async (req, res, next) => {
  try {
    const userId = req.id

    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }


    const item = order.items.find((val) => val._id.toString() === itemId);

    console.log(
      item,
      "we have done individual cancellation of product so inorder to handle that we have given status from each item"
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "item not found in order ",
      });
    }

    if (item.status !== "Processing") {
      return res
        .status(400)
        .json({ message: "Item cannot be canceled at this stage" });
    }

    console.log(
      item.status,
      "we have founded the status of item was processing so we are fucking cancelling it because i the great admin"
    );

    let refundAmount = item.price * item.quantity;
    // if(order.discount > 0){
    //   const totalOrderValue = order.finalTotalAfterDiscount
    // }
    console.log(refundAmount,"==== refund amoutn")

    item.status = "Cancelled";

  
    //rollback inventory

    const product = await Product.findById(item.product);

    console.log(
      product,
      "product inorder to roll back inventory by accessng the sizes array and update back the stock"
    );

    if (product) {
      const stockToupdate = product.sizes.find((val) => val.size === item.size);

      if (stockToupdate) {
        console.log(
          stockToupdate.stock,
          "stock of the product to rollback cancelling quantity"
        );
        stockToupdate.stock += item.quantity;

        await product.save();
      } else {
        console.log(
          "oh .. there is no product which matches the size of org product"
        );
        console.log("size not found to update the stock");
      }
    }

    let description = `${product.productName} cancelled` 

    console.log(description,"desription")
    if (order.paymentDetails.method === "razorpay") {
      let wallet = await Wallet.findOne({ user: userId });



      if (!wallet) {
        wallet = new Wallet({
          user: userId,
          balanceAmount: 0,
          transactions: [],
        });
      }

      wallet.balanceAmount += refundAmount;
      wallet?.transactions.push({
        orderId: order._id,
        description,
        transactionDate: new Date(),
        transactionType: "credited",
        transactionStatus: "Completed",
        amount: refundAmount,
      });

     console.log("wallet saving +++===",wallet)

      await wallet.save();
    }


    if (order.items.every((eachProd) => eachProd.status === "Cancelled")) {
      order.status = "Cancelled";
    }

    console.log("order saving ====")

   const newOrder = await order.save();


    console.log("order saved ===",newOrder)

    res.status(200).json({
      success: true,
      message: "product order cancelled successFully",
    });
  } catch (error) {
    console.log("error while cancelling the order");
    next(error);
  }
};

export const handleApplyCoupon = async (req, res, next) => {
  const { code } = req.body;
  const userId = req.id;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart || !cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "cart is empty",
      });
    }

    const cartTotal = cart.items.reduce((total, val) => {
      return total + val.quantity * val.price;
    }, 0);

    console.log(cartTotal, "==========cart total ");

    const coupon = await Coupon.findOne({ code });

    console.log(coupon, "+++++++coupon");

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "coupon not found",
      });
    }

    const valdiation = coupon.isValid(userId, cartTotal);
    if (!valdiation.isValid) {
      return res.status(400).json({
        success: false,
        message: valdiation.reason,
      });
    }

    console.log("succesfully finished validation");

    await coupon.markAsUsed(userId);

    console.log("successfullyfindished usage marking");

    let discount = (cartTotal * coupon.discountValue) / 100;

    console.log(discount, "++++Discoutn");

    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    const finalTotal = cartTotal - discount;

    console.log(finalTotal, "=========final total");

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discount,
      cartTotal,
      finalTotal,
    });
  } catch (error) {
    console.log(error, "error while applying coupon");
    next(error);
  }
};

export const handleReturnRequest = async (req, res, next) => {
  console.log("inside handleReturn request");
  console.log(req.params);
  console.log(req.body);
  const userId = req.id
  const { orderId, itemId } = req.params;
  const { reason, comments } = req.body;
  try {
    console.log(
      reason,
      comments,
      orderId,
      itemId,
      "=========all credentials necessary for return product"
    );

    const order = await Order.findOne({ _id: orderId });

    console.log(order, "----- order to find indi product and delete");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    const product = order.items.find((item) => item._id.toString() === itemId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "item to return not found",
      });
    }

    console.log(product, "===product to make return ");

    if (product.returnRequest.isRequested) {
      return res.status(409).json({
        success: false,
        message: "return request already exist",
      });
    }

    product.returnRequest = {
      isRequested: true,
      reason,
      comment: comments,
      isApproved: false,
      isResponseSend: false,
    };


    await order.save();

    res.status(200).json({
      success: true,
      message: "return requested successFully",
      order,
    });
  } catch (error) {
    console.log(error, "error while return request");
    next(error);
  }
};


export const handleGetCoupon = async(req,res, next)  => {
  
  try {


    const coupon = await Coupon.find()

    console.log(coupon,"===coupon")

    if(!coupon){
      return res.status(404).json({
        succes:false,
        message:"coupon not found"

      })
    }

    res.status(200).json({
      success:true,
      message:"coupon fetched successfully",
      coupons:coupon,
    })
    
  } catch (error) {
    console.log(error,"error while fetching coupon")
    next(error)
  }
}


export const handleRetryOrderPayment = async (req, res, next) => {
  try {
    console.log(req.body, "req.body======");

    const { orderId, status } = req.body;


    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and payment status are required",
      });
    }


    const order = await Order.findById(orderId);

    console.log(order, "order------------");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

 
    const validStatuses = ["Paid", "Failed", "Pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status provided",
      });
    }

   
    order.paymentDetails.status = status;

    if (status === "Paid") {
      order.status = "Processing"; 
    } else if (status === "Failed") {
      order.status = "Payment Failed";
    }

    await order.save();

    console.log("Payment status updated successfully",order);

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.log(error, "error while retrying payment");
    next(error);
  }
};





