import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiError } from './utils/apiError.js';

const app = express()

//cors se hum apne backend ko frontend se connect krte hain, or cookieParser se hum cookies ko parse krte hain, toh yahan hum cors or cookieParser dono ka use krenge, toh pehle hum cors ka use krenge taaki hum apne backend ko frontend se connect kr sake, or uske baad hum cookieParser ka use krenge taaki hum cookies ko parse kr sake, toh chaliye ab hum app.use(cors()) ka use krte hain taaki hum apne backend ko frontend se connect kr sake, or uske baad hum app.use(cookieParser()) ka use krte hain taaki hum cookies ko parse kr sake.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// ab kuch best practices and settings isse hum frontend se jo bhi data hoga vo le skte h
app.use(express.json({limit: '20kb'}))
// jb url se data aata h
app.use(express.urlencoded({extended:true,limit: '20kb'}))

//ab kuch files ko mujhe store krna h, toh uske liye hum express.static ka use krte hain, toh chaliye ab hum app.use(express.static('public')) ka use krte hain taaki hum apne public folder ko static bana sake, or uske baad hum app.use('/uploads', express.static('uploads')) ka use krte hain taaki hum apne uploads folder ko static bana sake, or uske baad hum app.use('/avatars', express.static('avatars')) ka use krte hain taaki hum apne avatars folder ko static bana sake.
app.use(express.static('public'))

//cookie parser ka kaam h ki me server se borwser ki jo cookies h unko parse use krna or unhe set krna 
app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'

// routes declaration
//ye userRouter user.router.js me jo bhi kaam hoga vo yhan chalega
app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos',videoRouter)
app.use('/api/v1/tweets',tweetRouter)
app.use('/api/v1/likes',likeRouter)
app.use('/api/v1/comments',commentRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/subscriptions',subscriptionRouter)
app.use('/api/v1/dashboard',dashboardRouter)
app.use('/api/v1/healthcheck',healthcheckRouter)

// Global Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
        data: null
    });
});

//http//:localhost:8000/api/v1/users/


export {app}