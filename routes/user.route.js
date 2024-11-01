import express from 'express';
import { handleGetProducts, handleSingleProduct } from '../controllers/User/product.controller.js';
import { userAuth } from '../middlewares/authMiddleware.js';
import { handleAddAddress, handleFetchAllAddress, handleFetchSingleAddress, handleGetUserProfile, handleUpdateAddress, handleUpdateUserProfile } from '../controllers/User/user.controller.js';
import { addAddressValidationRules, validate } from '../middlewares/validationMiddleware.js';


const router  = express.Router()

/* basically this api helps to achieve basic user operation like user profile management
    Acount managment, order management, wishlist , cart, product operation . */


    /*example routes under  /api/v1/user:
      Account managment api's,
      Order management api's,
      product operation api's,
      whishlist and cart api's

    */
      router.get('/getProducts',handleGetProducts)
      router.get('/getProduct/:id',handleSingleProduct)


      router.use(userAuth)

      router.get('/getUserProfile',handleGetUserProfile)
      router.patch('/updateUserProfile',handleUpdateUserProfile)

//Address Management apis
      router.post('/addAddress', handleAddAddress)
      router.get('/getAllAddress',handleFetchAllAddress)
      router.get('/getSingleAddress/:id',handleFetchSingleAddress)
      router.put('/updateAddress/:id',handleUpdateAddress)

   
   


      


export default router