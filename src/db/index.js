// hum db se boht baat krenge toh hum is pure code ka ek wrapper bana lete h, or jahan use krna hoga vhan krlenge
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const connectToDB = async ()=> {
try {
  const connectionInstance =   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
  console.log(`\n MONGODB COnnected  !! DB Host : ${connectionInstance.connection.host} `);
  
} catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1)
    throw error
    
}
}

export default connectToDB;