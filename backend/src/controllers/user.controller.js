import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DEFAULT_COVERIMAGE_URL, DEFAULT_AVATAR_URL } from "../constants.js";

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


export {registerUser};