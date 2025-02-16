import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DEFAULT_COVERIMAGE_URL, DEFAULT_AVATAR_URL } from "../constants.js";
import jwt from "jsonwebtoken"

//Generate Access and Refresh Tokens Method
const generateTokens = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false});  //We don't have password and other required fields so we need skip that part and directly manipulate database

        return {accessToken, refreshToken};        

    }catch(error){
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


const registerUser = asyncHandler(async (req, res)=>{
    //Get user details from frontend

    console.log("Received Body:", req.body);
    
    const {fullName, email, userName, password} = req.body
    
    //Validations
    if(fullName === ""){
        throw new ApiError(400, "Full Name is Required");
    }
    if(email === ""){
        throw new ApiError(400, "Email is Required");
    }
    if(userName === ""){
        throw new ApiError(400, "UserName is Required");
    }
    if(password === ""){
        throw new ApiError(400, "Password is Required");
    }
    
    //Check if user already exist: userName and email
    if(await User.findOne({userName})){
        throw new ApiError(409, "Username already exist")
    }
    if(await User.findOne({email})){
        throw new ApiError(409, "Acount already exist with this email")
    }
    
    
    //Check avtar and cover image (if empty then default) (else upload on cloudinary)
    //console.log("Received files:", req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    console.log("Avatar Path:", avatarLocalPath);
    console.log("Cover Image Path:", coverImageLocalPath);
    /*
    if(!avtarLocalPath){
        throw new ApiError(400, "Avatar file is req.");
    }
    */
    let coverImage = null , avatar = null;
    try{
        if(coverImageLocalPath) coverImage = await uploadCloudinary(coverImageLocalPath);
        else coverImage = {url: DEFAULT_COVERIMAGE_URL};
        if(avatarLocalPath) avatar = await uploadCloudinary(avatarLocalPath);
        else avatar = {url: DEFAULT_AVATAR_URL};
    }catch(error){
        throw new ApiError(500, "Failed to upload images");
    }
    

    //create user object and create entry in DB
    const user =await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })
    
    
    //remove password and refresh token from response field
    const isUserExist = await User.findById(user._id).select(
        "-password -refreshToken"                                //removed password and refreshToken from the fields
    )                          
    
    //check if user is created or not
    if(!isUserExist){
        throw new ApiError(500, "Something went wrong, try again later");
    }
    
    //return res
    return res.status(201).json(
        new ApiResponse(201, isUserExist, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res)=>{

    // req body -> data
    
    const {emailOrUserName, password} = req.body;

    if(!emailOrUserName){
        throw new ApiError(400, "Username or Email is required");
    }

    // userName/email verify
    const user = await User.findOne({
        $or: [{userName: emailOrUserName}, {email: emailOrUserName}]
    });

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    
    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials");
    }



    // access and refresh token generation
    const {accessToken, refreshToken} = await generateTokens(user._id);


    // send secure cookies having tokens
    const options = {
        httpOnly: true,
        secure: true,           //This makes cookies secured by not allowing frontend users to modify cookies (view only)
        
    }

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged In Successfully"
            )
        )

})


const logoutUser = asyncHandler(async(req, res)=>{
    
    //Find User
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    //Clear Cookies and tokens
    const options = {
        httpOnly: true,
        secure: true,           //This makes cookies secured by not allowing frontend users to modify cookies (view only)
        
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))

})


const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken   //Second one is for mobile access
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Req");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user =await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token");
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is Expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true,           //This makes cookies secured by not allowing frontend users to modify cookies (view only)
            
        }
    
        const {accessToken, newRefreshToken} = await generateTokens(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed Successfully"
            ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword, confirmNewPassword} = req.body;

    if(newPassword !== confirmNewPassword){
        throw new ApiError(401, "New Password Does not match the confirm password");
    }
    
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password");
    }


    user.password = newPassword;  
    await user.save({validateBeforeSave: false});
    
    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password Changed Successfully"))

})


const getCurrentUser = asyncHandler(async(req, res)=>{
    return res 
            .status(200)
            .json(200, req.user, "current user fetched successfully")
})

const updateAccoundDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body;         //File updates and change must be dealt seperately 

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}                 //Used to return the updated value
    ).select("-password");

    return res
            .status(200)
            .json(new ApiResponse(200, user, "Account Details Updated Successfully"))

})

const updataAvatar = asyncHandler(async(req, res)=>{
    const localAvatarPath = req.file?.path;

    if(!localAvatarPath){
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadCloudinary(localAvatarPath);

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}                        
    ).select("-password")

    return res
            .status(200)
            .json(new ApiResponse(200, user, "Avatar Changed Successfully"))
})

const updataCoverImage = asyncHandler(async(req, res)=>{
    const localCoverImagePath = req.file?.path;

    if(!localCoverImagePath){
        throw new ApiError(400, "Cover Image file is missing");
    }

    const coverImage = await uploadCloudinary(localCoverImagePath);

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}                        
    ).select("-password")

    return res
            .status(200)
            .json(new ApiResponse(200, user, "Cover Image Successfully"))

})


export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccoundDetails,
    updataAvatar,
    updataCoverImage
};