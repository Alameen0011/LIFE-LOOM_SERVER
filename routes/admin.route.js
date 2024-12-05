import express from 'express';
import { handleaddCategory, handleFetchCategories, handleSoftDeleteCategory, handleUpdateCategory, handleupdateCategoryStatus } from '../controllers/Admin/category.controller.js';
import { handleUpdateUserStatus } from '../controllers/Admin/admin.controller.js';
import { handleAddProduct, handleFetchAllProducts, handleFetchSingleProduct, handleSoftDeleteProduct, handleUpdateProduct } from '../controllers/Admin/product.controller.js';
import { adminAuth } from '../middlewares/authMiddleware.js';
import { handleAdminCancelOrder, handleCancelOrders, handleFetchAllOrders, handleGetSingleOrderAdmin, handleOrderItemStatusChange, handleOrderStatusChange, handleReturnResponse } from '../controllers/Admin/order.controller.js';
import { handleAddOffer, handleDeleteOffer, handleFetchAllOffers, handleSearchProduct } from '../controllers/Admin/offer.controller.js';
import { handleCreateCoupon, handleDeleteCoupon, handleFetchAllCoupon } from '../controllers/Admin/coupon.controller.js';
import { handleDownloadSalesXl, handleGetSalesReport, handleInvoiceDownload, handleSalesPdfDownload } from '../controllers/Admin/sales.controller.js';
import { handleGetBestSelling, handleGetChartData, handleGetDashboardData } from '../controllers/Admin/chart.controller.js';

const router = express.Router()


router.use(adminAuth)
router.patch('/updateStatus',handleUpdateUserStatus)


router.get('/getCategories',handleFetchCategories)
router.post('/addCategory',handleaddCategory)
router.patch('/updateCategoryStatus',handleupdateCategoryStatus)
router.put('/updateCategory',handleUpdateCategory)
router.delete('/category/:id/delete',handleSoftDeleteCategory)



router.post('/addProduct',handleAddProduct)
router.get('/products',handleFetchAllProducts)
router.delete('/products/:id/delete',handleSoftDeleteProduct)
router.get('/products/:id/edit',handleFetchSingleProduct)
router.put('/updateProduct/:id',handleUpdateProduct)


router.get("/order/fetchOrder",handleFetchAllOrders)
router.patch("/order/:orderId/cancelOrder",handleAdminCancelOrder)
router.patch("/order/status/:orderId",handleOrderStatusChange)
router.get('/order/getSingleOrder/:id',handleGetSingleOrderAdmin)
router.patch('/order/:orderId/item/:itemId/cancelOrder',handleCancelOrders)
router.patch('/order/:orderId/item/:itemId/itemOrderStatusChange',handleOrderItemStatusChange)
router.post('/order/:orderId/returnResponse',handleReturnResponse)


router.get('/offers/fetchOffers',handleFetchAllOffers)
router.post('/offer/addOffer',handleAddOffer)
router.delete('/offer/deleteOffer',handleDeleteOffer)
router.get('/offer/getProduct',handleSearchProduct)


router.get('/coupon/getCoupons',handleFetchAllCoupon)
router.post('/coupon/createCoupon',handleCreateCoupon)
router.delete('/coupon/:id',handleDeleteCoupon)


router.get("/sales",handleGetSalesReport)
router.get("/salesData",handleGetChartData)
router.get("/bestSelling",handleGetBestSelling)
router.get("/metricsDashboard",handleGetDashboardData)


router.get("/salesPdf",handleSalesPdfDownload)
router.get("/salesXl",handleDownloadSalesXl)


router.get("/invoice",handleInvoiceDownload)






/* basically used for admin operation such as admin have to manage users 
eg:-at(  USER MANAGEMENT PART  ) 
    Retrieve all list of users
    update Specific user details
    Remove user from system
    block a user


    





    at (PRODUCT MANAGEMENT PART)
    Adding a new product
    Update a specific product
    Delete a product

    at(ORDER MANAGEMENT PART)
    View all orders
    Update order status

*/



// User Management:










//Product Management:









//Order Management:




export default router