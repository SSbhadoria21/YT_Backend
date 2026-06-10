import mongoose,{Schema} from "mongoose";
const SubscriptionsSchema = new Schema({
    subscriber : {
        type: Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
    },
    channel : {
        type: Schema.Types.ObjectId, //one who to whom "subscriber" is subscribingn 
        ref:"User"
    }
},{timestamps:true})


export const Subscription = mongoose.model("Subscription",SubscriptionsSchema) 
