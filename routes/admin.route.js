import express from 'express';
import { handleaddCategory, handleFetchCategories, handleSoftDeleteCategory, handleUpdateCategory, handleupdateCategoryStatus } from '../controllers/Admin/category.controller.js';
import { handleUpdateUserStatus } from '../controllers/Admin/admin.controller.js';
import { handleAddProduct, handleFetchAllProducts, handleFetchSingleProduct, handleSoftDeleteProduct, handleUpdateProduct } from '../controllers/Admin/product.controller.js';
import { adminAuth } from '../middlewares/authMiddleware.js';
import { handleAdminCancelOrder, handleCancelOrders, handleFetchAllOrders, handleGetSingleOrderAdmin, handleOrderStatusChange } from '../controllers/Admin/order.controller.js';

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