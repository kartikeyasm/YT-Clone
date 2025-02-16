import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler( async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace(/^Bearer\s/, "");
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new ApiError(403, "Invalid or Expired Token");
        }
        if (!decodedToken || !decodedToken._id) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user){
            // Pending
            throw new ApiError(403, "Invalid or Expired Access Token")
        }
    
        req.user = user;
        return next();   //It is used to tell that move to next method
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
})