//dotenv setup
import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userAuthRoutes from './routes/AuthenticationRoutes/userAuth.route.js'
import adminAuthRoutes from './routes/AuthenticationRoutes/adminAuth.route.js'
import adminRoutes from './routes/admin.route.js'

import userRoutes from './routes/user.route.js'
import { errorHandler } from './middlewares/errorMiddleware.js'
import { successHandler } from './middlewares/successMiddleware.js'
import connectDB from './config/db.js'



//db call
connectDB()

//configuring app
const app = express()



// //middlewares
app.use(cors({
    origin:"http://localhost:5173", //Specify the exact origin
    credentials:true // Allow credentials (cookies, authorization headers, etc.)
}))//cross origin resource sharing we will study more about this later in integration of project!
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(morgan('dev'))




app.use(successHandler)
//define routes

//authentication seperation user and admin
app.use('/api/v1/user/auth',userAuthRoutes)
app.use('/api/v1/admin/auth',adminAuthRoutes)

//mainroutes
app.use('/api/v1/admin',adminRoutes) //This endpoint is typically used for managing admin-specific functionalities and operations in your application. Admin operations generally include managing users, orders, products, categories,
app.use('/api/v1/user',userRoutes)//This endpoint is used for handling user-specific actions, which generally involve the customer side of the application. These actions might include viewing products, placing orders, managing account details, and more.

//global error handling?
app.use(errorHandler)



//server
const PORT =process.env.PORT || 1981

app.listen(PORT,() => {
    console.log(`server running at ${PORT} successfully`)
})