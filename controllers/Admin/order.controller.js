import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import Wallet from "../../models/wallet.js";

export const handleFetchAllOrders = async (req, res, next) => {
  // const userId = req.id;

  try {
    console.log(req.query, "req.query from client");

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 4;

    console.log(page, limit, "page,limit");

    const skip = (page - 1) * limit;

    const totalOrderCount = await Order.countDocuments();

    console.log(totalOrderCount, "total product count");

    const totalPages = Math.ceil(totalOrderCount / limit);

    console.log(totalPages, "total pages ");

    const orders = await Order.find()
      .populate("items.product")
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

export const handleAdminCancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    if (
      order.status === "Shipped" ||
      order.status === "Cancelled" ||
      order.status === "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a shipped or completed order",
      });
    }

    for (const item of order.items) {
      if (item.status == "Processing") {
        item.status = "Cancelled";

        //inventory rollback

        const product = await Product.findById(item.product._id);

        if (product) {
          const stockToupdate = product.sizes.find(
            (eachSize) => eachSize.size === item.size
          );
          if (stockToupdate) {
            stockToupdate.stock += item.quantity;

            await product.save();
          }
        }
      }
    }

    if (order.items.every((eachProd) => eachProd.status === "Cancelled")) {
      order.status = "Cancelled";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.log("error while cancelling order -admin");
    next(error);
  }
};

export const handleOrderStatusChange = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "cannot modify a completed or cancelled order",
      });
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: "order status updated successFully",
    });
  } catch (error) {
    console.log("error while changing order status");
    next(error);
  }
};

export const handleOrderItemStatusChange = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const item = order.items.find((val) => val._id.toString() === itemId);


    if (!item) {
      return res.status(404).json({
        success: false,
        message: "item not found in order ",
      });
    }

    if (item.status === "Delivered" || item.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "cannot modify a completed or cancelled order item",
      });
    }

    item.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: "order item status updated successFully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const handleGetSingleOrderAdmin = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("user").populate({
      path: "items.product",
      model: "product",
    });

    res.status(200).json({
      message: "successfully  fetched admin single order",
      order,
    });
  } catch (error) {
    console.log("error while fething single order details", error);
    next(error);
  }
};

export const handleCancelOrders = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    const item = order.items.find((val) => val._id.toString() === itemId);

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

    item.status = "Cancelled";

    //rollback inventory
    const product = await Product.findById(item.product);

    if (product) {
      const stockToupdate = product.sizes.find((val) => val.size === item.size);

      if (stockToupdate) {
        stockToupdate.stock += item.quantity;

        await product.save();
      } else {
        console.log("size not found to update the stock");
      }
    }

    if (order.items.every((eachProd) => eachProd.status === "Cancelled")) {
      order.status = "Cancelled";
    }

    await order.save();
    res.status(200).json({
      success: true,
      message: "product order cancelled successFully",
    });
  } catch (error) {
    console.log("error while cancelling the order");
    next(error);
  }
};

export const handleReturnResponse = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { itemId, isApproved } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    const Item = order.items.find((item) => item._id.toString() === itemId);

    if (!Item) {
      return res.status(404).json({
        success: false,
        message: "item for return not found",
      });
    }

    Item.returnRequest.isApproved = isApproved;
    Item.returnRequest.isResponseSend = true;

    if (isApproved) {
      Item.status = "Returned";
    } else {
      Item.status = "Delivered";
    }

    let refundAmount = Item.price * Item.quantity;
    const product = await Product.findById(Item.product);
    let description = `${product?.productName} returned`;

    //refund For discounted part

    //rollback
    if (isApproved) {
      const product = await Product.findById(Item.product);

      if (product) {
        const stockToupdate = product.sizes.find(
          (val) => val.size === Item.size
        );
        if (stockToupdate) {
          stockToupdate.stock += Item.quantity;
          await product.save();
        } else {
          console.log("size not found to update the stock");
        }
      }
    }

    if (isApproved) {
      console.log("inside refund part");

      if (order.paymentDetails.method === "razorpay") {
        let wallet = await Wallet.findOne({ user: order.user });
        console.log(wallet, "wallet.....))))))))");
        if (!wallet) {
          wallet = new Wallet({
            user: userId,
            balanceAmount: 0,
            transactions: [],
          });
        }

        wallet.balanceAmount += refundAmount;
        wallet.transactions.push({
          orderId: order._id,
          transactionDate: new Date(),
          description: description,
          transactionType: "credited",
          transactionStatus: "Completed",
          amount: refundAmount,
        });

        await wallet.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `return request ${isApproved ? "Approved" : "Rejected"}`,
      order,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
