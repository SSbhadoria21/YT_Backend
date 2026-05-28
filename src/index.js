import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path:"./.env"})
import connectDB from "./db/index.js";

connectDB()














// import express from "express";
// const app = express()

// ( async ()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
//        app.on("error",(err)=>{
//         console.log("Error in connecting to the database",err)
//         throw err
//        })

//          app.listen(process.env.PORT,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//          })
       
//     } catch (error) {
//         console.log(error);
//         throw error
        
        
//     }
// })()