import {asyncHandler} from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import {User} from '../models/User.model.js'
import {uploadonCloudinary} from '../utils/Cloudinary.js'
import { Apiresponse } from '../utils/Apiresponse.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';


const generateAccessAndRefreshToken = async(userId)=>{
   try {
     const user = await User.findById(userId)
     const accessToken = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()

    user.refreshToken = refreshToken // save the refresh token in db
    await user.save({validateBeforeSave: false}) // save the user document with the new refresh token, and skip validation

    return {accessToken,refreshToken}

   } catch (error) {
    throw new apiError(500,"Error in generating access and refresh token")
   }
}

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(201).json({
    //     message: "yt project "
    // })

    //get user details from frontend
    //validation - alteast not empty
    //check if user already exists : username or email
    //check all images, check for avatar, if avatar is there then upload it to cloudinary, or else set default avatar
    //create user object in db - create entry in db
    //remove password and refresh token from response
    //check for user creation, if succes then send response, or else send error response

    //get user details from frontend
    const {fullName,email,username,password} = req.body
    // console.log("email: ", email);

    if([fullName,email,username,password].some((field)=>field?.trim() === "")){
        throw new apiError(400,"Full name is required")
    }

    const existedUser = await User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new apiError(409,"User already exists with this email or username")
    }


   const avatarLocalPath = req.files?.avatar?.[0]?.path

//    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

 let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

   if(!avatarLocalPath){
    throw new apiError(400,"Avatar is required")
   }
   
   //upload them to cloudinary
   const avatar = await uploadonCloudinary(avatarLocalPath)
   const coverImage = await uploadonCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new apiError(400,"Error in uploading avatar")
   }

   const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

   })
   const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken "
   )

   if(!createdUser){
    throw new apiError(500,"something went wrong in creating user")
   }
   return res.status(201).json(
    new Apiresponse(201,"User created successfully",createdUser)
   )

})

const loginUser = asyncHandler(async (req,res)=>{
    //req - data
    //username or email and password
    //find user in db based on username or email
    //password match
    //access and refresh token create
    //send cookie and response

    const {username,email,password} = req.body
    if([username,email,password].some((field)=>field?.trim() === "")){
        throw new apiError(400,"Username or email and password are required")
    }

    if(!email && !username){
        throw new apiError(400,"username or Email is required")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new apiError(404,"User not found with this email or username")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401,"Invalid password")
    }

    const  {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true,

    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new Apiresponse(200,{user: loggedIn,accessToken,refreshToken},"User logged in successfully"))


})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set: {refreshToken:undefined},
        
    },{new:true})

      const options = {
        httpOnly : true,
        secure: true,

    }

    return res
    .status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(
        new Apiresponse(200,{},"user Logged out")
    )
})

const refreshAccessToken = asyncHandler( async (req,res)=>{
    const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!IncomingRefreshToken) {
        throw new apiError(401,"unauthorized Request")
    }

   try {
     const decodedToken = jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_EXPIRY)
 
    const user = await User.findById(decodedToken?._id)
 if(!user) {
         throw new apiError(401,"Invalid Refresh Token")
 
     }
 
     if(IncomingRefreshToken !== user?.refreshToken ){
         throw new apiError(401,"Refresh Token is Expired or used")
     }
 
     const options = {
         httpOnly:true,
         secure: true
     }
 
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
      return res.status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
         new Apiresponse(
             200,{accessToken,refreshToken: newRefreshToken},"Access Token Refreshed"
         )
      )
   } catch (error) {
    throw new apiError(401,error?.message || "Invalid refresh token")
   }
})


const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword,confPassword} = req.body

    // if(newPassword === c onfPassword)
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200)
    .json(new Apiresponse(
        200,
        {},"Password Changed SuccessFully"
    ))
})


const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(new Apiresponse(
        200, req.user,"current user fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName,email} = req.body
    //agar koi file update krna ho toh uske liye alag controller likhna chahiye best practices
    if( !fullName || !email){
        throw new apiError(400,"All fields are required")
    }
    const user = User.findByIdAndUpdate(req.user?._id,
        {$set: {fullName,email:email}},
        {new:true}
    ).select("-password")

    return res.status(200).json( new Apiresponse (200,user,"Account Details Updated Successfully"))
})


const updateUserAvatar = asyncHandler( async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar File is Missing")
    }

    const avatar = await uploadonCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new apiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {$set:{avatar:avatar.url}},
        {new:true}
    ).select("-password")

    return res.status(200).json(new Apiresponse(200,user,"Avatar Updated Successfully"))
})


const updateUserCoverImage = asyncHandler( async (req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new apiError(400,"CoverImage File is Missing")
    }

    const coverImage = await uploadonCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new apiError(400,"Error while uploading on cover Image")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {$set:{coverImage:coverImage.url}},
        {new:true}
    ).select("-password")

    return res.status(200).json(new Apiresponse(200,user,"Cover Image Updated Successfully"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new apiError(400,"username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                 from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount :{
                    $size : "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscribersCount:1,
                channelSubscribedToCount: 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1,
            }
        }
    ])

    if(!channel?.length){
        throw new apiError(404,"Channel does not exist")
    }

    return res.status(200)
    .json( new Apiresponse(200,channel[0],"User Channel Fetched Successfully"))
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match: { 
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline: [
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar : 1

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(new Apiresponse(200,user[0].watchHistory,"Watch History Fetched Successfully"))
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory}