import mongoose  from "mongoose";

const offerSchema = new mongoose.Schema({

    name:{
        type:String,
        trim:true,
        required:true,
    },
    offerPercentage:{
        type:Number,
        required:true,
    },
    startDate:{
        type:Date,
        default:Date.now,
    },
    endDate:{
        type:Date,
        
    },
    offerType:{
        type:String,
        enum:['product',"category"],
        required:true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Target ID is required']  // For product ID or category ID
    },
    targetName: {
        type: String,
        required: [true, 'Target name is required']  // For product name or category name
    },
    status:{
        type:String,
        enum:["active","expired","upcoming"],
        required:true,
        default:"upcoming"

    }

})

offerSchema.index({endDate: 1},{expireAfterSeconds : 0})

offerSchema.pre('save',function(next){
    const currentDate = new Date()

    if(this.startDate > currentDate){
        this.status = "upcoming"
    }else if(this.endDate < currentDate){
        this.status = "expired"
    }else {
        this.status = "active";
    }
    next();

})




const Offer = mongoose.model("offer",offerSchema)


export default Offer