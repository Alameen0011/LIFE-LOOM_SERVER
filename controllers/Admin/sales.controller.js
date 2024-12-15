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

    // Title
    pdf.setFontSize(16);
    pdf.text("Sales Report", 105, 10, { align: "center" });

    // Table
    pdf.autoTable({
      startY: 20,
      head: [
        [
          "Order ID",
          "Customer Name",
          "Date",
          "Payment Method",
          "Price",
        ],
      ],
      body: salesReport.salesReport.map((item) => [
        item._id,
        item.user.firstName,
        new Date(item.createdAt).toLocaleString(),
        item.paymentDetails.method,
        item.totalAmount.toFixed(2),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      tableWidth: "auto", // Ensures the table adjusts based on page width
      headStyles: {
        fontSize: 11,
        halign: "center",
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        valign: "middle",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 40 }, // Order ID
        1: { halign: "left", cellWidth: 50 }, // Customer Name
        2: { halign: "center", cellWidth: 50 }, // Date
        3: { halign: "center", cellWidth: 30 }, // Payment Method
        4: { halign: "right", cellWidth: 20 }, // Price
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        const pageWidth = pdf.internal.pageSize.width;
        const tableWidth = data.table.width;

        if (tableWidth > pageWidth) {
          pdf.autoTable({
            ...data.settings,
            tableWidth: pageWidth - 20, // Scale down table width to fit the page
          });
        }
      },
    });

    const pdfData = pdf.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SalesReport.pdf"
    );

    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.error("Error while generating sales report PDF:", error);
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


