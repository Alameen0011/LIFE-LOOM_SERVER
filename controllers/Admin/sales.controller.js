import Order from "../../models/order.model.js";

const getSalesReportDate = async (
  period,
  startDate,
  endDate,
  limit,
  skip,
  page
) => {
  console.log("inside salesReport dAte-------------------");
  let dateSelection = {};
  const currentDate = new Date();
  console.log(skip, "==skip");
  console.log(limit, "==limit");
  console.log(period, "===period");

  if (period == "custom" && startDate && endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    dateSelection = {
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
      "items.status": "Delivered",
    };
    let salesReport = await Order.find(dateSelection)
      .populate("user")
      .populate("items.product")
      .skip(skip)
      .limit(limit);

    const ReportCount = await Order.countDocuments(dateSelection);
    const totalPages = Math.ceil(ReportCount / limit);
    const report = await Order.find(dateSelection);

    const totalSalesCount = report.length;
    const totalDiscount = report.reduce((acc, report) => {
      return acc + report.discount;
    }, 0);
    const totalOrderAmount = report.reduce(
      (acc, report) => acc + report.totalAmount,
      0
    );
    return {
      salesReport,
      totalPages,
      totalSalesCount,
      totalDiscount,
      totalOrderAmount,
      page,
    };
  }

  switch (period) {
    case "daily":
      currentDate.setHours(0, 0, 0);
      dateSelection = {
        createdAt: {
          $gte: currentDate,
          $lt: new Date(),
        },
        "items.status": "Delivered",
      };
      break;
    case "weekly":
      dateSelection = {
        createdAt: {
          $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
          $lt: new Date(),
        },
        "items.status": "Delivered",
      };
      break;
    case "monthly":
      dateSelection = {
        createdAt: {
          $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
          $lt: new Date(),
        },
        "items.status": "Delivered",
      };
      break;
    case "yearly":
      dateSelection = {
        createdAt: {
          $gte: new Date(
            currentDate.setFullYear(currentDate.getFullYear() - 1)
          ),
          $lt: new Date(),
        },
        "items.status": "Delivered",
      };
      break;
    default:
      dateSelection = {
        createdAt: {
          $gte: new Date(
            currentDate.setFullYear(currentDate.getFullYear() - 1)
          ),
          $lt: new Date(),
        },
        "items.status": "Delivered",
      };
      break;
  }
  let salesReport = await Order.find(dateSelection)
    .populate("user")
    .populate("items.product")
    .skip(skip)
    .limit(limit);

  const ReportCount = await Order.countDocuments(dateSelection);
  const totalPages = Math.ceil(ReportCount / limit);
  const report = await Order.find(dateSelection);

  const totalSalesCount = report.length;
  const totalDiscount = report.reduce((acc, report) => {
    return acc + report.discount;
  }, 0);
  const totalOrderAmount = report.reduce(
    (acc, report) => acc + report.totalAmount,
    0
  );
  return {
    salesReport,
    totalPages,
    totalSalesCount,
    totalDiscount,
    totalOrderAmount,
    page,
  };
};







export const handleGetSalesReport = async (req, res, next) => {
  console.log(req.query);
  const {
    startDate = null,
    endDate = null,
    period = "daily",
    page = 1,
    limit = 5,
  } = req.query;

  const skip = (page - 1) * limit;

  try {
    let dateSelection = {};
    const currentDate = new Date();

    console.log(currentDate, "current date ====");

    if (period === "custom" && startDate && endDate) {
      console.log("going to get saleReport date");
      const salesCustomReport = await getSalesReportDate(
        period,
        startDate,
        endDate,
        limit,
        skip,
        page
      );
      console.log("builded sales report custom +", salesCustomReport);

      return res.status(200).json({
        success: true,
        message: "custom sales report",
        salesReport: salesCustomReport.salesReport,
        totalSalesCount: salesCustomReport.totalSalesCount,
        totalOrderAmount: salesCustomReport.totalOrderAmount,
        totalDiscount: salesCustomReport.totalDiscount,
        totalPages: salesCustomReport.totalPages,
        page: salesCustomReport.page,
      });
    }

    console.log(period, "======period");

    switch (period) {
      case "daily":
        currentDate.setHours(0, 0, 0, 0);
        dateSelection = {
          createdAt: {
            $gte: currentDate,
            $lt: new Date(),
          },
          "items.status": "Delivered",
        };
        break;
      case "weekly":
        dateSelection = {
          createdAt: {
            $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
            $lt: new Date(),
          },
          "items.status": "Delivered",
        };
        break;
      case "monthly":
        dateSelection = {
          createdAt: {
            $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
            $lt: new Date(),
          },
          "items.status": "Delivered",
        };
        break;
      case "yearly":
        dateSelection = {
          createdAt: {
            $gte: new Date(
              currentDate.setFullYear(currentDate.getFullYear() - 1)
            ),
            $lt: new Date(),
          },
          "items.status": "Delivered",
        };
        break;
      case "":
        dateSelection = {
          createdAt: {
            $gte: new Date(
              currentDate.setFullYear(currentDate.getFullYear() - 1)
            ),
            $lt: new Date(),
          },
          "items.status": "Delivered",
        };
        break;
      default:
        break;
    }

    console.log(dateSelection, "date slection query object");

    const salesReport = await Order.find(dateSelection)
      .populate("user")
      .populate("items.product")
      .skip(skip)
      .limit(limit);

    console.log(salesReport, "sales Report");

    const totalReportCount = await Order.countDocuments(dateSelection);
    const totalPages = Math.ceil(totalReportCount / limit);
    const report = await Order.find(dateSelection);

    const totalSalesCount = report.length;
    const totalDiscount = report.reduce((acc, report) => {
      return acc + report.discount;
    }, 0);
    const totalOrderAmount = report.reduce(
      (acc, report) => acc + report.totalAmount,
      0
    );

    res.status(200).json({
      salesReport,
      totalSalesCount,
      totalOrderAmount,
      totalDiscount,
      totalPages,
      page,
    });
  } catch (error) {
    console.log(error, "error while slection date query");
    throw error;
  }
};












