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
import "./jobs/cronJob.js"



//db call
connectDB()

//configuring app
const app = express()



// //middlewares
app.use(cors({
    origin:"http://localhost:5173", 
    credentials:true 
}))
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
app.use('/api/v1/admin',adminRoutes) 
app.use('/api/v1/user',userRoutes)

//global error handling
app.use(errorHandler)



//server
const PORT =process.env.PORT || 1981

app.listen(PORT,() => {
    console.log(`server running at ${PORT} successfully`)
})