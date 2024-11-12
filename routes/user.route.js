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
  handleResetPassword,
  handleUpdateAddress,
  handleUpdateCartQuantity,
  handleUpdateUserProfile,
} from "../controllers/User/user.controller.js";
import {
  addAddressValidationRules,
  validate,
} from "../middlewares/validationMiddleware.js";
import { handleCancelOrder, handleFetchOrder, handleGetSingleOrder, handlePlaceOrder } from "../controllers/User/order.controller.js";
import { handleFetchActiveCategory } from "../controllers/User/category.controller.js";

const router = express.Router();

/* basically this api helps to achieve basic user operation like user profile management
    Acount managment, order management, wishlist , cart, product operation . */

/*example routes under  /api/v1/user:
      Account managment api's,
      Order management api's,
      product operation api's,
      whishlist and cart api's

    */
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
router.get('/order/getSingleOrder/:id',handleGetSingleOrder)
router.patch('/order/:orderId/item/:itemId/cancelOrder',handleCancelOrder)




export default router;
