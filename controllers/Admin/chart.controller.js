import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";

export const handleGetChartData = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    console.log(year, "year", "========", month, "month");

    const currentYear = new Date().getFullYear();

    if (year && (isNaN(year) || year < 2000 || year > currentYear)) {
      return res.status(400).json({ success: false, message: "Invalid year" });
    }
    if (month && (isNaN(month) || month < 1 || month > 12)) {
      return res.status(400).json({ success: false, message: "Invalid month" });
    }

    let startDate, endDate;

    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 11, 31, 23, 59, 59, 999);
    } else {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }

    const orderPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" }, //furute change to finalTotalAfterDiscount
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          sales: { $round: ["$sales", 2] },
          orderCount: 1,
        },
      },
      { $sort: { name: 1 } },
    ];

    const chartData = await Order.aggregate(orderPipeline);

    res.status(200).json(chartData);
  } catch (error) {
    console.log(error, "error while getting chart data");
    next(error);
  }
};

export const handleGetBestSelling = async (req, res, next) => {
  try {
    // Top 5 Products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },

      { $sort: { totalSold: -1 } },
      { $limit: 5 },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          name: "$productDetails.productName",
          totalSold: 1,
        },
      },
    ]);

    

    // Top 5 Categories
    const topCategories = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: 0,
          name: "$categoryDetails.categoryName",
          totalSold: 1,
        },
      },
    ]);

    

    // Top 5 Brands
    const topBrands = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      topProducts,
      topCategories,
      topBrands,
    });
  } catch (error) {
    console.log(error, "erorr while fetching best selling items");
    next(error);
  }
};

export const handleGetDashboardData = async (req,res,next) => {
    try {

        const totalSalesResult = await Order.aggregate([
            { $unwind: "$items"},
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: { $multiply: ["$items.price","$items.quantity"]}
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1
                }
            },
          
        ])

        console.log(totalSalesResult,"totalSalesREsutl")

        const totalSales = totalSalesResult[0] 
        ? { totalSales: totalSalesResult[0].totalSales } 
        : { totalSales: 0 }

  


        const totalOrders = await Order.countDocuments({})

     

        const totalNewCustomersResult = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    orderCount: { $sum: 1 }
                }
            },
            { $match: { orderCount: 1 } },
            { $count: "newCustomers" }
        ]);
        
      
        const totalNewCustomers = totalNewCustomersResult[0] 
            ? { newCustomers: totalNewCustomersResult[0].newCustomers } 
            : { newCustomers: 0 }


        

        const lowStockItems = await Product.countDocuments({ stock: { $lt: 10 } });



        console.log(lowStockItems,"low stock items")

        const data = {
          totalSales:totalSales.totalSales,
          totalOrders,
          totalNewCustomers:totalNewCustomers.newCustomers,
          lowStockItems
        }

        console.log(data,"DATATATATATRATTAT")

        res.status(200).json(data)




        
    } catch (error) {
        console.log(error,"error while fetching dashboard data");
        next(error)
    }
}
