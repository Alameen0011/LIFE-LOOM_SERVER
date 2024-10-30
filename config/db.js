import mongoose from "mongoose";


const connectDB = async() => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL)

       console.log(`DB connected successfully ${connection.connection.host}`)
        
    } catch (error) {
        console.log("database connection error"+error)
    }
}

export default connectDB