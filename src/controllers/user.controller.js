import {asyncHandler} from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import {User} from '../models/User.model.js'
import {uploadonCloudinary} from '../utils/Cloudinary.js'
import { Apiresponse } from '../utils/Apiresponse.js';

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(201).json({
    //     message: "yt project "
    // })

    //get user details from frontend
    //validation - alteast not empty
    //check if user already exists : username or email
    //check all images, check for avatar, if avatat is there then upload it to cloudinary, or else set default avatar
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

export {registerUser}