import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";

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

    if(order.status === "Delivered" || order.status === "Cancelled"){
      return res.status(400).json({
        success:false,
        message:"cannot modify a completed or cancelled order"
      })
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

export const handleGetSingleOrderAdmin = async (req, res,next) => {
  try {
    console.log(req.params.id, "req.params");

    const orderId = req.params.id;

    console.log(orderId,"order Id for getting order")

    const order = await Order.findById(orderId).populate("user").populate({
      path: "items.product",
      model: "product",
    });

    console.log(order, "order");

    res.status(200).json({
      message: "successfully  fetched admin single order",
      order,
    });
  } catch (error) {
    console.log("error while fething single order details", error);
    next(error)
  }
};


export const handleCancelOrders = async(req,res,next) => {
  try {
   console.log("inside handle cancel orders")
    console.log(req.params)
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    console.log(order,"order to cancel")

    const item = order.items.find((val) => val._id.toString() === itemId);

    console.log(item,"we have done individual cancellation of product so inorder to handle that we have given status from each item")

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

    console.log(item.status,"we have founded the status of item was processing so we are fucking cancelling it because i the great admin")

    item.status = "Cancelled";
    //rollback inventory

    const product = await Product.findById(item.product);

    console.log(product,"product inorder to roll back inventory by accessng the sizes array and update back the stock")

    if (product) {
      const stockToupdate = product.sizes.find((val) => val.size === item.size);

      if (stockToupdate) {
        console.log(stockToupdate.stock,"stock of the product to rollback cancelling quantity")
        stockToupdate.stock += item.quantity;

        await product.save();
      } else {
        console.log("oh .. there is no product which matches the size of org product")
        console.log("size not found to update the stock");
      }
    }

    if (order.items.every((eachProd) => eachProd.status === "Cancelled")) {
      order.status = "Cancelled";
    }

    await order.save();
    res.status(200).json({
      success:true,
      message:"product order cancelled successFully"
    })
  } catch (error) {

    console.log("error while cancelling the order")
    next(error)



  }
}
