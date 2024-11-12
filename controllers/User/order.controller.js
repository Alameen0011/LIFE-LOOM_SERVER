import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";

export const handlePlaceOrder = async (req, res, next) => {
  const userId = req.id;
  const { items, shippingDetails, paymentDetails, totalAmount } = req.body;

  console.log(shippingDetails, "Shipping detail");
  console.log(paymentDetails, "payment details");
  console.log(totalAmount);

  try {
    //validation of incoming data
    if (!items || !shippingDetails || !paymentDetails || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    console.log(items, "items");

    for (const item of items) {
      const { product: productId, quantity, size: realSize } = item;

      console.log(`Checking stock for Product: ${productId}, Size: ${realSize}, Quantity: ${quantity}`);

      const product = await Product.findOne({ _id: productId }, { sizes: 1 });

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

    const newOrder = new Order({
      user: userId,
      items,
      shippingDetails,
      paymentDetails,
      totalAmount,
      status: "Processing",
    });

    const savedOrder = await newOrder.save();
    console.log(savedOrder, "saved order look size");

    //Look this up this is interesting
    await Promise.all(
      items.map(async (item) => {
        const { product: productId, quantity, size } = item; // Destructure item

        console.log(
          `Updating product: ${productId}, Size: ${size}, Quantity: ${quantity}`
        );

        try {
          const result = await Product.findOneAndUpdate(
            { _id: productId, "sizes.size": size },
            { $inc: { "sizes.$.stock": -quantity } },
            { new: true } // Option to return the updated document
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
      message: "order place successFully",
      savedOrder,
    });
  } catch (error) {
    console.error(error, "error while placing order");
    next(error);
  }
};

export const handleFetchOrder = async (req, res, next) => {
  const userId = req.id;

  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 4;

  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments();

  const totalPages = Math.ceil(totalOrders / limit);

  try {
    const orders = await Order.find({ user: userId })
      .populate("items.product")
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

export const handleGetSingleOrder = async (req, res, next) => {
  try {
    console.log(req.params.id, "req.params");

    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("user").populate({
      path: "items.product",
      model: "product",
    });

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
    console.log(req.params);
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    console.log(order, "order to cancel");

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
