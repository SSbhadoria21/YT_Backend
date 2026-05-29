import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path:"./.env"})
import connectDB from "./db/index.js";
import { app } from "./app.js";


//jb db k index,js me humne connection kia h mongodb se, or usme async use kia h toh yahan hum promises ka use krke connection establish kr skte h, ya phir async await ka use krke bhi connection establish kr skte h, dono tarike sahi h, lekin async await thoda clean code likhne me help krta h, toh yahan hum async await ka use krenge, toh hum ek function banayenge jiska naam h connectDB, or usme hum mongodb se connection establish krenge, or usme error handling bhi krenge, toh agar connection establish nahi hota hai toh hum error ko catch krke console me print kr denge, or agar connection establish ho jata hai toh hum console me print kr denge ki connection successful hai, toh chaliye ab hum connectDB function ko call karte hain taaki connection establish ho jaye.

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at ${process.env.PORT || 8000}`);
    })
    app.on('error',(err)=>{
        console.log("Error in connecting to the database",err)
        throw err
    })
})
.catch((err)=>{
    console.log("MONGO Db connection failed",err);
    
})














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