const DownloadSalesReport = async (req, res, next) => {
  const { startDate, endDate, period } = req.query;

  try {
    const salesReport = await getSalesReportDate( period,startDate,endDate,0,0,0);

    console.log(salesReport);

    const pdfDoc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );
    pdfDoc.pipe(res);

    pdfDoc.fontSize(20).text("Sales Report", { align: "center" }).moveDown(2);

    let consolidatedTotal = 0;

    for (let i = 0; i < salesReport.length; i++) {
      const report = salesReport[i];

      consolidatedTotal +=
        report.discount > 0
          ? report.finalTotalAfterDiscount
          : report.totalAmount;

      if (pdfDoc.y > 700) {
        pdfDoc.addPage();
        pdfDoc.moveDown(1);
      }

      pdfDoc.fontSize(12).font("Helvetica-Bold");
      pdfDoc.text(`Report ${index + 1}`, { continued: false }).moveDown(0.6);

      pdfDoc.fontSize(10).font("Helvetica");
      pdfDoc.text(
        `Order Date: ${new Date(report.createdAt).toLocaleDateString()}`
      );
      pdfDoc.text(
        `Customer Name: ${
          report.user.firstName + " " + salesReport.user.lastName
        }`
      );
      pdfDoc.text(`Payment Method: ${report.paymentDetails.method}`);

      const table = {
        title: "Product Details",
        headers: [
          "Product Name",
          "Order Status",
          "Quantity",
          "Unit Price (RS)",
          "Total Price (RS)",
        ],
        rows: report.items.map((item) => [
          item.product.productName,
          item.status,
          item.quantity.toString(),
          item.product.price.toFixed(2),
          item.price.toFixed(2),
        ]),
      };

      try {
        await pdfDoc.table(table, {
          prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(8),
          width: 400,
          columnsSize: [200, 70, 70, 70, 70],
          padding: 5,
          align: "center",
          borderWidth: 0.5,
          rowOptions: { borderColor: "#cccccc" },
          header: { fillColor: "#f2f2f2", textColor: "#333333" },
        });
      } catch (error) {
        console.error("Error generating table:", error);
      }

      pdfDoc.moveDown(0.2);
      pdfDoc
        .font("Helvetica-Bold")
        .fontSize(10)

        .text( `Final Product Discount: RS. ${salesReport.totalDiscount.toFixed(2)}`)
        .text(`Final Amount: RS. ${salesReport.totalAmount.toFixed(2)}`);

      pdfDoc.moveDown(1);
      if (index < salesReport.length - 1 && pdfDoc.y > 650) {
        pdfDoc.addPage();
      }
    }

    pdfDoc.moveDown(2);
    pdfDoc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total Order amount:", { align: "left" })
      .moveDown(0.2);
    pdfDoc.moveDown(0.2);
    pdfDoc
      .lineWidth(1)
      .strokeColor("#333333")
      .moveTo(50, pdfDoc.y)
      .lineTo(200, pdfDoc.y)
      .stroke()
      .moveDown(0.5);
    pdfDoc
      .fontSize(10)
      .font("Helvetica")
      .text(`RS. ${consolidatedTotal.toFixed(2)}`, { align: "left" });

    pdfDoc.end();
  } catch (error) {
    console.error("Error whilet generationg sales report pdf:", error);
    next(error);
  }
};
