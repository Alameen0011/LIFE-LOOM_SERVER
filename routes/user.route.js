import express from "express";
import {
  handleGetHomeProducts,
  handleGetProducts,
  handleSingleProduct,
} from "../controllers/User/product.controller.js";
import { userAuth } from "../middlewares/authMiddleware.js";
import {
  handleAddAddress,
  handleAddToCart,
  handleDeleteAddress,
  handleDeleteCart,
  handleFetchAllAddress,
  handleFetchingCart,
  handleFetchSingleAddress,
  handleGetUserProfile,
  handleInvoiceDownload,
  handleResetPassword,
  handleUpdateAddress,
  handleUpdateCartQuantity,
  handleUpdateUserProfile,
} from "../controllers/User/user.controller.js";
import { handleApplyCoupon, handleCancelOrder, handleFetchOrder, handleGetCoupon, handleGetSingleOrder, handlePlaceOrder, handleRetryOrderPayment, handleReturnRequest } from "../controllers/User/order.controller.js";
import { handleFetchActiveCategory } from "../controllers/User/category.controller.js";
import { handleAddToWishlist, handleFetchWishlist, handleRemoveWishlist } from "../controllers/User/wishlist.controller.js";
import { handleGetUserWallet } from "../controllers/User/wallet.controller.js";
import { handleApplyRefferalCode, handleCheckRefferalstatus, handleFetchReferralCode, handleSkipRefferalOffer } from "../controllers/User/referral.controller.js";

const router = express.Router();


router.get("/getProducts", handleGetProducts);
router.get("/homeProducts",handleGetHomeProducts)
router.get("/getProduct/:id", handleSingleProduct);
router.get('/getActiveCategory',handleFetchActiveCategory)

router.use(userAuth);

router.get("/getUserProfile", handleGetUserProfile);
router.patch("/updateUserProfile", handleUpdateUserProfile);

//resetpassword api
router.patch('/resetPassword',handleResetPassword)

//Address Management apis
router.get("/getAllAddress", handleFetchAllAddress);
router.get("/getSingleAddress/:id", handleFetchSingleAddress);
router.post("/addAddress", handleAddAddress);
router.put("/updateAddress/:id", handleUpdateAddress);
router.delete("/deleteAddress/:id",handleDeleteAddress)

//Cart management apis
router.get("/getCartItem", handleFetchingCart);
router.post("/addToCart", handleAddToCart);
router.put('/cart/updateQuantity',handleUpdateCartQuantity)
router.delete("/clearCart", handleDeleteCart);


//order management api
router.post('/order/placeOrder',handlePlaceOrder)
router.get('/order/getOrder',handleFetchOrder)
router.post('/order/retryPayment',handleRetryOrderPayment)
router.get('/order/getSingleOrder/:id',handleGetSingleOrder)
router.patch('/order/:orderId/item/:itemId/cancelOrder',handleCancelOrder)
router.post('/order/:orderId/product/:itemId/returnRequest',handleReturnRequest)

//couon api
router.post("/order/applyCoupon",handleApplyCoupon)
router.get("/getCoupons",handleGetCoupon)

//wallet api
router.get("/wallet",handleGetUserWallet)


//refferal
router.route("/refferal").get(handleFetchReferralCode)
router.post("/refferal",handleApplyRefferalCode)
router.post("/refferal/skip",handleSkipRefferalOffer)
router.get("/refferal/checkStatus",handleCheckRefferalstatus)




//wishlist api
router
    .route('/wishList')
    .post(handleAddToWishlist)  
    .delete(handleRemoveWishlist) 
    .get(handleFetchWishlist); 

router.get("/invoice",handleInvoiceDownload)

export default router;
