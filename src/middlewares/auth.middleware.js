import { User } from "../models/User.model";
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header?.authorization?.replace("Bearer ","")
        if(!token) {
            throw new apiError(404,"Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new apiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Access Token",)
    }
});