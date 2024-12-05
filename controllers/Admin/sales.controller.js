import Order from "../../models/order.model.js";

import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

    console.log(dateSelection, "date selection in custom date part +++++");

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

export const handleSalesPdfDownload = async (req, res, next) => {
  console.log(req.query);

  const { startDate, endDate, period } = req.query;

  try {
    const salesReport = await getSalesReportDate(
      period,
      startDate,
      endDate,
      0,
      0,
      0
    );

    console.log(salesReport, "====sales report");

    const pdf = new jsPDF();

    // title
    pdf.text("Sales Report", 10, 10);

    // table
    pdf.autoTable({
      startY: 20,
      head: [
        [
          "Order ID",
          "Customer Name",
          "Date",
          // "Items",
          "Payment Method",
          "Price",
        ],
      ],
      body: salesReport.salesReport.map((item) => [
        item._id,
        item.user.firstName,
        new Date(item.createdAt).toLocaleString(),
        // item.totalQuantity,
        item.paymentDetails.method,
        item.totalAmount.toFixed(2),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      tableWidth: "wrap",
      headStyles: {
        fontSize: 11,
        halign: "center",
      },
      bodyStyles: {
        valign: "middle",
        halign: "left",
      },
      margin: { left: 10 },
    });

    const pdfData = pdf.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SalesReport.pdf"
    );

    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.error("Error whilet generationg sales report pdf:", error);
    next(error);
  }
};

export const handleDownloadSalesXl = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    const reports = await getSalesReportDate(
      period,
      startDate,
      endDate,
      0,
      0,
      0
    );

    console.log(reports, "reportsss ++++");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Product Name", key: "productName", width: 25 },
      { header: "Name", key: "Name", width: 20 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Unit Price", key: "price", width: 15 },
      { header: "total", key: "orderTotal", width: 15 },

      { header: "orderDate", key: "orderDate", width: 15 },
      { header: "Payment Method", key: "paymentMethod", width: 20 },
    ];
    reports.salesReport.forEach((report) => {
      const orderDate = new Date(report.createdAt).toLocaleDateString();

      const products = report.items.map((item) => ({
        productName: item.product.productName,
        Name: report.user.firstName + " " + report.user.lastName,
        quantity: item.quantity,
        price: item.price,
        orderTotal:(item.price * item.quantity),
        orderDate: orderDate,
        paymentMethod: report.paymentDetails.method,
      }));

      console.log(products, "products -------");

      products.forEach((product) => {
        worksheet.addRow(product);
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error, "ajdflsjdf aderer error");
    res.status(500).json({ message: "Failed to generate sales report", error });
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

    // Title
    pdf.text("Invoice", 10, 10);

    // Customer Details Section
    pdf.setFontSize(12);
    pdf.text(
      `Customer Name: ${orderData.user.firstName} ${orderData.user.lastName}`,
      10,
      20
    );
    pdf.text(`Email: ${orderData.user.email}`, 10, 25);
    pdf.text(`Phone: ${orderData.user.phone}`, 10, 30);

    // Shipping Details Section
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

    // Order Details Section
    pdf.text(`Order ID: ${orderData._id}`, 10, 70);
    pdf.text(
      `Invoice Date: ${new Date(orderData.createdAt).toLocaleDateString()}`,
      10,
      75
    );

    // Table for Items
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

    // Total Amount Section
    pdf.text(
      `Subtotal: $${orderData.totalAmount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 10
    );
    pdf.text(
      `Discount: -$${orderData.discount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 15
    );
    pdf.text(
      `Saved Amount: $${orderData.savedAmount.toFixed(2)}`,
      10,
      pdf.lastAutoTable.finalY + 20
    );
    pdf.text(
      `Total Amount: $${orderData.finalTotalAfterDiscount.toFixed(2)}`,
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

    // PDF generation and sending as response
    const pdfData = pdf.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Invoice.pdf");
    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.log(error, "error while invoice downloading");
  }
};
