import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

// routes declaration
//ye userRouter user.router.js me jo bhi kaam hoga vo yhan chalega
app.use('/api/v1/users',userRouter)

//http//:localhost:8000/api/v1/users/


export {app}